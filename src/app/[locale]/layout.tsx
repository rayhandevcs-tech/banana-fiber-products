import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Inter, Noto_Sans_Bengali } from 'next/font/google';

import { routing } from '@/lib/i18n/routing';
import { localeMeta, type Locale } from '@/config/locales';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ToastProvider } from '@/components/ui';

import '../globals.css';

/**
 * Fonts are self-hosted at build time by next/font — no request to Google at
 * runtime, no render-blocking stylesheet, and no layout shift. Both faces load
 * on every page because product names routinely mix Bengali and Latin (a
 * Bengali title beside a Latin SKU).
 */
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ['bengali'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-bengali',
  display: 'swap',
});

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

  const t = await getTranslations('nav');
  const tToast = await getTranslations('toast');

  return (
    <html
      lang={localeMeta[locale as Locale].htmlLang}
      className={`${inter.variable} ${notoSansBengali.variable}`}
    >
      <body className="flex min-h-dvh flex-col">
        <NextIntlClientProvider>
          <ToastProvider dismissLabel={tToast('dismiss')}>
            {/* Keyboard users reach the content without tabbing the whole nav. */}
            <a
              href="#main-content"
              className="sr-only-focusable absolute top-2 left-2 z-50 inline-flex min-h-11 items-center rounded-lg bg-primary-500 px-4 text-sm font-semibold text-white"
            >
              {t('skipToContent')}
            </a>

            <Header />

            <main id="main-content" className="flex-1">
              {children}
            </main>

            <Footer />
          </ToastProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
