'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Search, X } from 'lucide-react';

import { useShopNavigation } from './ShopNavigation';
import { cn } from '@/lib/utils/cn';

/** Long enough to absorb a burst of typing, short enough to feel immediate. */
const DEBOUNCE_MS = 400;

/**
 * Shop search.
 *
 * The field holds the keystrokes; the URL holds the query. They are kept in
 * step by a plain `setTimeout` — a debounce is four lines here and does not
 * justify a dependency.
 *
 * Filtering happens in PostgreSQL. The browser never receives the catalogue,
 * so this stays fast on a slow connection and a large catalogue alike.
 */
export function ShopSearch({ className }: { className?: string }) {
  const t = useTranslations('shop');
  const { params, navigate } = useShopNavigation();
  const inputId = useId();

  const [value, setValue] = useState(params.search ?? '');

  // The query the customer has settled on, as opposed to what they are part
  // way through typing. The timer below only moves the term into this state;
  // the navigation itself happens in an effect.
  //
  // That split is not stylistic. `navigate` runs the router inside a React
  // transition, and a transition started from a bare `setTimeout` callback is
  // detached from React's lifecycle: the push is issued and silently dropped,
  // so the URL never changes. Driving it from an effect keeps the navigation
  // inside React's own commit, where the transition is honoured.
  const [committed, setCommitted] = useState<string | null>(null);

  // The URL can change without this field causing it: a filter chip is
  // removed, "clear filters" is pressed, or the customer uses the browser's
  // back button. Re-sync when that happens, but never while the customer is
  // typing into the field, which would fight their cursor.
  const urlSearch = params.search ?? '';
  const lastUrlSearch = useRef(urlSearch);
  useEffect(() => {
    if (lastUrlSearch.current !== urlSearch) {
      lastUrlSearch.current = urlSearch;
      setValue(urlSearch);
    }
  }, [urlSearch]);

  /** Ask for a term to become the URL. Safe to call from anywhere. */
  function commit(next: string) {
    setCommitted(next.trim());
  }

  // Debounced: cleared on every keystroke, so a burst of typing asks for
  // exactly one navigation.
  //
  // The guard matters more than it looks. Without it the timer is armed on
  // every mount and every re-render, and fires a state update ~400ms later
  // even when the field already agrees with the URL. That stray update lands
  // in the middle of whatever navigation another control has in flight and
  // interrupts its transition, which drops the push and leaves the URL
  // unchanged — a filter click that silently does nothing, roughly one time
  // in five. No timer is armed unless there is genuinely something to commit.
  useEffect(() => {
    if (value.trim() === urlSearch) return;
    const timer = setTimeout(() => setCommitted(value.trim()), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [value, urlSearch]);

  // The navigation itself. `committed` is left alone afterwards rather than
  // being reset to null: once the URL catches up, `committed === urlSearch`
  // stops this from firing again, and skipping the reset saves a render.
  useEffect(() => {
    if (committed === null || committed === urlSearch) return;
    lastUrlSearch.current = committed;
    navigate({ search: committed.length > 0 ? committed : undefined });
  }, [committed, urlSearch, navigate]);

  return (
    <form
      role="search"
      className={cn('relative flex w-full items-center', className)}
      onSubmit={(event) => {
        // Enter should not wait out the debounce, and must not reload the page.
        event.preventDefault();
        commit(value);
      }}
    >
      <label htmlFor={inputId} className="sr-only">
        {t('searchLabel')}
      </label>

      <Search
        className="pointer-events-none absolute left-3 h-5 w-5 text-ink-400"
        aria-hidden="true"
      />

      <input
        id={inputId}
        type="search"
        name="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={t('searchPlaceholder')}
        // 48px clears the touch minimum; text-base stops iOS Safari zooming
        // the viewport when the field takes focus.
        className={cn(
          'h-12 w-full rounded-lg border border-beige-300 bg-surface',
          'pr-11 pl-10 text-base text-ink-800',
          'placeholder:text-ink-400',
          'transition-colors duration-150',
          'focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none',
          // Our own clear button replaces the browser's, which differs between
          // engines and is too small to tap reliably.
          '[&::-webkit-search-cancel-button]:appearance-none',
        )}
      />

      {value ? (
        <button
          type="button"
          onClick={() => {
            setValue('');
            commit('');
          }}
          aria-label={t('searchClear')}
          className="absolute right-1 flex h-10 w-10 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-beige-100 hover:text-ink-700 focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:outline-none"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : null}
    </form>
  );
}
