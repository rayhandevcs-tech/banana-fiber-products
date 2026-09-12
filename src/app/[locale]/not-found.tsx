'use client';

import { SearchX } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { Link } from '@/lib/i18n/routing';
import { Section, EmptyState } from '@/components/ui';
import type { Locale } from '@/config/locales';

/**
 * THE 404 CUSTOMERS ACTUALLY SEE.
 *
 * Every path a person can type reaches this file. The middleware redirects a
 * bare `/nonsense` to `/bn/nonsense`, which matches `[locale]/[page]`, whose
 * `notFound()` renders this boundary — with a real HTTP 404, because there is
 * no `loading.tsx` above it to flush a 200 first. The root `not-found.tsx` is
 * left with only the paths the middleware skips: `/something.php` and the
 * like, which are bots.
 *
 * Deliberately a Client Component, and that is a performance decision rather
 * than an interactivity one. A 404 boundary is part of every route's render
 * tree, so anything it reads from the request — a cookie, a header — opts the
 * WHOLE SITE out of static rendering. Reading the language from
 * `NextIntlClientProvider` instead of from the request keeps every page
 * cacheable. The locale is in the URL here, so nothing is lost.
 */
export default function LocaleNotFound() {
  const t = useTranslations('states');
  const tNav = useTranslations('nav');
  const locale = useLocale() as Locale;

  return (
    <Section spacing="lg">
      <EmptyState
        icon={<SearchX className="h-8 w-8" />}
        title={t('notFoundTitle')}
        description={t('notFoundBody')}
        action={
          // A link, not a Button — an anchor inside a <button> is invalid HTML
          // and breaks keyboard activation.
          <Link
            href="/"
            locale={locale}
            className="inline-flex h-12 items-center justify-center rounded-lg bg-primary-500 px-5 font-semibold text-white transition-colors hover:bg-primary-600"
          >
            {tNav('home')}
          </Link>
        }
      />
    </Section>
  );
}
