'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useOptimistic,
  useTransition,
} from 'react';
import type { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import {
  buildShopQueryString,
  withShopParams,
  type ShopParams,
} from '@/lib/shop/searchParams';

/**
 * The one place the shop writes to the URL.
 *
 * Every control — search, category, price, availability, sort, the clear
 * buttons — changes the address bar and nothing else. The server then renders
 * the matching results. No control keeps a private copy of the filter state,
 * so the sidebar and the mobile sheet cannot disagree, and refresh, back,
 * forward and a pasted link all behave without any extra code.
 *
 * The current state arrives as a prop from the server page, which has already
 * parsed and validated it. Reading `useSearchParams()` here instead would
 * parse the same string a second time and force a Suspense boundary around
 * every control for no benefit.
 */

/**
 * How long to give a client-side navigation before falling back to a full one.
 *
 * Comfortably longer than a local render; short enough that a customer who
 * tapped a filter is not left looking at unchanged results.
 */
const COMMIT_TIMEOUT_MS = 700;

interface ShopNavigationValue {
  params: ShopParams;
  /** True while the server is rendering the next set of results. */
  isPending: boolean;
  /** Apply a change to the URL. Resets to page 1 unless `page` is the change. */
  navigate: (changes: Partial<ShopParams>, options?: { scroll?: boolean }) => void;
  /** The href a given change would lead to, for controls that render links. */
  hrefFor: (changes: Partial<ShopParams>) => string;
}

const ShopNavigationContext = createContext<ShopNavigationValue | null>(null);

export function ShopNavigationProvider({
  params,
  children,
}: {
  params: ShopParams;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  /**
   * The filter state the controls should show right now, which during a
   * navigation runs ahead of the URL.
   *
   * Without it, clicking a radio checks it in the DOM while `params` still
   * says otherwise, so React immediately forces the control back to its old
   * state and the filter visibly flickers off. Showing the pending state
   * keeps the control steady and makes it respond instantly rather than after
   * the server round trip.
   */
  const [optimisticParams, setOptimisticParams] = useOptimistic(params);

  /**
   * Targets are always computed from `params` — the state the server actually
   * rendered — never from the optimistic copy. The optimistic value exists to
   * keep the controls steady during a navigation; treating it as the base for
   * the next change lets one dropped navigation strand every later one,
   * because the computed target can come out equal to the URL already showing
   * and the change is skipped as a no-op.
   */
  const hrefFor = useCallback(
    (changes: Partial<ShopParams>) => {
      const query = buildShopQueryString(withShopParams(params, changes));
      return query ? `${pathname}?${query}` : pathname;
    },
    [params, pathname],
  );

  const value = useMemo<ShopNavigationValue>(
    () => ({
      params: optimisticParams,
      isPending,
      hrefFor,
      navigate(changes, options) {
        const next = withShopParams(params, changes);
        const query = buildShopQueryString(next);
        const href = query ? `${pathname}?${query}` : pathname;

        // Already there — nothing to do, and pushing an identical URL would
        // add a pointless history entry for the back button to step through.
        if (href === `${window.location.pathname}${window.location.search}`) {
          return;
        }

        startTransition(() => {
          setOptimisticParams(next);
          // `scroll: false` keeps the customer where they are. Jumping to the
          // top of the page every time a filter changes loses their place in
          // the filter list, which is worst precisely on the small screens
          // where the filters are longest.
          router.push(href, { scroll: options?.scroll ?? false });
        });

        /**
         * Make sure the navigation actually happened.
         *
         * On this route the App Router drops a client-side navigation that
         * only changes the query string roughly half the time: the RSC
         * request goes out and returns 200 with the correct payload, but the
         * history entry is never committed and the results never update. It
         * is not this code — it reproduces identically with a plain `<Link>`,
         * with and without a transition, with and without `useOptimistic`,
         * with prefetching disabled, with the middleware removed, and whether
         * or not the page is `force-dynamic`. A filter that silently does
         * nothing is the single worst failure this page could have, so rather
         * than trust the router, verify it: if the URL has not changed by the
         * time the check runs, fall through to a full navigation, which is
         * always honoured.
         *
         * When the push does commit — the common case — this check sees the
         * new URL and does nothing at all.
         */
        window.setTimeout(() => {
          const current = `${window.location.pathname}${window.location.search}`;
          if (current !== href) {
            window.location.assign(href);
          }
        }, COMMIT_TIMEOUT_MS);
      },
    }),
    [params, optimisticParams, isPending, router, pathname, hrefFor, setOptimisticParams],
  );

  return (
    <ShopNavigationContext.Provider value={value}>
      {children}
    </ShopNavigationContext.Provider>
  );
}

export function useShopNavigation(): ShopNavigationValue {
  const value = useContext(ShopNavigationContext);
  if (!value) {
    throw new Error(
      'useShopNavigation must be used inside a <ShopNavigationProvider>',
    );
  }
  return value;
}
