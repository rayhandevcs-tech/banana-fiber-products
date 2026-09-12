'use server';

import { z } from 'zod';

import { db } from '@/server/db/client';
import { normalizePhone, isValidBdPhone } from '@/lib/format/phone';
import { buildQuote, CheckoutDataError } from '@/server/checkout/quote';
import type { Quote, RequestedLine } from '@/server/checkout/quote';
import { placeOrder, type PlaceOrderResult } from '@/server/checkout/placeOrder';

/**
 * THE CHECKOUT BOUNDARY
 *
 * The only two things the browser may ask the server to do, and the only
 * place customer input crosses into the application.
 *
 * Everything arriving here is treated as hostile: it has come from a form a
 * customer can edit and a cart held in localStorage they can rewrite. Each
 * action re-parses its whole input and re-reads the database. Nothing the
 * client says about a price, a total, a stock level or a delivery charge is
 * carried through — those fields are not even accepted as parameters, which
 * is the simplest way to guarantee they cannot be trusted.
 */

/** A cart line as the browser is permitted to express it: an id and a count. */
const requestedLineSchema = z.object({
  productId: z.string().min(1).max(64),
  quantity: z.number().int().min(1).max(999),
});

const requestedLinesSchema = z.array(requestedLineSchema).max(100);

const customerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  // Validated first, then normalised, so the field's type stays a plain
  // string: `normalizePhone` answers null for anything it does not recognise,
  // and a nullable phone would leak into the order data.
  phone: z
    .string()
    .trim()
    .refine(isValidBdPhone, { message: 'invalid-phone' })
    .transform((value) => normalizePhone(value) as string),
  // Blank is a legitimate answer for an optional field, so an empty string is
  // normalised away rather than failing validation.
  email: z
    .string()
    .trim()
    .max(180)
    .email()
    .optional()
    .or(z.literal('').transform(() => undefined)),
  districtId: z.string().min(1).max(64),
  upazila: z.string().trim().min(1).max(120),
  area: z.string().trim().max(160).optional().or(z.literal('').transform(() => undefined)),
  addressLine: z.string().trim().min(5).max(400),
  deliveryNote: z
    .string()
    .trim()
    .max(400)
    .optional()
    .or(z.literal('').transform(() => undefined)),
  methodId: z.string().min(1).max(64),
  idempotencyKey: z.string().uuid(),
});

export type CustomerInput = z.input<typeof customerSchema>;

export type QuoteResponse =
  | { ok: true; quote: Quote }
  | { ok: false; problem: 'invalid-request' | 'district-not-found' | 'method-not-found' | 'rate-not-found' };

/**
 * Price a cart for display.
 *
 * Called when the checkout page opens and whenever the delivery choice
 * changes, so the customer reviews the shop's figures rather than their
 * browser's. Its answer is never used to create an order — `submitOrder`
 * prices everything again inside the transaction.
 */
export async function quoteCheckout(
  rawLines: unknown,
  delivery: { districtId: string; methodId: string } | null,
): Promise<QuoteResponse> {
  const parsed = requestedLinesSchema.safeParse(rawLines);
  if (!parsed.success) return { ok: false, problem: 'invalid-request' };

  try {
    const quote = await buildQuote(parsed.data as RequestedLine[], delivery);
    return { ok: true, quote };
  } catch (error) {
    if (error instanceof CheckoutDataError) {
      return { ok: false, problem: error.problem };
    }
    console.error('[checkout] quote failed', error);
    return { ok: false, problem: 'invalid-request' };
  }
}

export type SubmitResponse =
  | PlaceOrderResult
  | { ok: false; reason: 'invalid-customer'; fields: string[] }
  | { ok: false; reason: 'invalid-request' };

/**
 * Validate, price and create the order.
 *
 * Field-level errors come back as a list of field names rather than message
 * strings: the server has no business deciding what language the customer
 * reads, and the form already has a translated message for each field.
 */
export async function submitOrder(
  rawLines: unknown,
  rawCustomer: unknown,
): Promise<SubmitResponse> {
  const lines = requestedLinesSchema.safeParse(rawLines);
  if (!lines.success) return { ok: false, reason: 'invalid-request' };

  const customer = customerSchema.safeParse(rawCustomer);
  if (!customer.success) {
    const fields = [
      ...new Set(
        customer.error.issues
          .map((issue) => issue.path[0])
          .filter((field): field is string => typeof field === 'string'),
      ),
    ];
    return { ok: false, reason: 'invalid-customer', fields };
  }

  const { idempotencyKey, ...details } = customer.data;

  return placeOrder(
    lines.data as RequestedLine[],
    {
      name: details.name,
      phone: details.phone,
      email: details.email ?? null,
      districtId: details.districtId,
      upazila: details.upazila,
      area: details.area ?? null,
      addressLine: details.addressLine,
      deliveryNote: details.deliveryNote ?? null,
      methodId: details.methodId,
    },
    idempotencyKey,
  );
}

/**
 * Look up a placed order for the confirmation page.
 *
 * Deliberately returns nothing that identifies the customer. Order numbers
 * run in sequence and are therefore guessable, so name, phone, email and
 * address are all withheld — the person who just placed the order already
 * knows them, and nobody else should learn them by trying numbers.
 */
export async function getOrderConfirmation(orderNumber: string): Promise<{
  orderNumber: string;
  totalPoisha: number;
  subtotalPoisha: number;
  deliveryChargePoisha: number;
  itemCount: number;
  methodName: { en: string; bn: string };
  placedAt: string;
} | null> {
  const parsed = z.string().trim().max(32).safeParse(orderNumber);
  if (!parsed.success) return null;

  const order = await db.order.findUnique({
    where: { orderNumber: parsed.data },
    select: {
      orderNumber: true,
      totalPoisha: true,
      subtotalPoisha: true,
      deliveryChargePoisha: true,
      placedAt: true,
      deliveryMethod: { select: { nameEn: true, nameBn: true } },
      items: { select: { quantity: true } },
    },
  });

  if (!order) return null;

  return {
    orderNumber: order.orderNumber,
    totalPoisha: order.totalPoisha,
    subtotalPoisha: order.subtotalPoisha,
    deliveryChargePoisha: order.deliveryChargePoisha,
    itemCount: order.items.reduce((total, item) => total + item.quantity, 0),
    // The method's own name, in both languages, rather than its code: the
    // confirmation should say "Home Delivery", and the shop may rename it
    // without this page having to know.
    methodName: {
      en: order.deliveryMethod.nameEn,
      bn: order.deliveryMethod.nameBn,
    },
    placedAt: order.placedAt.toISOString(),
  };
}
