import type { Locale } from '@/config/locales';

/**
 * MONEY
 *
 * Every monetary value in this application is an INTEGER NUMBER OF POISHA.
 * 1 Taka = 100 poisha. Floating point never touches money — not in the
 * database, not in the cart, not in totals.
 *
 * Use `taka(850)` to express a price in source; use `formatMoney()` to render.
 */

/** Branded so a raw number cannot be passed where poisha is expected. */
export type Poisha = number;

/** Convert whole Taka to poisha. `taka(850)` → 85000 */
export function taka(amount: number): Poisha {
  return Math.round(amount * 100);
}

/** Convert poisha to a Taka number. Use only for display or export. */
export function toTaka(poisha: Poisha): number {
  return poisha / 100;
}

const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'] as const;

/** Render Latin digits as Bengali digits. '1250' → '১২৫০' */
export function toBengaliDigits(input: string): string {
  return input.replace(/\d/g, (d) => BENGALI_DIGITS[Number(d)]!);
}

/**
 * Format a poisha amount for display.
 *
 * Bengali renders with Bengali numerals and the Bangladeshi digit grouping
 * (lakh/crore: ১,২৩,৪৫৬), which `Intl` with the `bn-BD` locale handles for us.
 * Paisa are hidden when the amount is a whole number of Taka, because real
 * prices here are whole Taka and "৳৮৫০.০০" reads as clutter.
 */
export function formatMoney(
  poisha: Poisha,
  locale: Locale,
  options: { showDecimals?: boolean; showSymbol?: boolean } = {},
): string {
  const { showDecimals = poisha % 100 !== 0, showSymbol = true } = options;

  const formatted = new Intl.NumberFormat(
    locale === 'bn' ? 'bn-BD' : 'en-BD',
    {
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0,
    },
  ).format(toTaka(poisha));

  return showSymbol ? `৳${formatted}` : formatted;
}

/** Format a plain count (stock, order quantity) in the active locale's digits. */
export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-BD').format(value);
}

/** Percentage discount between an original and a discounted price. */
export function discountPercent(
  pricePoisha: Poisha,
  discountPoisha: Poisha,
): number {
  if (pricePoisha <= 0 || discountPoisha <= 0) return 0;
  return Math.round((discountPoisha / pricePoisha) * 100);
}

/** The price a customer actually pays, after any discount. */
export function effectivePrice(
  pricePoisha: Poisha,
  discountPoisha: Poisha,
): Poisha {
  return Math.max(0, pricePoisha - discountPoisha);
}
