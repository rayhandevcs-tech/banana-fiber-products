/**
 * Locale configuration — the single source of truth for which languages the
 * application supports and how they are presented.
 *
 * Bengali is the DEFAULT: the audience is Bangladeshi, so English is the
 * alternate rather than the baseline.
 */

export const locales = ['bn', 'en'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'bn';

/** Presentation metadata for the language switcher. */
export const localeMeta: Record<
  Locale,
  { label: string; shortLabel: string; htmlLang: string }
> = {
  bn: { label: 'বাংলা', shortLabel: 'বাং', htmlLang: 'bn' },
  en: { label: 'English', shortLabel: 'EN', htmlLang: 'en' },
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
