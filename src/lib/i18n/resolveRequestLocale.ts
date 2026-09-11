import 'server-only';
import { cookies, headers } from 'next/headers';
import { defaultLocale, isLocale, type Locale } from '@/config/locales';

/**
 * Best-effort locale for pages that render OUTSIDE the [locale] segment —
 * in practice, the root 404, which has no locale in its route.
 *
 * Order of preference:
 *   1. The NEXT_LOCALE cookie, which the next-intl middleware writes on every
 *      request, so anyone who has already browsed the site keeps their choice.
 *   2. Accept-Language, which covers a first-time visitor arriving straight on
 *      a broken link before any cookie exists.
 *   3. The default locale (Bengali).
 */
export async function resolveRequestLocale(): Promise<Locale> {
  const cookieLocale = (await cookies()).get('NEXT_LOCALE')?.value;
  if (cookieLocale && isLocale(cookieLocale)) return cookieLocale;

  const acceptLanguage = (await headers()).get('accept-language') ?? '';
  // Bengali is checked first: a Bengali speaker should never be shown English
  // just because the header happens to list both.
  if (/(^|[,\s])bn\b/i.test(acceptLanguage)) return 'bn';
  if (/(^|[,\s])en\b/i.test(acceptLanguage)) return 'en';

  return defaultLocale;
}
