import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

/**
 * Server-side message loading. Messages are resolved during the server render,
 * so a Bengali visitor never sees a flash of English before hydration.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../../messages/${locale}.json`)).default,
    // Taka everywhere; Bengali uses Bengali numerals via the format helpers.
    now: new Date(),
    timeZone: 'Asia/Dhaka',
  };
});
