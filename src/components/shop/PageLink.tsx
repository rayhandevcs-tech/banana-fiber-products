'use client';

import type { ReactNode } from 'react';

import type { ShopParams } from '@/lib/shop/searchParams';
import { useShopNavigation } from './ShopNavigation';

/**
 * One pagination target.
 *
 * A real `<a href>`, so the page is crawlable, shareable, and still opens in
 * a new tab on a middle-click or ctrl-click — but the click itself goes
 * through `navigate`, which verifies that the navigation actually committed.
 * A bare `<Link>` here is subject to the same dropped-navigation problem
 * described in `ShopNavigation`, and a "next page" button that silently does
 * nothing is indistinguishable from a broken site.
 *
 * Unlike the filters, paging deliberately scrolls back to the top: the
 * customer has finished with these products and wants the start of the next
 * set, not the same offset down an unrelated list.
 */
export function PageLink({
  page,
  label,
  current,
  className,
  children,
}: {
  page: number;
  label: string;
  current?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const { hrefFor, navigate } = useShopNavigation();
  const changes: Partial<ShopParams> = { page };

  return (
    <a
      href={hrefFor(changes)}
      aria-label={label}
      aria-current={current ? 'page' : undefined}
      className={className}
      onClick={(event) => {
        // Let the browser handle the clicks that mean "somewhere else":
        // new tab, new window, download, or a non-primary button.
        if (
          event.defaultPrevented ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          event.button !== 0
        ) {
          return;
        }
        event.preventDefault();
        navigate(changes, { scroll: true });
      }}
    >
      {children}
    </a>
  );
}
