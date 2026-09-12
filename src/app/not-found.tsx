import type { Metadata } from 'next';
import { SearchX } from 'lucide-react';

import { Link } from '@/lib/i18n/routing';
import { Section, EmptyState } from '@/components/ui';
import { SiteShell } from '@/components/layout/SiteShell';
import { defaultLocale } from '@/config/locales';
import messages from '../../messages/bn.json';

import './globals.css';

/**
 * THE ROOT 404 — for paths the middleware never touches.
 *
 * Almost nobody reaches this file. The next-intl middleware redirects every
 * localisable path into a locale segment, so a mistyped URL lands on
 * `[locale]/not-found.tsx` with the right language. What is left here is the
 * paths the middleware matcher skips — anything containing a dot
 * (`/wp-login.php`, `/favicon.ico`) and `/api` — which is crawlers and
 * scanners, not customers.
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
 * WHY IT IS FIXED TO THE DEFAULT LOCALE, and must stay that way:
 *
 * It used to pick the language from the NEXT_LOCALE cookie and Accept-Language.
 * That was one `cookies()` call — and because a root `not-found.tsx` sits in
 * the render tree of EVERY route, that single call opted the entire site out
 * of static rendering. Nothing was prerendered; the homepage, the shop and all
 * sixteen content pages were re-rendered from the database on every request.
 * Removing it took the build from 0 prerendered pages to 67.
 *
 * So: no cookies, no headers, no request reads of any kind in this file.
 * A crawler gets Bengali, which is the site's default language anyway.
 */
export const metadata: Metadata = {
  title: messages.states.notFoundTitle,
  description: messages.states.notFoundBody,
  // A 404 must never be indexed, whatever status the crawler sees.
  robots: { index: false, follow: false },
};

export default function NotFound() {
  const { states, nav } = messages;

  return (
    <SiteShell locale={defaultLocale} messages={messages}>
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
              locale={defaultLocale}
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
