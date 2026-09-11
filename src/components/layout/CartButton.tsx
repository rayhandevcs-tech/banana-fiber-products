'use client';

import { useTranslations } from 'next-intl';
import { ShoppingBag } from 'lucide-react';
import { Link } from '@/lib/i18n/routing';
import { cn } from '@/lib/utils/cn';

/**
 * Cart entry point with an item-count badge.
 *
 * The count is a prop rather than a store read: the cart store arrives in
 * Sprint 5, and keeping this component stateless means it does not have to
 * change when it does.
 */
export function CartButton({
  itemCount = 0,
  className,
}: {
  itemCount?: number;
  className?: string;
}) {
  const t = useTranslations('cart');

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
