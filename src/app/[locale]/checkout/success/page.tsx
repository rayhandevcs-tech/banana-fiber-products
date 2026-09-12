import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CheckCircle2 } from 'lucide-react';

import type { Locale } from '@/config/locales';
import { Link } from '@/lib/i18n/routing';
import { Container } from '@/components/ui';
import { formatMoney } from '@/lib/format/money';
import { getOrderConfirmation } from '@/server/actions/checkout';

/**
 * Order confirmation.
 *
 * WHAT THIS PAGE DELIBERATELY DOES NOT SHOW
 * -----------------------------------------
 * No name, phone, email or address. Order numbers run in sequence, so the URL
 * is guessable: anyone could walk BF-2026-00001 upward. The customer who just
 * ordered already knows their own details, and nobody else should be able to
 * collect them by trying numbers. What is left — the order number, what it
 * cost, how it is coming — is what the customer actually needs to see, and is
 * worth little to a stranger.
 *
 * An unrecognised order number is a genuine 404, not a page saying "not
 * found" with a 200 beside it.
 */
export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'checkout' });

  return {
    title: t('successMetaTitle'),
    robots: { index: false, follow: false },
  };
}

export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);
  const activeLocale = locale as Locale;

  const raw = query['order'];
  const orderNumber = Array.isArray(raw) ? raw[0] : raw;
  if (!orderNumber) notFound();

  const order = await getOrderConfirmation(orderNumber);
  if (!order) notFound();

  const t = await getTranslations({ locale, namespace: 'checkout' });

  return (
    <Container width="narrow" className="py-10 sm:py-16">
      <div className="flex flex-col items-center text-center">
        <span
          className="flex h-16 w-16 items-center justify-center rounded-full bg-success-50 text-success-700"
          aria-hidden="true"
        >
          <CheckCircle2 className="h-8 w-8" />
        </span>
        <h1 className="mt-4 text-2xl font-bold text-ink-800 sm:text-3xl">
          {t('successTitle')}
        </h1>
        <p className="mt-2 max-w-md text-base text-ink-600">{t('successBody')}</p>
      </div>

      <div className="mt-8 rounded-xl border border-beige-200 bg-surface p-4 sm:p-6">
        <p className="text-sm text-ink-500">{t('orderNumber')}</p>
        {/* The number is the one thing the customer must keep, so it is the
            largest thing on the card and left in Latin characters in both
            languages — it is an identifier they will read out or type, not a
            quantity to be localised. */}
        <p className="mt-1 font-mono text-2xl font-bold tracking-wide text-ink-800">
          {order.orderNumber}
        </p>
        <p className="mt-2 text-sm text-ink-500">{t('orderNumberNote')}</p>

        <dl className="mt-6 space-y-3 border-t border-beige-200 pt-4">
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-base text-ink-600">{t('successItems')}</dt>
            <dd className="text-base font-medium text-ink-800">
              {t('successItems', { count: order.itemCount })}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-base text-ink-600">{t('successMethod')}</dt>
            <dd className="text-base font-medium text-ink-800">
              {order.methodName[activeLocale]}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-base text-ink-600">{t('deliveryCharge')}</dt>
            <dd className="text-base font-medium text-ink-800">
              {order.deliveryChargePoisha === 0
                ? t('freeDelivery')
                : formatMoney(order.deliveryChargePoisha, activeLocale)}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 border-t border-beige-200 pt-3">
            <dt className="text-base font-semibold text-ink-800">{t('successTotal')}</dt>
            <dd className="text-xl font-bold text-ink-800">
              {formatMoney(order.totalPoisha, activeLocale)}
            </dd>
          </div>
        </dl>

        <div className="mt-6 rounded-lg bg-beige-50 p-3">
          <p className="text-sm font-medium text-ink-700">{t('paymentCod')}</p>
          <p className="mt-0.5 text-sm text-ink-500">{t('paymentCodNote')}</p>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <Link
          href="/shop"
          className="inline-flex h-12 items-center justify-center rounded-lg bg-primary-500 px-6 text-base font-semibold text-white shadow-xs transition-colors hover:bg-primary-600 focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:outline-none"
        >
          {t('continueShopping')}
        </Link>
      </div>
    </Container>
  );
}
