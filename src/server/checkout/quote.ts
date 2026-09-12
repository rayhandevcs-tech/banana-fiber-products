import 'server-only';

import type { Prisma } from '@/generated/prisma/client';
import { db } from '@/server/db/client';
import { effectivePrice } from '@/lib/format/money';
import type { LocalizedText } from '@/types/content';

/**
 * THE AUTHORITATIVE QUOTE
 *
 * Everything a customer is charged is decided here, on the server, from rows
 * read out of PostgreSQL at the moment of asking.
 *
 * The browser contributes exactly two things per line: a product id and a
 * requested quantity. Nothing else it sends is believed — not the price, not
 * the discount, not the name, not the stock it last saw, and certainly not a
 * total. Those all live in a localStorage cart the customer can edit at will,
 * and they go stale the moment the shop changes a price or sells the last
 * unit.
 *
 * The same function is used twice: once to render the checkout page, so the
 * customer reviews real figures rather than their own snapshot, and again
 * inside the order transaction. The second call is not a formality — the
 * first one's answer is already out of date by the time the customer has
 * finished typing their address.
 */

/** What the browser is allowed to ask for. */
export interface RequestedLine {
  productId: string;
  quantity: number;
}

/**
 * Why a line cannot be bought. Each maps to a message the customer can act on
 * — "unavailable" and "only 2 left" call for different responses.
 */
export type LineProblem =
  | 'not-found'
  | 'unavailable'
  | 'out-of-stock'
  | 'insufficient-stock'
  | 'invalid-quantity';

export interface QuoteLine {
  productId: string;
  slug: string;
  name: LocalizedText;
  sku: string;
  imageUrl: string | null;
  /** Current list price, in poisha, straight from the database. */
  pricePoisha: number;
  /** Current per-unit discount, in poisha. */
  discountPoisha: number;
  /** pricePoisha - discountPoisha, the rate actually charged. */
  unitPricePoisha: number;
  quantity: number;
  lineTotalPoisha: number;
  /** Stock as the database reports it right now. */
  stock: number;
  problem: LineProblem | null;
}

export interface DeliveryQuote {
  methodId: string;
  methodCode: string;
  zoneId: string;
  zoneCode: string;
  districtName: string;
  chargePoisha: number;
  /** True when the subtotal reached the rate's free-delivery threshold. */
  isFree: boolean;
  estimatedDays: LocalizedText | null;
}

export interface Quote {
  lines: QuoteLine[];
  subtotalPoisha: number;
  delivery: DeliveryQuote | null;
  deliveryChargePoisha: number;
  totalPoisha: number;
  /** True when every line is buyable at the quantity asked for. */
  isFulfillable: boolean;
}

/** Reasons the delivery half of a quote cannot be produced. */
export type DeliveryProblem =
  | 'district-not-found'
  | 'method-not-found'
  | 'rate-not-found';

export class CheckoutDataError extends Error {
  constructor(readonly problem: DeliveryProblem) {
    super(problem);
    this.name = 'CheckoutDataError';
  }
}

/** Quantities are whole and positive; anything else is a malformed request. */
function isValidQuantity(quantity: number): boolean {
  return Number.isInteger(quantity) && quantity >= 1;
}

/**
 * Price and check every requested line against the database.
 *
 * One query for all products, keyed by id — never one per line, and never the
 * whole catalogue.
 *
 * Lines that cannot be bought are returned WITH their problem rather than
 * dropped. Silently removing something a customer chose, or quietly reducing
 * three to two, would let them pay for an order they never agreed to; the
 * caller shows the problem and lets them decide.
 */
export async function priceLines(
  requested: RequestedLine[],
  client: Prisma.TransactionClient | typeof db = db,
): Promise<QuoteLine[]> {
  const ids = [...new Set(requested.map((line) => line.productId))];
  if (ids.length === 0) return [];

  const products = await client.product.findMany({
    where: { id: { in: ids } },
    include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } },
  });

  const byId = new Map(products.map((product) => [product.id, product]));

  return requested.map((line) => {
    const product = byId.get(line.productId);

    // A product that no longer exists at all. Nothing can be said about it
    // beyond that, so the line is reported with the id the browser sent.
    if (!product) {
      return {
        productId: line.productId,
        slug: '',
        name: { en: '', bn: '' },
        sku: '',
        imageUrl: null,
        pricePoisha: 0,
        discountPoisha: 0,
        unitPricePoisha: 0,
        quantity: line.quantity,
        lineTotalPoisha: 0,
        stock: 0,
        problem: 'not-found' as const,
      };
    }

    const unitPricePoisha = effectivePrice(
      product.pricePoisha,
      product.discountPoisha,
    );

    // Order matters: a withdrawn product is unavailable whatever its stock
    // says, and an impossible quantity is a bad request rather than a stock
    // shortage.
    const problem: LineProblem | null =
      !product.isActive || product.deletedAt !== null
        ? 'unavailable'
        : !isValidQuantity(line.quantity)
          ? 'invalid-quantity'
          : product.stock <= 0
            ? 'out-of-stock'
            : line.quantity > product.stock
              ? 'insufficient-stock'
              : null;

    return {
      productId: product.id,
      slug: product.slug,
      name: { en: product.nameEn, bn: product.nameBn },
      sku: product.sku,
      imageUrl: product.images[0]?.url ?? null,
      pricePoisha: product.pricePoisha,
      discountPoisha: product.discountPoisha,
      unitPricePoisha,
      quantity: line.quantity,
      // Integer poisha throughout: a unit price in poisha multiplied by a
      // whole quantity stays exact, where Taka and a float would not.
      lineTotalPoisha: unitPricePoisha * line.quantity,
      stock: product.stock,
      problem,
    };
  });
}

/**
 * Work out the delivery charge for a district and method.
 *
 * Every figure comes from `delivery_rates`; nothing about a charge is written
 * into this codebase. The district chooses the zone, the zone and the method
 * choose the rate, and the rate carries both the charge and the subtotal above
 * which it is waived.
 */
export async function quoteDelivery(
  districtId: string,
  methodId: string,
  subtotalPoisha: number,
  client: Prisma.TransactionClient | typeof db = db,
): Promise<DeliveryQuote> {
  const district = await client.district.findUnique({
    where: { id: districtId },
    include: { zone: true },
  });
  if (!district || !district.zone.isActive) {
    throw new CheckoutDataError('district-not-found');
  }

  const method = await client.deliveryMethod.findUnique({
    where: { id: methodId },
  });
  if (!method || !method.isActive) {
    throw new CheckoutDataError('method-not-found');
  }

  const rate = await client.deliveryRate.findUnique({
    where: { methodId_zoneId: { methodId: method.id, zoneId: district.zoneId } },
  });
  // A method and zone with no rate between them is a gap in the shop's own
  // configuration, not something the customer can fix by editing their order.
  if (!rate || !rate.isActive) {
    throw new CheckoutDataError('rate-not-found');
  }

  const isFree =
    rate.freeAbovePoisha !== null && subtotalPoisha >= rate.freeAbovePoisha;

  return {
    methodId: method.id,
    methodCode: method.code,
    zoneId: district.zoneId,
    zoneCode: district.zone.code,
    districtName: district.nameEn,
    chargePoisha: isFree ? 0 : rate.chargePoisha,
    isFree,
    estimatedDays:
      rate.estimatedDaysEn && rate.estimatedDaysBn
        ? { en: rate.estimatedDaysEn, bn: rate.estimatedDaysBn }
        : null,
  };
}

/**
 * A complete quote: priced lines, delivery, and the total that follows from
 * them.
 *
 * Delivery is quoted only once the subtotal is known, because the
 * free-delivery threshold is a function of it.
 */
export async function buildQuote(
  requested: RequestedLine[],
  delivery: { districtId: string; methodId: string } | null,
  client: Prisma.TransactionClient | typeof db = db,
): Promise<Quote> {
  const lines = await priceLines(requested, client);

  // Only buyable lines count toward the subtotal. Including a line that is
  // about to block the order would show a total the customer will never pay.
  const subtotalPoisha = lines.reduce(
    (total, line) => (line.problem === null ? total + line.lineTotalPoisha : total),
    0,
  );

  const isFulfillable =
    lines.length > 0 && lines.every((line) => line.problem === null);

  const deliveryQuote = delivery
    ? await quoteDelivery(
        delivery.districtId,
        delivery.methodId,
        subtotalPoisha,
        client,
      )
    : null;

  const deliveryChargePoisha = deliveryQuote?.chargePoisha ?? 0;

  return {
    lines,
    subtotalPoisha,
    delivery: deliveryQuote,
    deliveryChargePoisha,
    totalPoisha: subtotalPoisha + deliveryChargePoisha,
    isFulfillable,
  };
}
