import type { Metadata } from 'next';
import { SearchX } from 'lucide-react';

import { Link } from '@/lib/i18n/routing';
import { Section, EmptyState } from '@/components/ui';
import { SiteShell } from '@/components/layout/SiteShell';
import { resolveRequestLocale } from '@/lib/i18n/resolveRequestLocale';

import './globals.css';

/**
 * THE 404 PAGE.
 *
 * Why this lives at the root rather than under [locale]:
 *
 * A catch-all route (`[locale]/[...rest]`) MATCHES every unmatched path, so
 * Next treats the request as a successful match and renders `notFound()`
 * inline with HTTP 200 — a soft 404. Removing the catch-all lets the path
 * match nothing, which is what makes Next return a real 404 status. The
 * trade-off is that this page renders outside `[locale]/layout.tsx`, so it
 * builds its own document via the shared <SiteShell> — the same shell the rest
 * of the site uses, so header, footer, fonts and styling stay identical.
 *
 * Locale is resolved from the NEXT_LOCALE cookie that the next-intl middleware
 * writes on every request, falling back to Accept-Language and then to the
 * default. A first-time visitor who lands directly on a broken link before any
 * cookie exists is served by the Accept-Language step.
 */

/** The English catalogue is the canonical shape for both languages. */
type Messages = typeof import('../../messages/en.json');

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveRequestLocale();
  const messages: Messages = (await import(`../../messages/${locale}.json`))
    .default;

  return {
    title: messages.states.notFoundTitle,
    description: messages.states.notFoundBody,
    // A 404 must never be indexed, whatever status the crawler sees.
    robots: { index: false, follow: false },
  };
}

export default async function NotFound() {
  const locale = await resolveRequestLocale();
  const messages: Messages = (await import(`../../messages/${locale}.json`))
    .default;

  const { states, nav } = messages;

  return (
    <SiteShell locale={locale} messages={messages}>
      <Section spacing="lg">
        <EmptyState
          icon={<SearchX className="h-8 w-8" />}
          title={states.notFoundTitle}
          description={states.notFoundBody}
          action={
            // A link, not a Button — an anchor inside a <button> is invalid
            // HTML and breaks keyboard activation.
            <Link
              href="/"
              locale={locale}
              className="inline-flex h-12 items-center justify-center rounded-lg bg-primary-500 px-5 font-semibold text-white transition-colors hover:bg-primary-600"
            >
              {nav.home}
            </Link>
          }
        />
      </Section>
    </SiteShell>
  );
}
