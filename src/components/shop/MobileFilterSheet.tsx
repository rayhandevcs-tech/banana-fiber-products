'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { SlidersHorizontal } from 'lucide-react';

import { Modal } from '@/components/ui';
import { hasActiveFilters } from '@/lib/shop/searchParams';
import { FilterPanel, type FilterPanelProps } from './FilterPanel';
import { useShopNavigation } from './ShopNavigation';
import { cn } from '@/lib/utils/cn';

type MobileFilterSheetProps = Omit<FilterPanelProps, 'onApplied' | 'className'> & {
  className?: string;
};

/**
 * Filters on a small screen.
 *
 * A permanent sidebar would push the products off the first screen on a phone,
 * so filtering lives behind one button and opens as a bottom sheet — within
 * thumb reach, and capped at 85vh by `Modal` so it can never grow taller than
 * the screen no matter how many categories exist.
 *
 * The sheet is the design system's `Modal`, which is built on the native
 * `<dialog>` element: focus trapping, Escape to close, and inertness of the
 * page behind it all come from the platform rather than from code that has to
 * be kept correct by hand.
 */
export function MobileFilterSheet({
  categories,
  priceBounds,
  locale,
  className,
}: MobileFilterSheetProps) {
  const t = useTranslations('shop');
  const { params } = useShopNavigation();
  const [open, setOpen] = useState(false);

  const filtersActive = hasActiveFilters(params);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          'inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg border px-4',
          'text-base font-medium transition-colors',
          'focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:outline-none',
          filtersActive
            ? 'border-primary-500 bg-primary-50 text-primary-700'
            : 'border-beige-300 bg-surface text-ink-700 hover:bg-beige-50',
          className,
        )}
      >
        <SlidersHorizontal className="h-4 w-4 shrink-0" aria-hidden="true" />
        {t('filters')}
        {filtersActive ? (
          // A dot, not a count: it says "something is narrowing your results"
          // without adding a number to read at a glance.
          <span
            className="h-2 w-2 shrink-0 rounded-full bg-primary-500"
            aria-hidden="true"
          />
        ) : null}
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t('filtersTitle')}
        closeLabel={t('closeFilters')}
        size="md"
      >
        <FilterPanel
          categories={categories}
          priceBounds={priceBounds}
          locale={locale}
          onApplied={() => setOpen(false)}
        />
      </Modal>
    </>
  );
}
