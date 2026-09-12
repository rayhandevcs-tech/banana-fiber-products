import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import type { Locale } from '@/config/locales';
import { CheckoutView } from '@/components/checkout';
import { getDeliveryOptions } from '@/server/repositories/catalog';

/**
 * Checkout.
 *
 * The server supplies the things that are the same for every customer — the
 * district list and the delivery methods — and the client view supplies the
 * cart, which only the browser knows. Prices and charges belong to neither:
 * they are quoted per request by the checkout actions.
 *
 * As with the product route, there is deliberately no `loading.tsx` anywhere
 * above this page; see the note in products/[slug]/page.tsx.
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
    title: t('metaTitle'),
    description: t('metaDescription'),
    // Never indexed. A checkout is a private, single-use page belonging to one
    // browser's cart; there is nothing here for a search engine to rank and a
    // crawler would only ever see it empty.
    robots: { index: false, follow: false },
  };
}

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const options = await getDeliveryOptions();

  return <CheckoutView locale={locale as Locale} options={options} />;
}
