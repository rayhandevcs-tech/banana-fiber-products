'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Search, X } from 'lucide-react';

import { useRouter } from '@/lib/i18n/routing';
import { buildShopHref } from '@/lib/shop/searchParams';
import { cn } from '@/lib/utils/cn';

/**
 * Search input.
 *
 * Submits into the shop, which owns product discovery: the query becomes
 * `/shop?search=…` and the server renders the matching products. Searching
 * from the header and searching from within the shop therefore land on
 * exactly the same URL, and that URL can be shared or bookmarked.
 */
export function SearchBar({
  className,
  autoFocus = false,
  onClose,
}: {
  className?: string;
  autoFocus?: boolean;
  /** Provided when rendered inside the mobile search overlay. */
  onClose?: () => void;
}) {
  const t = useTranslations('search');
  const router = useRouter();
  const [query, setQuery] = useState('');

  return (
    <form
      role="search"
      className={cn('relative flex w-full items-center', className)}
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = query.trim();
        if (trimmed.length === 0) return;
        // Closes the mobile search overlay before navigating, so the customer
        // is not left looking at the results through an open panel.
        onClose?.();
        router.push(buildShopHref({ search: trimmed }));
      }}
    >
      <label htmlFor="site-search" className="sr-only">
        {t('label')}
      </label>

      <Search
        className="pointer-events-none absolute left-3 h-5 w-5 text-ink-400"
        aria-hidden="true"
      />

      <input
        id="site-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t('placeholder')}
        // Only ever true when the user has explicitly opened the search
        // overlay, where moving focus into the field is what they asked for.
        autoFocus={autoFocus}
        className={cn(
          'h-11 w-full rounded-lg border border-beige-300 bg-surface',
          'pr-10 pl-10 text-base text-ink-800',
          'placeholder:text-ink-400',
          'transition-colors duration-150',
          'focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none',
          // Hide the browser's own clear affordance; we render our own so it
          // matches across browsers.
          '[&::-webkit-search-cancel-button]:appearance-none',
        )}
      />

      {query ? (
        <button
          type="button"
          onClick={() => setQuery('')}
          aria-label={t('clear')}
          className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-full text-ink-400 transition-colors hover:bg-beige-100 hover:text-ink-600"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : onClose ? (
        <button
          type="button"
          onClick={onClose}
          aria-label={t('close')}
          className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-full text-ink-400 transition-colors hover:bg-beige-100 hover:text-ink-600"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : null}
    </form>
  );
}
