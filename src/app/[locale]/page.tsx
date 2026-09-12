import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import type { Locale } from '@/config/locales';
import {
  getFeaturedProducts,
  getFeaturedCategories,
} from '@/server/repositories/catalog';
import {
  Hero,
  FeaturedCategories,
  FeaturedProducts,
  WhyChooseUs,
  HowItsMade,
  ArtisanStory,
  Testimonials,
  HomeCta,
} from '@/components/home';

/**
 * Homepage.
 *
 * A Server Component: the product and category data is fetched during the
 * server render, so the HTML that reaches a phone already contains the
 * products, the prices and the hero image reference. Nothing waits for
 * JavaScript — which is the difference between a usable and an unusable shop
 * on a slow connection.
 *
 * Revalidated every five minutes so price and stock changes appear without a
 * redeploy, while still serving a cached page to most visitors.
 */
export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });
  const tBrand = await getTranslations({ locale, namespace: 'brand' });

  return {
    // The layout's `%s | brand` template only reaches CHILD segments, and the
    // homepage shares the [locale] segment with the layout that defines it —
    // so without this the shop's name is missing from the title of the one
    // page most likely to be shared.
    title: `${t('metaTitle')} | ${tBrand('name')}`,
    description: t('metaDescription'),
    alternates: {
      canonical: `/${locale}`,
      languages: { bn: '/bn', en: '/en' },
    },
    openGraph: {
      title: t('metaTitle'),
      description: t('metaDescription'),
      url: `/${locale}`,
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const activeLocale = locale as Locale;

  // Fetched in parallel — neither query depends on the other.
  const [products, categories] = await Promise.all([
    getFeaturedProducts(8),
    getFeaturedCategories(6),
  ]);

  return (
    <>
      <Hero locale={activeLocale} />
      <FeaturedCategories categories={categories} locale={activeLocale} />
      <FeaturedProducts products={products} locale={activeLocale} />
      <WhyChooseUs />
      <HowItsMade locale={activeLocale} />
      <ArtisanStory locale={activeLocale} />
      <Testimonials locale={activeLocale} />
      <HomeCta />
    </>
  );
}
