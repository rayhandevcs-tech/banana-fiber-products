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
