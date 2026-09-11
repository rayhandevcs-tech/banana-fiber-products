import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';

import { routing } from '@/lib/i18n/routing';
import type { Locale } from '@/config/locales';
import { SiteShell } from '@/components/layout/SiteShell';

import '../globals.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'brand' });

  return {
    title: {
      default: `${t('name')} — ${t('tagline')}`,
      template: `%s | ${t('name')}`,
    },
    description: t('shortDescription'),
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
    ),
    // Each locale is an indexable URL with a declared alternate, so search
    // engines and social crawlers resolve the right language.
    alternates: {
      canonical: `/${locale}`,
      languages: { bn: '/bn', en: '/en' },
    },
    openGraph: {
      type: 'website',
      locale: locale === 'bn' ? 'bn_BD' : 'en_US',
      siteName: t('name'),
      title: `${t('name')} — ${t('tagline')}`,
      description: t('shortDescription'),
    },
  };
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  // Zoom is never disabled — pinch-zoom is an accessibility requirement.
  maximumScale: 5,
  themeColor: '#2F5D50',
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Opts this layout into static rendering for the locale.
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <SiteShell locale={locale as Locale} messages={messages}>
      {children}
    </SiteShell>
  );
}
