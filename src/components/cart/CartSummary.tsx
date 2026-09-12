'use client';

import { useTranslations } from 'next-intl';

import type { Locale } from '@/config/locales';
import { formatMoney } from '@/lib/format/money';
import { CheckoutButton } from './CheckoutButton';

/**
 * Order summary.
 *
 * Shows the subtotal and nothing else, because the subtotal is the only
 * number this application can honestly compute right now: delivery depends on
 * a destination the customer has not given yet, and inventing a placeholder
 * figure — even a zero — would be a quote the shop cannot honour.
 *
 * The two notes below the total are doing real work. One says where the
 * delivery cost comes from, so the subtotal is not mistaken for the amount
 * due. The other says prices and availability are settled at checkout, which
 * is the honest description of a cart held in localStorage: it is a list of
 * intentions, and the server has the last word on both.
 */
export function CartSummary({
  subtotalPoisha,
  locale,
}: {
  subtotalPoisha: number;
  locale: Locale;
}) {
  const t = useTranslations('cartPage');

  return (
    <section
      aria-labelledby="cart-summary-title"
      className="rounded-xl border border-beige-200 bg-surface p-4 sm:p-5"
    >
      <h2
        id="cart-summary-title"
        className="text-lg font-semibold text-ink-800"
      >
        {t('summaryTitle')}
      </h2>

      <dl className="mt-4 flex items-baseline justify-between gap-4 border-t border-beige-200 pt-4">
        <dt className="text-base font-medium text-ink-700">{t('subtotal')}</dt>
        <dd className="text-xl font-bold text-ink-800">
          {formatMoney(subtotalPoisha, locale)}
        </dd>
      </dl>

      <p className="mt-3 text-sm text-ink-500">{t('deliveryNote')}</p>

      <div className="mt-5">
        <CheckoutButton />
      </div>

      <p className="mt-3 text-center text-sm text-ink-500">
        {t('freshnessNote')}
      </p>
    </section>
  );
}
