'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { useShopNavigation } from './ShopNavigation';
import { cn } from '@/lib/utils/cn';

/**
 * The results region while the next page is being fetched.
 *
 * The previous results stay on screen and fade slightly rather than being
 * replaced by skeletons. Swapping a full grid for placeholders on every filter
 * change collapses and re-expands the page, throwing away the customer's
 * scroll position — the results are usually a second away, and a brief dim is
 * far less disruptive than a layout jump.
 *
 * `aria-busy` announces the update to assistive technology, and the status
 * line gives the same signal to anyone whose reduced-motion or high-contrast
 * settings make a change in opacity hard to perceive.
 *
 * The children are rendered on the server; this component only wraps them.
 */
export function ShopResults({ children }: { children: ReactNode }) {
  const t = useTranslations('shop');
  const { isPending } = useShopNavigation();

  return (
    <div aria-busy={isPending} className="relative">
      <p role="status" aria-live="polite" className="sr-only">
        {isPending ? t('loadingProducts') : ''}
      </p>

      <div
        className={cn(
          'transition-opacity duration-200',
          isPending && 'pointer-events-none opacity-50',
        )}
      >
        {children}
      </div>
    </div>
  );
}
