import type { Locale } from '@/config/locales';
import {
  formatMoney,
  formatNumber,
  effectivePrice,
  discountPercent,
} from '@/lib/format/money';
import { cn } from '@/lib/utils/cn';

export interface PriceDisplayProps {
  pricePoisha: number;
  discountPoisha?: number;
  locale: Locale;
  size?: 'sm' | 'md' | 'lg';
  /** Screen-reader label for the original price when discounted. */
  originalPriceLabel: string;
  className?: string;
}

const sizeClasses = {
  sm: { current: 'text-base', original: 'text-sm' },
  md: { current: 'text-lg', original: 'text-sm' },
  lg: { current: 'text-2xl sm:text-3xl', original: 'text-base' },
} as const;

/**
 * Renders a price, with the original struck through when discounted.
 *
 * Bengali gets Bengali numerals and lakh/crore digit grouping via `Intl`, so
 * ৳১,২৫০ reads naturally rather than as a transliterated English number.
 */
export function PriceDisplay({
  pricePoisha,
  discountPoisha = 0,
  locale,
  size = 'md',
  originalPriceLabel,
  className,
}: PriceDisplayProps) {
  const hasDiscount = discountPoisha > 0;
  const finalPrice = effectivePrice(pricePoisha, discountPoisha);
  const classes = sizeClasses[size];

  return (
    <p className={cn('flex flex-wrap items-baseline gap-x-2 gap-y-0.5', className)}>
      <span className={cn('font-bold text-ink-800', classes.current)}>
        {formatMoney(finalPrice, locale)}
      </span>

      {hasDiscount ? (
        <>
          <span
            className={cn('text-ink-400 line-through', classes.original)}
            // Struck-through text is ambiguous to a screen reader without a
            // label saying what it is.
            aria-label={`${originalPriceLabel} ${formatMoney(pricePoisha, locale)}`}
          >
            {formatMoney(pricePoisha, locale)}
          </span>
          <span className="rounded-full bg-clay-50 px-1.5 py-0.5 text-xs font-semibold text-clay-700">
            −{formatNumber(discountPercent(pricePoisha, discountPoisha), locale)}%
          </span>
        </>
      ) : null}
    </p>
  );
}
