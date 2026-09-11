'use client';

import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';

import type { Locale } from '@/config/locales';
import type { CategoryCardData } from '@/types/content';
import { formatNumber } from '@/lib/format/money';
import {
  DEFAULT_AVAILABILITY,
  clearedFilters,
  hasActiveFilters,
  type ShopParams,
} from '@/lib/shop/searchParams';
import { useShopNavigation } from './ShopNavigation';

/**
 * What is currently narrowing the results, and how to undo it.
 *
 * Without this the customer can scroll past an empty grid without realising a
 * filter three screens up is the reason. Each chip removes exactly one filter,
 * which is far easier to reason about than reopening the panel and hunting for
 * the control that is set.
 */
export function ActiveFilters({
  categories,
  locale,
}: {
  categories: CategoryCardData[];
  locale: Locale;
}) {
  const t = useTranslations('shop');
  const { params, navigate } = useShopNavigation();

  if (!hasActiveFilters(params)) return null;

  const chips: { key: string; label: string; clear: Partial<ShopParams> }[] = [];

  if (params.search) {
    chips.push({
      key: 'search',
      label: `“${params.search}”`,
      clear: { search: undefined },
    });
  }

  if (params.category) {
    const match = categories.find((item) => item.slug === params.category);
    chips.push({
      key: 'category',
      // A category that no longer exists still gets a chip, labelled with the
      // slug from the URL — otherwise the filter that is emptying the grid
      // would be invisible and unremovable.
      label: match ? match.name[locale] : params.category,
      clear: { category: undefined },
    });
  }

  if (params.minPrice !== undefined || params.maxPrice !== undefined) {
    const min = params.minPrice;
    const max = params.maxPrice;
    const label =
      min !== undefined && max !== undefined
        ? t('priceRangeLabel', {
            min: formatNumber(min, locale),
            max: formatNumber(max, locale),
          })
        : min !== undefined
          ? t('priceFromLabel', { min: formatNumber(min, locale) })
          : t('priceToLabel', { max: formatNumber(max ?? 0, locale) });

    chips.push({
      key: 'price',
      label,
      clear: { minPrice: undefined, maxPrice: undefined },
    });
  }

  if (params.availability !== DEFAULT_AVAILABILITY) {
    chips.push({
      key: 'availability',
      label:
        params.availability === 'in-stock'
          ? t('availabilityInStock')
          : t('availabilityOutOfStock'),
      clear: { availability: DEFAULT_AVAILABILITY },
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <h2 className="sr-only">{t('activeFilters')}</h2>

      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => navigate(chip.clear)}
          // The visible text is the filter value alone; the accessible name
          // says what pressing this will do.
          aria-label={t('removeFilter', { label: chip.label })}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-beige-300 bg-beige-50 py-1.5 pr-2 pl-3 text-sm text-ink-700 transition-colors hover:border-ink-300 hover:bg-beige-100 focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:outline-none"
        >
          <span className="max-w-[12rem] truncate">{chip.label}</span>
          <X className="h-4 w-4 shrink-0 text-ink-500" aria-hidden="true" />
        </button>
      ))}

      {chips.length > 1 ? (
        <button
          type="button"
          onClick={() => navigate(clearedFilters(params))}
          className="min-h-9 rounded-full px-3 py-1.5 text-sm font-medium text-primary-600 underline underline-offset-2 transition-colors hover:bg-primary-50 focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:outline-none"
        >
          {t('clearAll')}
        </button>
      ) : null}
    </div>
  );
}
