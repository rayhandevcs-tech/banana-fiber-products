'use client';

import { useEffect, useId, useState } from 'react';
import { useTranslations } from 'next-intl';

import type { Locale } from '@/config/locales';
import type { CategoryCardData } from '@/types/content';
import {
  AVAILABILITY_OPTIONS,
  poishaToTakaBound,
  type AvailabilityOption,
} from '@/lib/shop/searchParams';
import { formatNumber } from '@/lib/format/money';
import { useShopNavigation } from './ShopNavigation';
import { cn } from '@/lib/utils/cn';

export interface FilterPanelProps {
  categories: CategoryCardData[];
  priceBounds: { min: number; max: number };
  locale: Locale;
  /** Called after a filter is applied, so the mobile sheet can close itself. */
  onApplied?: () => void;
  className?: string;
}

/**
 * Category, price and availability.
 *
 * Rendered twice — once in the desktop sidebar, once inside the mobile sheet —
 * and that is safe precisely because it stores nothing: every control reads
 * from and writes to the URL. The two instances cannot drift apart, and the
 * one that is hidden by CSS is not exposed to assistive technology. Field ids
 * come from `useId`, so the duplicate instances never collide.
 *
 * Radio groups rather than a custom dropdown: they show every option at once,
 * are operable with the keyboard for free, and give a 44px target per row.
 */
export function FilterPanel({
  categories,
  priceBounds,
  locale,
  onApplied,
  className,
}: FilterPanelProps) {
  const t = useTranslations('shop');
  const { params, navigate } = useShopNavigation();

  const categoryName = useId();
  const availabilityName = useId();
  const minId = useId();
  const maxId = useId();

  const minBound = poishaToTakaBound(priceBounds.min, 'floor');
  const maxBound = poishaToTakaBound(priceBounds.max, 'ceil');

  // Price is the one filter that cannot be applied per keystroke: "5" on the
  // way to "500" would wipe the results. The fields hold their own text and
  // commit on blur, on Enter, or when the panel's apply button is pressed.
  const [minPrice, setMinPrice] = useState(params.minPrice?.toString() ?? '');
  const [maxPrice, setMaxPrice] = useState(params.maxPrice?.toString() ?? '');

  // Re-sync when the URL changes from elsewhere (a chip removed, filters
  // cleared, the browser's back button).
  useEffect(() => {
    setMinPrice(params.minPrice?.toString() ?? '');
  }, [params.minPrice]);
  useEffect(() => {
    setMaxPrice(params.maxPrice?.toString() ?? '');
  }, [params.maxPrice]);

  /** Whole Taka only — money never passes through a float in this codebase. */
  function toPrice(raw: string): number | undefined {
    const digits = raw.replace(/\D/g, '');
    if (digits.length === 0) return undefined;
    return Number(digits);
  }

  function commitPrice() {
    const next = { minPrice: toPrice(minPrice), maxPrice: toPrice(maxPrice) };
    if (next.minPrice === params.minPrice && next.maxPrice === params.maxPrice) {
      return;
    }
    navigate(next);
  }

  const availabilityLabels: Record<AvailabilityOption, string> = {
    all: t('availabilityAll'),
    'in-stock': t('availabilityInStock'),
    'out-of-stock': t('availabilityOutOfStock'),
  };

  const priceInputClass = cn(
    'h-12 w-full rounded-lg border border-beige-300 bg-surface px-3',
    'text-base text-ink-800 placeholder:text-ink-400',
    'transition-colors duration-150',
    'focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none',
  );

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {/* Category ------------------------------------------------------- */}
      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-ink-700">
          {t('category')}
        </legend>
        <div className="flex flex-col">
          <FilterRadio
            name={categoryName}
            checked={params.category === undefined}
            onChange={() => navigate({ category: undefined })}
            label={t('allCategories')}
          />
          {categories.map((category) => (
            <FilterRadio
              key={category.slug}
              name={categoryName}
              checked={params.category === category.slug}
              onChange={() => navigate({ category: category.slug })}
              label={category.name[locale]}
              hint={
                category.productCount === undefined
                  ? undefined
                  : formatNumber(category.productCount, locale)
              }
            />
          ))}
        </div>
      </fieldset>

      {/* Price ---------------------------------------------------------- */}
      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-ink-700">
          {t('price')}
        </legend>
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <label htmlFor={minId} className="sr-only">
              {t('minPrice')}
            </label>
            <input
              id={minId}
              // `inputMode="numeric"` brings up the number pad on a phone
              // without the spinner arrows a `type="number"` field adds.
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              onBlur={commitPrice}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  commitPrice();
                }
              }}
              placeholder={t('pricePlaceholderMin', {
                min: formatNumber(minBound, locale),
              })}
              className={priceInputClass}
            />
          </div>
          <span className="text-ink-400" aria-hidden="true">
            –
          </span>
          <div className="min-w-0 flex-1">
            <label htmlFor={maxId} className="sr-only">
              {t('maxPrice')}
            </label>
            <input
              id={maxId}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              onBlur={commitPrice}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  commitPrice();
                }
              }}
              placeholder={t('pricePlaceholderMax', {
                max: formatNumber(maxBound, locale),
              })}
              className={priceInputClass}
            />
          </div>
        </div>
        <p className="mt-2 text-sm text-ink-500">
          {t('priceHint', {
            min: formatNumber(minBound, locale),
            max: formatNumber(maxBound, locale),
          })}
        </p>
      </fieldset>

      {/* Availability --------------------------------------------------- */}
      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-ink-700">
          {t('availability')}
        </legend>
        <div className="flex flex-col">
          {AVAILABILITY_OPTIONS.map((option) => (
            <FilterRadio
              key={option}
              name={availabilityName}
              checked={params.availability === option}
              onChange={() => navigate({ availability: option })}
              label={availabilityLabels[option]}
            />
          ))}
        </div>
      </fieldset>

      {onApplied ? (
        <button
          type="button"
          onClick={() => {
            // Catch a price the customer typed but never blurred out of before
            // reaching for this button.
            commitPrice();
            onApplied();
          }}
          className="h-12 w-full rounded-lg bg-primary-500 px-5 text-base font-semibold text-white shadow-xs transition-colors hover:bg-primary-600 active:bg-primary-700 focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:outline-none"
        >
          {t('applyFilters')}
        </button>
      ) : null}
    </div>
  );
}

/**
 * One filter option.
 *
 * A real `<input type="radio">` under a label, so the whole 44px row is the
 * target and keyboard and screen-reader behaviour come from the platform. The
 * input is visually replaced, never hidden from assistive technology.
 */
function FilterRadio({
  name,
  checked,
  onChange,
  label,
  hint,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  label: string;
  hint?: string | undefined;
}) {
  return (
    <label
      className={cn(
        'flex min-h-11 cursor-pointer items-center gap-2.5 rounded-md px-2 py-2',
        'transition-colors hover:bg-beige-50',
        'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary-500/40',
      )}
    >
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="h-5 w-5 shrink-0 accent-primary-500"
      />
      <span
        className={cn(
          'min-w-0 flex-1 text-base',
          checked ? 'font-medium text-ink-800' : 'text-ink-700',
        )}
      >
        {label}
      </span>
      {hint ? (
        <span className="shrink-0 text-sm text-ink-400" aria-hidden="true">
          {hint}
        </span>
      ) : null}
    </label>
  );
}
