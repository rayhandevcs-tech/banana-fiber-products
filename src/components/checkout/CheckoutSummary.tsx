'use client';

import { useTranslations } from 'next-intl';
import { AlertTriangle, Info } from 'lucide-react';

import type { Locale } from '@/config/locales';
import { Skeleton } from '@/components/ui';
import { formatMoney, formatNumber } from '@/lib/format/money';
import type { Quote, QuoteLine } from '@/server/checkout/quote';

/**
 * What the shop says this order costs.
 *
 * Every number here arrived from the server, priced from the database at the
 * moment of asking. Nothing is computed in the browser and nothing is read
 * out of the cart — if the two disagree, this is the side that is right, and
 * the customer is told where they differ rather than being quietly charged
 * the newer price without explanation.
 */
export function CheckoutSummary({
  locale,
  quote,
  quoting,
  blocking,
  snapshotPrices,
  hasDelivery,
}: {
  locale: Locale;
  quote: Quote | null;
  quoting: boolean;
  blocking: QuoteLine[];
  /** The cart's own idea of each unit price, used only to flag changes. */
  snapshotPrices: Map<string, number>;
  hasDelivery: boolean;
}) {
  const t = useTranslations('checkout');

  if (!quote) {
    return (
      <section className="rounded-xl border border-beige-200 bg-surface p-4 sm:p-5">
        <h2 className="text-lg font-semibold text-ink-800">{t('summaryHeading')}</h2>
        <div className="mt-4 space-y-3" aria-hidden="true">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-8 w-1/2" />
        </div>
      </section>
    );
  }

  const problemMessage = (line: QuoteLine): string => {
    switch (line.problem) {
      case 'not-found':
        return t('problemNotFound');
      case 'unavailable':
        return t('problemUnavailable');
      case 'out-of-stock':
        return t('problemOutOfStock');
      case 'insufficient-stock':
        return t('problemInsufficientStock', {
          available: formatNumber(line.stock, locale),
        });
      default:
        return t('problemInvalidQuantity');
    }
  };

  return (
    <section
      aria-labelledby="checkout-summary-title"
      aria-busy={quoting}
      className="rounded-xl border border-beige-200 bg-surface p-4 sm:p-5"
    >
      <h2 id="checkout-summary-title" className="text-lg font-semibold text-ink-800">
        {t('summaryHeading')}
      </h2>

      {blocking.length > 0 ? (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-danger-500/40 bg-danger-50 p-3"
        >
          <h3 className="flex items-center gap-2 text-sm font-semibold text-danger-700">
            <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
            {t('problemsHeading')}
          </h3>
          <ul className="mt-2 space-y-1.5">
            {blocking.map((line) => (
              <li key={line.productId} className="text-sm text-danger-700">
                <span className="font-medium">
                  {line.name[locale] || t('unknownProduct')}
                </span>
                {' — '}
                {problemMessage(line)}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <ul className="mt-4 divide-y divide-beige-200 border-y border-beige-200">
        {quote.lines.map((line) => {
          const snapshot = snapshotPrices.get(line.productId);
          const priceChanged =
            line.problem === null &&
            snapshot !== undefined &&
            snapshot !== line.unitPricePoisha;

          return (
            <li key={line.productId} className="flex items-start gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink-800">
                  {line.name[locale] || t('unknownProduct')}
                </p>
                <p className="mt-0.5 text-sm text-ink-500">
                  {formatMoney(line.unitPricePoisha, locale)}{' '}
                  {t('quantityShort', { count: formatNumber(line.quantity, locale) })}
                </p>
                {/* The order will be placed at the price shown, so a change is
                    stated plainly rather than slipped past the customer. */}
                {priceChanged ? (
                  <p className="mt-1 flex items-start gap-1.5 text-sm text-warning-700">
                    <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    {t('priceChanged')}
                  </p>
                ) : null}
              </div>
              <p className="shrink-0 text-sm font-semibold whitespace-nowrap text-ink-800">
                {formatMoney(line.lineTotalPoisha, locale)}
              </p>
            </li>
          );
        })}
      </ul>

      <dl className="mt-4 space-y-2">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-base text-ink-600">{t('subtotal')}</dt>
          <dd className="text-base font-medium text-ink-800">
            {formatMoney(quote.subtotalPoisha, locale)}
          </dd>
        </div>

        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-base text-ink-600">{t('deliveryCharge')}</dt>
          <dd className="text-base font-medium text-ink-800">
            {!hasDelivery || !quote.delivery ? (
              <span className="text-sm font-normal text-ink-500">
                {t('deliveryPending')}
              </span>
            ) : quote.delivery.isFree ? (
              // The waiver is a rule in the delivery_rates table, not a
              // promotion invented here.
              <span className="text-success-700">{t('freeDelivery')}</span>
            ) : (
              formatMoney(quote.deliveryChargePoisha, locale)
            )}
          </dd>
        </div>

        <div className="flex items-baseline justify-between gap-4 border-t border-beige-200 pt-3">
          <dt className="text-base font-semibold text-ink-800">{t('total')}</dt>
          <dd className="text-xl font-bold text-ink-800">
            {formatMoney(quote.totalPoisha, locale)}
          </dd>
        </div>
      </dl>

      <div className="mt-4 rounded-lg bg-beige-50 p-3">
        <h3 className="text-sm font-semibold text-ink-700">{t('paymentHeading')}</h3>
        <p className="mt-1 text-sm text-ink-600">{t('paymentCod')}</p>
        <p className="mt-0.5 text-sm text-ink-500">{t('paymentCodNote')}</p>
      </div>

      <p className="mt-3 text-sm text-ink-500">{t('priceNote')}</p>
    </section>
  );
}
