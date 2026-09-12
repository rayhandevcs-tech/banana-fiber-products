'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import type { ImageAsset, LocalizedText } from '@/types/content';

/**
 * THE CART
 *
 * A browser-side list of intentions, and nothing more.
 *
 * WHAT THIS DATA IS NOT
 * ---------------------
 * It is NOT authoritative. The prices and names below are a snapshot taken
 * when the customer pressed the button, kept so the cart can be drawn
 * instantly and offline. They live in `localStorage`, which means a customer
 * can edit them freely, and they go stale the moment the operator changes a
 * price or sells the last unit.
 *
 * So checkout (Sprint 7) must re-read every line from the database by
 * `productId` and recompute the total there. Never bill what this store says.
 * `quantity` and `productId` are the only fields worth sending to a server,
 * and even the quantity has to be re-checked against stock.
 *
 * WHY ZUSTAND
 * -----------
 * It is already a dependency, it works outside React (so the merge rules below
 * can be unit-reasoned about), and `persist` gives localStorage survival
 * across a refresh without extra code — which matters on a phone that may
 * reload the page on a flaky connection mid-purchase.
 */

/** One line in the cart. */
export interface CartLine {
  productId: string;
  slug: string;
  /** Snapshot: bilingual, so the cart renders in either language offline. */
  name: LocalizedText;
  /** Snapshot of the list price in poisha, for showing a strike-through. */
  pricePoisha: number;
  /** Snapshot of the absolute discount in poisha. */
  discountPoisha: number;
  quantity: number;
  image: ImageAsset;
  /** Stock as it was when this line was added; a hint, never a guarantee. */
  stockAtAdd: number;
}

/** What a caller must supply to add something. Quantity is handled separately. */
export type CartLineInput = Omit<CartLine, 'quantity'>;

interface CartState {
  lines: CartLine[];
  /**
   * True once the persisted cart has been read back from localStorage.
   *
   * The server cannot know what is in a browser's storage, so the first
   * client render must match the server's empty cart or React reports a
   * hydration mismatch. Components gate on this instead.
   */
  hydrated: boolean;
  markHydrated: () => void;
  /**
   * Add a product, or top up the line that is already there.
   *
   * Returns the resulting quantity so the caller can tell the customer what
   * actually happened — asking for 3 when 2 remain adds 2, and the message
   * should say so rather than claiming 3.
   */
  addItem: (line: CartLineInput, quantity: number, stockLimit: number) => number;
  setQuantity: (productId: string, quantity: number, stockLimit: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
}

/** Quantities are whole, positive and bounded by what the server last reported. */
function normaliseQuantity(requested: number, stockLimit: number): number {
  if (!Number.isFinite(requested)) return 0;
  const whole = Math.floor(requested);
  if (whole < 1) return 0;
  return Math.min(whole, Math.max(0, Math.floor(stockLimit)));
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      hydrated: false,

      markHydrated() {
        set({ hydrated: true });
      },

      addItem(line, quantity, stockLimit) {
        const existing = get().lines.find((item) => item.productId === line.productId);
        const alreadyInCart = existing?.quantity ?? 0;

        // The same product added twice becomes one line with a larger
        // quantity, never two lines. Centralised here so no component can
        // reimplement it differently — the cart page in Sprint 5 will call
        // this same function.
        const target = normaliseQuantity(alreadyInCart + quantity, stockLimit);
        if (target === 0) return alreadyInCart;
        if (target === alreadyInCart) return alreadyInCart;

        set((state) => ({
          lines: existing
            ? state.lines.map((item) =>
                item.productId === line.productId
                  ? // The snapshot is refreshed on every add: the customer is
                    // looking at the current page, so its price and image are
                    // newer than whatever was stored days ago.
                    { ...item, ...line, quantity: target }
                  : item,
              )
            : [...state.lines, { ...line, quantity: target }],
        }));

        return target;
      },

      setQuantity(productId, quantity, stockLimit) {
        const target = normaliseQuantity(quantity, stockLimit);
        set((state) => ({
          lines:
            target === 0
              ? state.lines.filter((item) => item.productId !== productId)
              : state.lines.map((item) =>
                  item.productId === productId ? { ...item, quantity: target } : item,
                ),
        }));
      },

      removeItem(productId) {
        set((state) => ({
          lines: state.lines.filter((item) => item.productId !== productId),
        }));
      },

      clear() {
        set({ lines: [] });
      },
    }),
    {
      name: 'bf-cart',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // Only the lines are worth persisting; `hydrated` describes this tab.
      partialize: (state) => ({ lines: state.lines }),
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
    },
  ),
);

/** Total number of units across every line — what the header badge shows. */
export function selectItemCount(state: CartState): number {
  return state.lines.reduce((total, line) => total + line.quantity, 0);
}

/** How many of a given product are already in the cart. */
export function selectQuantityOf(state: CartState, productId: string): number {
  return state.lines.find((line) => line.productId === productId)?.quantity ?? 0;
}

/**
 * The cart subtotal, in integer poisha.
 *
 * Computed from the effective (post-discount) price of each line, so it
 * matches the prices printed beside the products. Kept here rather than in the
 * cart page because it is money arithmetic: it must stay in whole poisha, and
 * having exactly one implementation is what stops a rounding difference
 * appearing between the line totals and the sum of them.
 *
 * Like every other figure in this store it is a display estimate. The amount a
 * customer is actually charged is recomputed on the server at checkout.
 */
export function selectSubtotalPoisha(state: CartState): number {
  return state.lines.reduce(
    (total, line) => (isLineAvailable(line) ? total + lineTotalPoisha(line) : total),
    0,
  );
}

/**
 * Whether a line can still be bought, as far as this browser knows.
 *
 * `stockAtAdd` is a reading taken when the product went into the cart, so a
 * zero here means the product was already unavailable by the last information
 * we had. Such a line stays visible — quietly dropping something a customer
 * chose is worse than showing it — but it is marked, its stepper is turned
 * off, and it is left out of the subtotal, because a total that includes
 * something unbuyable is a figure the shop cannot honour.
 *
 * This is a snapshot, not the truth. Sprint 6 replaces it with a server check.
 */
export function isLineAvailable(line: CartLine): boolean {
  return line.stockAtAdd > 0;
}

/** What one line costs: effective unit price × quantity, in poisha. */
export function lineTotalPoisha(line: CartLine): number {
  return Math.max(0, line.pricePoisha - line.discountPoisha) * line.quantity;
}
