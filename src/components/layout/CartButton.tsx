'use client';

import { useTranslations } from 'next-intl';
import { ShoppingBag } from 'lucide-react';
import { Link } from '@/lib/i18n/routing';
import { useCartStore, selectItemCount } from '@/lib/cart/store';
import { cn } from '@/lib/utils/cn';

/**
 * Cart entry point with an item-count badge.
 *
 * Reads the cart store directly, so adding something anywhere on the site
 * updates the badge without any page having to thread a count down to the
 * header.
 *
 * The count is held back until the store reports itself hydrated. The cart
 * lives in localStorage, which the server cannot read, so the server always
 * renders zero; showing the real number on the first client render would be a
 * hydration mismatch. One frame of "no badge" is the cost.
 */
export function CartButton({ className }: { className?: string }) {
  const t = useTranslations('cart');
  const hydrated = useCartStore((state) => state.hydrated);
  const storedCount = useCartStore(selectItemCount);
  const itemCount = hydrated ? storedCount : 0;

  return (
    <Link
      href="/cart"
      aria-label={t('open')}
      className={cn(
        'tap-target relative flex items-center justify-center rounded-lg',
        'text-ink-700 transition-colors hover:bg-beige-100',
        className,
      )}
    >
      <ShoppingBag className="h-6 w-6" aria-hidden="true" />

      {itemCount > 0 ? (
        <span
          className={cn(
            'absolute top-1 right-1 flex h-5 min-w-5 items-center justify-center',
            'rounded-full bg-clay-500 px-1 text-2xs font-bold text-white',
          )}
        >
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      ) : null}

      {/* The badge is decorative; the count is announced in words instead. */}
      <span className="sr-only">{t('itemCount', { count: itemCount })}</span>
    </Link>
  );
}
