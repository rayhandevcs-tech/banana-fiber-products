import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Clock3 } from 'lucide-react';

import { Link } from '@/lib/i18n/routing';
import { Section, EmptyState } from '@/components/ui';

/**
 * PAGES THAT ARE LINKED BUT NOT BUILT YET.
 *
 * The header, the mobile drawer and the footer have always linked to these
 * eight destinations. None of them existed, so every one produced a 404 — and
 * because Next prefetches links as they enter the viewport, simply scrolling
 * to the footer fired a handful of 404 requests on every page of the site.
 *
 * This is deliberately NOT an implementation of any of them. Each is a real
 * feature belonging to a later sprint; this route only ensures that a link a
 * customer can see never leads to a dead end, and says plainly what is coming
 * so nobody is left wondering whether the site is broken.
 *
 * When a sprint builds one of these for real, it adds the route folder — a
 * static segment beats this dynamic one in Next's matcher, so the real page
 * takes over with no change here beyond removing its slug from the list.
 *
 * Unknown slugs still 404 properly: `notFound()` below runs on a dynamically
 * rendered path with no Suspense boundary above it, so Next sends a genuine
 * 404 status rather than the soft 200 that a `loading.tsx` would cause.
 */
const PENDING_PAGES = [
  'about',
  'contact',
  'how-its-made',
  'track-order',
  'faq',
  'delivery-information',
  'return-policy',
  'privacy-policy',
] as const;

type PendingPage = (typeof PENDING_PAGES)[number];

const isPendingPage = (value: string): value is PendingPage =>
  (PENDING_PAGES as readonly string[]).includes(value);

export function generateStaticParams() {
  return PENDING_PAGES.map((page) => ({ page }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; page: string }>;
}): Promise<Metadata> {
  const { locale, page } = await params;
  if (!isPendingPage(page)) return {};

  const t = await getTranslations({ locale, namespace: 'pending' });

  return {
    title: t(`pages.${page}.title`),
    description: t(`pages.${page}.body`),
    // Nothing here is worth ranking, and indexing it would put an empty page
    // in front of a search visitor looking for the real thing.
    robots: { index: false, follow: true },
  };
}

export default async function PendingPageRoute({
  params,
}: {
  params: Promise<{ locale: string; page: string }>;
}) {
  const { locale, page } = await params;
  if (!isPendingPage(page)) notFound();

  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'pending' });

  return (
    <Section spacing="lg">
      <h1 className="sr-only">{t(`pages.${page}.title`)}</h1>
      {/* Says outright that the page is unfinished, so a customer who arrives
          here knows the site is working and this part simply is not ready. */}
      <p className="flex justify-center">
        <span className="inline-flex items-center rounded-full bg-beige-100 px-3 py-1 text-sm font-medium text-ink-600">
          {t('badge')}
        </span>
      </p>
      <EmptyState
        icon={<Clock3 className="h-8 w-8" />}
        title={t(`pages.${page}.title`)}
        description={t(`pages.${page}.body`)}
        action={
          <div className="flex flex-col items-center gap-3">
            <p className="max-w-sm text-base text-ink-500">{t('note')}</p>
            {/* Anchors, not buttons: a link inside a <button> is invalid HTML
                and breaks keyboard activation. Same pattern as the 404 page. */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/shop"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-primary-500 px-6 text-base font-semibold text-white transition-colors hover:bg-primary-600 focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:outline-none"
              >
                {t('shopCta')}
              </Link>
              <Link
                href="/"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-beige-300 px-6 text-base font-semibold text-ink-700 transition-colors hover:bg-beige-50 focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:outline-none"
              >
                {t('homeCta')}
              </Link>
            </div>
          </div>
        }
      />
    </Section>
  );
}
