'use client';

import { useId } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowUpDown, ChevronDown } from 'lucide-react';

import { SORT_OPTIONS, type SortOption } from '@/lib/shop/searchParams';
import { useShopNavigation } from './ShopNavigation';
import { cn } from '@/lib/utils/cn';

/**
 * Sort order.
 *
 * A native `<select>`, matching the design system's reasoning: the OS picker
 * is faster on a low-end Android phone, is keyboard and screen-reader
 * accessible without any code, and ships no JavaScript of its own.
 *
 * Sorting runs in PostgreSQL — this control only rewrites the URL.
 */
export function SortSelect({ className }: { className?: string }) {
  const t = useTranslations('shop');
  const { params, navigate } = useShopNavigation();
  const selectId = useId();

  const labels: Record<SortOption, string> = {
    featured: t('sortFeatured'),
    newest: t('sortNewest'),
    'price-low': t('sortPriceLow'),
    'price-high': t('sortPriceHigh'),
    'name-asc': t('sortNameAsc'),
  };

  return (
    <div className={cn('flex min-w-0 items-center gap-2', className)}>
      <label
        htmlFor={selectId}
        className="hidden shrink-0 text-sm font-medium text-ink-600 sm:block"
      >
        {t('sort')}
      </label>
      <div className="relative min-w-0 flex-1">
        <ArrowUpDown
          className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-400 sm:hidden"
          aria-hidden="true"
        />
        <select
          id={selectId}
          value={params.sort}
          onChange={(event) => navigate({ sort: event.target.value as SortOption })}
          // On mobile the visible label is hidden to save a line, so the
          // control carries its own accessible name.
          aria-label={t('sort')}
          className={cn(
            'h-11 w-full appearance-none rounded-lg border border-beige-300 bg-surface',
            'pr-9 pl-9 text-base text-ink-800 sm:pl-3',
            'transition-colors duration-150',
            'focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none',
          )}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {labels[option]}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 text-ink-400"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
