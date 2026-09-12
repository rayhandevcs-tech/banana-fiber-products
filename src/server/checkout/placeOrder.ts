import 'server-only';

import { Prisma } from '@/generated/prisma/client';
import { db } from '@/server/db/client';
import { buildQuote, CheckoutDataError, type RequestedLine } from './quote';

/**
 * ORDER CREATION
 *
 * One transaction, which either produces an order with all of its items and
 * stock movements, or produces nothing at all.
 *
 * The quote is rebuilt INSIDE the transaction. The one the customer was
 * shown while filling in their address is already history — a price may have
 * changed and the last unit may have gone — so the figures written to the
 * order are read fresh here, and the order is refused if anything no longer
 * checks out.
 */

export interface CustomerDetails {
  name: string;
  /** Already normalised to 11 digits by the caller. */
  phone: string;
  email: string | null;
  districtId: string;
  upazila: string;
  area: string | null;
  addressLine: string;
  deliveryNote: string | null;
  methodId: string;
}

export type PlaceOrderResult =
  | { ok: true; orderNumber: string; totalPoisha: number; duplicate: boolean }
  | { ok: false; reason: 'empty' }
  | { ok: false; reason: 'lines'; quote: Awaited<ReturnType<typeof buildQuote>> }
  | { ok: false; reason: 'delivery'; problem: string }
  | { ok: false; reason: 'stock-conflict' }
  | { ok: false; reason: 'failed' };

/** Thrown inside the transaction to roll it back when stock has just gone. */
class StockConflictError extends Error {}

/**
 * The next order number for the current year: BF-2026-00001.
 *
 * Readable over the phone, which is how this shop's customers will quote it,
 * and carrying no database id. Counting is not by itself collision-proof —
 * two simultaneous checkouts can count the same total — so the unique index
 * on `orderNumber` is the real guarantee and the caller retries on conflict.
 */
async function nextOrderNumber(
  tx: Prisma.TransactionClient,
  year: number,
): Promise<string> {
  const prefix = `BF-${year}-`;
  const count = await tx.order.count({
    where: { orderNumber: { startsWith: prefix } },
  });
  return `${prefix}${String(count + 1).padStart(5, '0')}`;
}

/** How many times to retry an order-number collision before giving up. */
const ORDER_NUMBER_ATTEMPTS = 5;

export async function placeOrder(
  requested: RequestedLine[],
  customer: CustomerDetails,
  idempotencyKey: string,
): Promise<PlaceOrderResult> {
  if (requested.length === 0) return { ok: false, reason: 'empty' };

  // A repeat of an attempt that already succeeded — a double tap, or a retry
  // after the connection dropped on the way back. Answer with the order that
  // exists rather than charging the same cart twice.
  const existing = await db.order.findUnique({
    where: { idempotencyKey },
    select: { orderNumber: true, totalPoisha: true },
  });
  if (existing) {
    return {
      ok: true,
      orderNumber: existing.orderNumber,
      totalPoisha: existing.totalPoisha,
      duplicate: true,
    };
  }

  for (let attempt = 0; attempt < ORDER_NUMBER_ATTEMPTS; attempt += 1) {
    try {
      const result = await db.$transaction(async (tx) => {
        // Priced again, here, against the same rows the writes below will
        // touch.
        const quote = await buildQuote(
          requested,
          { districtId: customer.districtId, methodId: customer.methodId },
          tx,
        );

        if (!quote.isFulfillable || !quote.delivery) {
          return { kind: 'lines' as const, quote };
        }

        const orderNumber = await nextOrderNumber(tx, new Date().getFullYear());

        const order = await tx.order.create({
          data: {
            orderNumber,
            idempotencyKey,
            customerName: customer.name,
            customerPhone: customer.phone,
            customerEmail: customer.email,
            districtName: quote.delivery.districtName,
            upazila: customer.upazila,
            area: customer.area,
            addressLine: customer.addressLine,
            deliveryNote: customer.deliveryNote,
            deliveryMethodId: quote.delivery.methodId,
            deliveryZoneId: quote.delivery.zoneId,
            subtotalPoisha: quote.subtotalPoisha,
            deliveryChargePoisha: quote.deliveryChargePoisha,
            totalPoisha: quote.totalPoisha,
            // Cash on delivery is the shop's only settlement method today.
            // Nothing here takes a payment; the status stays PENDING until
            // the money is actually collected.
            paymentMethod: 'COD',
            items: {
              create: quote.lines.map((line) => ({
                productId: line.productId,
                // Snapshots, not references. The order has to stay readable
                // years later even if the product is renamed, repriced or
                // deleted — which is exactly what an order history is for.
                nameEnSnapshot: line.name.en,
                nameBnSnapshot: line.name.bn,
                skuSnapshot: line.sku,
                imageUrlSnapshot: line.imageUrl,
                unitPricePoisha: line.pricePoisha,
                unitDiscountPoisha: line.discountPoisha,
                quantity: line.quantity,
                lineTotalPoisha: line.lineTotalPoisha,
              })),
            },
            events: {
              create: {
                // `fromStatus` stays null: this is the first entry in the
                // order's history, not a transition out of anything.
                toStatus: 'PENDING',
                note: 'Order placed by customer at checkout.',
              },
            },
          },
          select: { id: true, orderNumber: true, totalPoisha: true },
        });

        // Take the stock.
        //
        // A conditional update, not a read-then-write: the `stock: { gte }`
        // clause means the database itself refuses to let the row go
        // negative, so two checkouts racing for the last unit cannot both
        // succeed. Whichever arrives second updates zero rows and rolls the
        // whole order back.
        for (const line of quote.lines) {
          const claimed = await tx.product.updateMany({
            where: {
              id: line.productId,
              isActive: true,
              deletedAt: null,
              stock: { gte: line.quantity },
            },
            data: { stock: { decrement: line.quantity } },
          });

          if (claimed.count !== 1) throw new StockConflictError();
        }

        // Resulting levels read back in one query, so the audit trail records
        // what the stock actually became rather than what we assumed.
        const after = await tx.product.findMany({
          where: { id: { in: quote.lines.map((line) => line.productId) } },
          select: { id: true, stock: true },
        });
        const stockById = new Map(after.map((row) => [row.id, row.stock]));

        await tx.stockMovement.createMany({
          data: quote.lines.map((line) => ({
            productId: line.productId,
            delta: -line.quantity,
            reason: 'SALE' as const,
            resultingStock: stockById.get(line.productId) ?? 0,
            orderId: order.id,
            note: `Order ${order.orderNumber}`,
          })),
        });

        return { kind: 'ok' as const, order };
      });

      if (result.kind === 'lines') {
        return { ok: false, reason: 'lines', quote: result.quote };
      }

      return {
        ok: true,
        orderNumber: result.order.orderNumber,
        totalPoisha: result.order.totalPoisha,
        duplicate: false,
      };
    } catch (error) {
      if (error instanceof StockConflictError) {
        return { ok: false, reason: 'stock-conflict' };
      }

      if (error instanceof CheckoutDataError) {
        return { ok: false, reason: 'delivery', problem: error.problem };
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        // Which unique index was violated.
        //
        // `meta.target` is empty under the pg driver adapter — it names the
        // constraint only in the message — so both are searched. Relying on
        // `target` alone silently sent every collision to the generic failure
        // branch below, which turned an ordinary concurrent-order-number clash
        // into a failed checkout.
        const target = (error.meta?.['target'] as string[] | undefined) ?? [];
        const violated = [...target, error.message].join(' ');

        // The idempotency key collided, which means a concurrent copy of this
        // very submission won the race. Hand back its order.
        if (violated.includes('idempotencyKey')) {
          const winner = await db.order.findUnique({
            where: { idempotencyKey },
            select: { orderNumber: true, totalPoisha: true },
          });
          if (winner) {
            return {
              ok: true,
              orderNumber: winner.orderNumber,
              totalPoisha: winner.totalPoisha,
              duplicate: true,
            };
          }
        }

        // Two orders counted the same number at once. The transaction rolled
        // back, so nothing was written and no stock was taken; count again and
        // retry.
        if (violated.includes('orderNumber')) continue;
      }

      // Anything else is ours, not the customer's. It is logged on the server
      // and reported to them as a generic failure — a Prisma message can name
      // tables and columns and must never reach a browser.
      console.error('[checkout] order creation failed', error);
      return { ok: false, reason: 'failed' };
    }
  }

  console.error('[checkout] exhausted order number attempts');
  return { ok: false, reason: 'failed' };
}
