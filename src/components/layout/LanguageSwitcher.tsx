'use client';

import { useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Languages } from 'lucide-react';

import { usePathname, useRouter } from '@/lib/i18n/routing';
import { locales, localeMeta, type Locale } from '@/config/locales';
import { cn } from '@/lib/utils/cn';

/**
 * Switches language without a full page reload.
 *
 * `router.replace` on the same pathname swaps only the locale segment, so the
 * visitor stays exactly where they were — the Next.js router re-renders the
 * server components with the new messages and the URL updates in place.
 *
 * The choice is persisted in the NEXT_LOCALE cookie (configured in routing.ts)
 * and honoured server-side on the next visit, so it survives a refresh.
 */
export function LanguageSwitcher({
  variant = 'inline',
  className,
}: {
  /** `inline` shows both options side by side; `compact` shows one toggle. */
  variant?: 'inline' | 'compact';
  className?: string;
}) {
  const t = useTranslations('language');
  const activeLocale = useLocale() as Locale;
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const switchTo = (nextLocale: Locale) => {
    if (nextLocale === activeLocale) return;
    startTransition(() => {
      router.replace(
        // @ts-expect-error — pathname is typed against known routes; dynamic
        // params are forwarded unchanged so the same page reloads in the new
        // locale.
        { pathname, params },
        { locale: nextLocale },
      );
    });
  };

  if (variant === 'compact') {
    const otherLocale = locales.find((l) => l !== activeLocale)!;
    return (
      <button
        type="button"
        onClick={() => switchTo(otherLocale)}
        disabled={isPending}
        aria-label={t('switchTo', { language: localeMeta[otherLocale].label })}
        className={cn(
          'tap-target flex items-center justify-center gap-1.5 rounded-lg px-2',
          'text-sm font-semibold text-ink-700',
          'transition-colors hover:bg-beige-100',
          'disabled:opacity-60',
          className,
        )}
      >
        <Languages className="h-5 w-5 shrink-0" aria-hidden="true" />
        <span>{localeMeta[otherLocale].shortLabel}</span>
      </button>
    );
  }

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-lg border border-beige-300 bg-surface p-0.5',
        className,
      )}
      role="group"
      aria-label={t('label')}
    >
      {locales.map((locale) => {
        const isActive = locale === activeLocale;
        return (
          <button
            key={locale}
            type="button"
            onClick={() => switchTo(locale)}
            disabled={isPending}
            aria-current={isActive ? 'true' : undefined}
            aria-label={
              isActive
                ? t('current', { language: localeMeta[locale].label })
                : t('switchTo', { language: localeMeta[locale].label })
            }
            className={cn(
              'min-h-11 rounded-md px-4 text-sm font-semibold',
              'transition-colors duration-150',
              'disabled:opacity-60',
              isActive
                ? 'bg-primary-500 text-white'
                : 'text-ink-600 hover:bg-beige-100',
            )}
          >
            {localeMeta[locale].label}
          </button>
        );
      })}
    </div>
  );
}
