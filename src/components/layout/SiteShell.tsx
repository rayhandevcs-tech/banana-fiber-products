import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { Inter, Noto_Sans_Bengali } from 'next/font/google';

import { localeMeta, type Locale } from '@/config/locales';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ToastProvider } from '@/components/ui';

/**
 * The complete HTML document shell: fonts, <html lang>, skip link, header,
 * footer and the i18n/toast providers.
 *
 * Shared by [locale]/layout.tsx and the ROOT not-found page. The root
 * not-found renders OUTSIDE the locale layout (that is what makes Next return
 * a real 404 status), so without this it would have no header, no footer and
 * no fonts. Keeping one implementation means the 404 can never drift out of
 * visual sync with the rest of the site.
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

export async function SiteShell({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  /** Passed explicitly so the root not-found can supply them without a
   *  request-scoped i18n context. */
  messages: Record<string, unknown>;
  children: ReactNode;
}) {
  const t = await getTranslations({ locale, namespace: 'nav' });
  const tToast = await getTranslations({ locale, namespace: 'toast' });

  return (
    <html
      lang={localeMeta[locale].htmlLang}
      className={`${inter.variable} ${notoSansBengali.variable}`}
    >
      <body className="flex min-h-dvh flex-col">
        <NextIntlClientProvider locale={locale} messages={messages}>
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
