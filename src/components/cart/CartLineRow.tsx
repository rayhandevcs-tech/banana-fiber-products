'use client';

import { useTranslations } from 'next-intl';
import { AlertCircle, Trash2 } from 'lucide-react';

import { Link } from '@/lib/i18n/routing';
import type { Locale } from '@/config/locales';
import { AspectImage, PriceDisplay, QuantitySelector } from '@/components/ui';
import { imageSizes } from '@/config/images';
import { formatMoney, formatNumber } from '@/lib/format/money';
import {
  useCartStore,
  lineTotalPoisha,
  isLineAvailable,
  type CartLine,
} from '@/lib/cart/store';

/**
 * One product in the cart.
 *
 * Laid out as a row from `sm` upward and as a stacked block below it — on a
 * 320px screen a thumbnail, a name, a stepper, a price and a remove button
 * cannot share a line without every one of them becoming too small to use.
 *
 * The stepper's ceiling is `stockAtAdd`, the stock reading taken when the
 * product was put in the cart. It is the only stock figure available to a
 * page that reads from localStorage, and it can be out of date — which is why
 * the summary says availability is confirmed at checkout rather than implying
 * this number is a promise.
 */
export function CartLineRow({
  line,
  locale,
  originalPriceLabel,
}: {
  line: CartLine;
  locale: Locale;
  originalPriceLabel: string;
}) {
  const t = useTranslations('cartPage');
  // The stepper's button labels are generic and already translated for the
  // product page; reusing them keeps one wording rather than two.
  const tProduct = useTranslations('productPage');
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const name = line.name[locale];
  const href = `/products/${line.slug}`;
  const total = lineTotalPoisha(line);
  const available = isLineAvailable(line);

  return (
    <li className="flex gap-3 py-4 sm:gap-4">
      <Link
        href={href}
        className="w-20 shrink-0 overflow-hidden rounded-lg border border-beige-200 sm:w-24"
      >
        <AspectImage
          image={line.image}
          locale={locale}
          ratio="product"
          sizes={imageSizes.productCard}
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-base leading-snug font-medium text-ink-800">
            <Link href={href} className="transition-colors hover:text-primary-600">
              {name}
            </Link>
          </h3>

          <div className="mt-1">
            <PriceDisplay
              pricePoisha={line.pricePoisha}
              discountPoisha={line.discountPoisha}
              locale={locale}
              size="sm"
              originalPriceLabel={originalPriceLabel}
            />
          </div>

          {/* A product that was already unavailable by the last reading we
              had. It is marked rather than removed — silently dropping
              something the customer chose would be worse — and it is excluded
              from the subtotal, so nothing here implies it can be bought. */}
          {!available ? (
            <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-danger-700">
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              {t('unavailable')}
            </p>
          ) : line.stockAtAdd <= 5 ? (
            // Shown only when stock is low enough to actually constrain the
            // stepper, so it reads as a real limit rather than noise.
            <p className="mt-1 text-sm text-ink-500">
              {t('stockLimited', { count: formatNumber(line.stockAtAdd, locale) })}
            </p>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-start sm:gap-2">
          <QuantitySelector
            value={line.quantity}
            onChange={(next) => setQuantity(line.productId, next, line.stockAtAdd)}
            min={1}
            max={Math.max(1, line.stockAtAdd)}
            // Disabled rather than merely capped: with a stock limit of zero
            // the store clamps any requested quantity to zero, which removes
            // the line. Pressing "−" would delete the product instead of
            // decrementing it, which is not what the button says it does.
            disabled={!available}
            label={t('quantityFor', { name })}
            decreaseLabel={tProduct('decreaseQuantity')}
            increaseLabel={tProduct('increaseQuantity')}
          />

          <div className="flex items-center gap-2 sm:flex-col sm:items-end">
            {available ? (
              <p className="text-base font-semibold whitespace-nowrap text-ink-800">
                {formatMoney(total, locale)}
              </p>
            ) : (
              // Deliberately allowed to wrap: this sentence is far longer
              // than a price, and holding it on one line pushed a 320px
              // screen into horizontal scrolling.
              <p className="text-right text-sm text-ink-500">{t('notCounted')}</p>
            )}

            <button
              type="button"
              onClick={() => removeItem(line.productId)}
              // The visible label is just "Remove"; the accessible name says
              // what it removes, so a screen-reader user moving button to
              // button is not met with a column of identical labels.
              aria-label={t('removeNamed', { name })}
              className="tap-target inline-flex items-center gap-1.5 rounded-lg px-2 text-sm text-ink-500 transition-colors hover:bg-danger-50 hover:text-danger-700 focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:outline-none"
            >
              <Trash2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">{t('remove')}</span>
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}
