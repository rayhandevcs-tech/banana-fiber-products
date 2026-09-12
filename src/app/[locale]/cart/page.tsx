import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import type { Locale } from '@/config/locales';
import { CartView } from '@/components/cart';

/**
 * Cart.
 *
 * A thin Server Component: it owns the metadata and the locale, then hands off
 * to a client view. The cart itself lives in `localStorage`, so there is
 * nothing for the server to render — and nothing for it to fetch. This page
 * makes no database query at all.
 *
 * Deliberately not indexable. Every visitor's cart is different and private to
 * their browser, so there is no shared page here for a search engine to rank,
 * and a crawler would only ever see it empty.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'cartPage' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    robots: { index: false, follow: true },
    alternates: {
      canonical: `/${locale}/cart`,
      languages: { bn: '/bn/cart', en: '/en/cart' },
    },
  };
}

export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const tProduct = await getTranslations({ locale, namespace: 'product' });

  return (
    <CartView
      locale={locale as Locale}
      // Passed down rather than read inside the row: it is one constant label
      // shared by every line, and the rows already take their own translator
      // for the strings that differ.
      originalPriceLabel={tProduct('originalPrice')}
    />
  );
}
