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
  localeCookie: {
    name: 'NEXT_LOCALE',
    maxAge: 60 * 60 * 24 * 365, // remember the choice for a year
    sameSite: 'lax',
  },
});

/**
 * Locale-aware navigation primitives. Components must import Link/redirect
 * from here rather than from `next/link`, so the active locale is preserved
 * automatically and no component ever has to think about URL prefixes.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
