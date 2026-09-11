import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import type { Locale } from '@/config/locales';
import { formatNumber } from '@/lib/format/money';
import { PageLink } from './PageLink';
import { cn } from '@/lib/utils/cn';

/**
 * Pagination.
 *
 * Real `<a href>` links, not buttons: each page is a genuine URL that a search
 * engine can crawl and a customer can share, and ctrl-clicking one opens it in
 * a new tab as expected. They still navigate client-side, through the verified
 * navigation helper rather than a bare `Link` (see `PageLink`).
 *
 * A Server Component — it ships no JavaScript of its own.
 *
 * Chosen over "load more" deliberately: infinite lists lose their place on
 * refresh, cannot be linked to, and give no sense of how much is left. Numbered
 * pages tell the customer where they are and survive being bookmarked.
 */
export function Pagination({
  page,
  pageCount,
  locale,
}: {
  page: number;
  pageCount: number;
  locale: Locale;
}) {
  const t = useTranslations('shop');

  if (pageCount <= 1) return null;

  const pages = pageWindow(page, pageCount);

  return (
    <nav
      aria-label={t('pagination')}
      className="mt-8 flex flex-col items-center gap-3"
    >
      <ul className="flex flex-wrap items-center justify-center gap-1.5">
        <li>
          <PageArrow
            page={page - 1}
            disabled={page <= 1}
            label={t('previousPage')}
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </PageArrow>
        </li>

        {/* The numbers are the precise control; on the narrowest screens the
            "page X of Y" line below carries the same information in less
            space, so they are allowed to hide there. */}
        {pages.map((entry, index) =>
          entry === 'gap' ? (
            <li
              key={`gap-${index}`}
              aria-hidden="true"
              className="hidden px-1 text-ink-400 xs:block"
            >
              …
            </li>
          ) : (
            <li key={entry} className="hidden xs:block">
              <PageNumber
                page={entry}
                current={entry === page}
                label={
                  entry === page
                    ? t('currentPage', { page: formatNumber(entry, locale) })
                    : t('goToPage', { page: formatNumber(entry, locale) })
                }
              >
                {formatNumber(entry, locale)}
              </PageNumber>
            </li>
          ),
        )}

        <li>
          <PageArrow
            page={page + 1}
            disabled={page >= pageCount}
            label={t('nextPage')}
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </PageArrow>
        </li>
      </ul>

      <p className="text-sm text-ink-500">
        {t('pageStatus', {
          page: formatNumber(page, locale),
          pageCount: formatNumber(pageCount, locale),
        })}
      </p>
    </nav>
  );
}

/**
 * Which page numbers to show: always the first and last, plus a window around
 * the current page, with gaps standing in for the rest. Keeps the control a
 * fixed width however large the catalogue grows.
 */
function pageWindow(page: number, pageCount: number): (number | 'gap')[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const entries: (number | 'gap')[] = [1];
  const from = Math.max(2, page - 1);
  const to = Math.min(pageCount - 1, page + 1);

  if (from > 2) entries.push('gap');
  for (let current = from; current <= to; current += 1) entries.push(current);
  if (to < pageCount - 1) entries.push('gap');

  entries.push(pageCount);
  return entries;
}

const cellClasses =
  'inline-flex h-11 min-w-11 items-center justify-center rounded-lg border px-3 text-base transition-colors focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:outline-none';

function PageArrow({
  page,
  disabled,
  label,
  children,
}: {
  page: number;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  if (disabled) {
    // Rendered as a disabled span rather than a dead link: there is no page
    // beyond the ends, so there should be nothing to focus or activate.
    return (
      <span
        aria-hidden="true"
        className={cn(cellClasses, 'border-beige-200 text-ink-300')}
      >
        {children}
      </span>
    );
  }

  return (
    <PageLink
      page={page}
      label={label}
      className={cn(
        cellClasses,
        'border-beige-300 text-ink-700 hover:border-ink-300 hover:bg-beige-50',
      )}
    >
      {children}
    </PageLink>
  );
}

function PageNumber({
  page,
  current,
  label,
  children,
}: {
  page: number;
  current: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <PageLink
      page={page}
      label={label}
      current={current}
      className={cn(
        cellClasses,
        current
          ? 'border-primary-500 bg-primary-500 font-semibold text-white'
          : 'border-beige-300 text-ink-700 hover:border-ink-300 hover:bg-beige-50',
      )}
    >
      {children}
    </PageLink>
  );
}
