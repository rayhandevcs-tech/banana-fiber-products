import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';
import { locales, defaultLocale } from '@/config/locales';

/**
 * Locale-prefixed routing: /bn/... and /en/...
 *
 * `localePrefix: 'always'` keeps every URL unambiguous, which matters for SEO
 * (each language gets its own indexable URL and hreflang pair) and means a
 * shared link always opens in the language it was shared in.
 */
export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'always',
  /**
   * Bengali on arrival, whatever the browser asks for.
   *
   * Left on, next-intl negotiates the first visit against `Accept-Language`,
   * so a phone set to English opened the English site even though the shop is
   * Bangladeshi and Bengali is the default. Off, everyone lands on /bn and
   * chooses for themselves.
   *
   * The trade-off, measured rather than assumed: this also stops the
   * NEXT_LOCALE cookie from steering the bare "/" redirect, so someone who
   * switched to English and later opens "/" again lands on Bengali. Only that
   * one entry point is affected — the switcher still works, every /en URL
   * still serves English, and the cookie still keeps them there as they browse.
   */
  localeDetection: false,
  /**
   * No locale cookie, and this is the single biggest thing on the site's
   * speed.
   *
   * next-intl wrote `Set-Cookie: NEXT_LOCALE=…` on EVERY response, not just
   * when the language changed. A response carrying Set-Cookie is specific to
   * one visitor, so Next marks it `private, no-cache, no-store` and neither
   * the CDN nor the ISR cache will ever serve it. Every page view — the
   * homepage, every product, all sixteen content pages — was therefore a full
   * server render plus database round trips, for everyone, every time.
   *
   * Nothing is lost by removing it. The cookie's only job was to steer the
   * bare "/" redirect, and `localeDetection: false` above had already taken
   * that job away, so it was costing the whole site its cacheability while
   * steering nothing. The language lives in the URL (`localePrefix: 'always'`),
   * which is what the switcher changes and what a shared link carries.
   */
  localeCookie: false,
});

/**
 * Locale-aware navigation primitives. Components must import Link/redirect
 * from here rather than from `next/link`, so the active locale is preserved
 * automatically and no component ever has to think about URL prefixes.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
