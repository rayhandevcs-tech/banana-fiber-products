import { z } from 'zod';

import { taka, toTaka } from '@/lib/format/money';

/**
 * THE SHOP URL CONTRACT
 *
 * Every piece of discovery state lives in the query string, never in React
 * state alone. That is what makes a filtered shop refreshable, shareable,
 * bookmarkable and navigable with the browser's own back and forward buttons —
 * and it means the server can render the correct results on the first paint
 * instead of shipping an empty grid that fills in after hydration.
 *
 * Parsing is deliberately forgiving. A hand-edited or stale URL must never
 * produce an error page: an unknown sort, a negative page, a price that is not
 * a number all fall back to the default. `parseShopParams` therefore always
 * returns a usable object.
 *
 * PRICES IN THE URL ARE WHOLE TAKA, NOT POISHA.
 * `?maxPrice=1500` is readable and shareable in a way that `?maxPrice=150000`
 * is not. The boundary converts once, here, with the existing integer helpers;
 * everything below this file speaks poisha exclusively.
 */

export const SORT_OPTIONS = [
  'featured',
  'newest',
  'price-low',
  'price-high',
  'name-asc',
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number];

export const AVAILABILITY_OPTIONS = ['all', 'in-stock', 'out-of-stock'] as const;

export type AvailabilityOption = (typeof AVAILABILITY_OPTIONS)[number];

export const PAGE_SIZE = 8;

export const DEFAULT_SORT: SortOption = 'featured';
export const DEFAULT_AVAILABILITY: AvailabilityOption = 'all';

/** Long enough for any real product query, short enough to bound the LIKE. */
const MAX_SEARCH_LENGTH = 64;

/** A price no customer will type, used to reject nonsense without a DB round trip. */
const MAX_PRICE_TAKA = 10_000_000;

/**
 * A whole-Taka price from the URL.
 *
 * Rejects decimals outright rather than rounding them: money never passes
 * through a float in this codebase, and `?minPrice=12.5` is a malformed URL
 * rather than a user intention worth guessing at.
 */
const priceParam = z
  .string()
  .regex(/^\d{1,8}$/)
  .transform(Number)
  .refine((value) => value <= MAX_PRICE_TAKA)
  .optional()
  .catch(undefined);

const shopParamsSchema = z.object({
  search: z
    .string()
    .trim()
    .max(MAX_SEARCH_LENGTH)
    .transform((value) => (value.length > 0 ? value : undefined))
    .optional()
    .catch(undefined),
  category: z
    .string()
    .trim()
    // Category slugs are lowercase kebab-case; anything else cannot match a
    // row, so it is discarded before it reaches the database.
    .regex(/^[a-z0-9-]{1,64}$/)
    .optional()
    .catch(undefined),
  minPrice: priceParam,
  maxPrice: priceParam,
  availability: z.enum(AVAILABILITY_OPTIONS).catch(DEFAULT_AVAILABILITY),
  sort: z.enum(SORT_OPTIONS).catch(DEFAULT_SORT),
  page: z
    .string()
    .regex(/^\d{1,6}$/)
    .transform(Number)
    .refine((value) => value >= 1)
    .catch(1),
});

/** Discovery state as the URL expresses it: prices in whole Taka. */
export interface ShopParams {
  search: string | undefined;
  category: string | undefined;
  minPrice: number | undefined;
  maxPrice: number | undefined;
  availability: AvailabilityOption;
  sort: SortOption;
  page: number;
}

/** Discovery state as the database expects it: prices in integer poisha. */
export interface ShopQuery extends Omit<ShopParams, 'minPrice' | 'maxPrice'> {
  minPricePoisha: number | undefined;
  maxPricePoisha: number | undefined;
}

/** A `searchParams` value as Next.js supplies it. */
export type RawSearchParams = Record<string, string | string[] | undefined>;

/** Take the first value when a parameter is repeated (`?page=1&page=2`). */
function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Parse a URL's query string into validated discovery state.
 *
 * Never throws. Accepts both Next's `searchParams` object and a
 * `URLSearchParams`, so the same contract serves the server page and the
 * client filter controls.
 */
export function parseShopParams(
  input: RawSearchParams | URLSearchParams,
): ShopParams {
  const get = (key: string): string | undefined =>
    input instanceof URLSearchParams
      ? (input.get(key) ?? undefined)
      : first(input[key]);

  const parsed = shopParamsSchema.parse({
    search: get('search'),
    category: get('category'),
    minPrice: get('minPrice'),
    maxPrice: get('maxPrice'),
    availability: get('availability'),
    sort: get('sort'),
    page: get('page'),
  });

  // A reversed range is a typo, not an empty catalogue. Swapping is what the
  // customer meant and avoids a confusing "no results" for a valid pair.
  let { minPrice, maxPrice } = parsed;
  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    [minPrice, maxPrice] = [maxPrice, minPrice];
  }

  // Spelled out rather than spread: `ShopParams` requires every key to be
  // present (holding `undefined` when unset), which keeps call sites from
  // silently forgetting a filter.
  return {
    search: parsed.search,
    category: parsed.category,
    minPrice,
    maxPrice,
    availability: parsed.availability,
    sort: parsed.sort,
    page: parsed.page,
  };
}

/** Convert parsed URL state into the poisha-denominated query the database runs. */
export function toShopQuery(params: ShopParams): ShopQuery {
  const { minPrice, maxPrice, ...rest } = params;
  return {
    ...rest,
    minPricePoisha: minPrice === undefined ? undefined : taka(minPrice),
    maxPricePoisha: maxPrice === undefined ? undefined : taka(maxPrice),
  };
}

/** Whole Taka for a price input's placeholder, from a poisha bound. */
export function poishaToTakaBound(poisha: number, mode: 'floor' | 'ceil'): number {
  const value = toTaka(poisha);
  return mode === 'floor' ? Math.floor(value) : Math.ceil(value);
}

/**
 * Serialise discovery state back into a query string.
 *
 * Defaults are omitted so the URL stays short and two routes to the same
 * result produce the same link — `/shop` and `/shop?sort=featured&page=1` are
 * the same view and should not be two different URLs to share or cache.
 */
export function buildShopQueryString(params: Partial<ShopParams>): string {
  const query = new URLSearchParams();

  if (params.search) query.set('search', params.search);
  if (params.category) query.set('category', params.category);
  if (params.minPrice !== undefined) query.set('minPrice', String(params.minPrice));
  if (params.maxPrice !== undefined) query.set('maxPrice', String(params.maxPrice));
  if (params.availability && params.availability !== DEFAULT_AVAILABILITY) {
    query.set('availability', params.availability);
  }
  if (params.sort && params.sort !== DEFAULT_SORT) query.set('sort', params.sort);
  if (params.page !== undefined && params.page > 1) {
    query.set('page', String(params.page));
  }

  return query.toString();
}

/** `/shop` or `/shop?...` — the href for a given discovery state. */
export function buildShopHref(params: Partial<ShopParams>): string {
  const query = buildShopQueryString(params);
  return query ? `/shop?${query}` : '/shop';
}

/**
 * Apply a change to existing state.
 *
 * Any change other than paging returns to page 1: staying on page 3 while
 * narrowing a filter is how customers end up staring at an empty grid that
 * has results they cannot see.
 */
export function withShopParams(
  current: ShopParams,
  changes: Partial<ShopParams>,
): ShopParams {
  const next = { ...current, ...changes };
  if (!('page' in changes)) next.page = 1;
  return next;
}

/** True when nothing is narrowing the catalogue (sort is not a filter). */
export function hasActiveFilters(params: ShopParams): boolean {
  return Boolean(
    params.search ||
      params.category ||
      params.minPrice !== undefined ||
      params.maxPrice !== undefined ||
      params.availability !== DEFAULT_AVAILABILITY,
  );
}

/** Discovery state with every filter cleared, keeping the chosen sort. */
export function clearedFilters(params: ShopParams): ShopParams {
  return {
    search: undefined,
    category: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    availability: DEFAULT_AVAILABILITY,
    sort: params.sort,
    page: 1,
  };
}
