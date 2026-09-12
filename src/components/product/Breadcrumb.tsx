import { ChevronRight } from 'lucide-react';

import { Link } from '@/lib/i18n/routing';
import { cn } from '@/lib/utils/cn';

export interface Crumb {
  label: string;
  /** Omitted for the final crumb, which is the current page. */
  href?: string;
}

/**
 * Breadcrumb trail.
 *
 * An ordered list inside a labelled <nav>, which is what screen readers expect
 * of a trail; the final crumb is plain text marked `aria-current="page"`
 * rather than a link to where the customer already is.
 *
 * On a narrow screen the earlier crumbs keep their full labels and the final
 * one truncates. Letting the row scroll sideways instead would push the
 * product name off the edge with no visible scrollbar to hint that it is
 * there; wrapping would spend three lines on navigation above the fold. The
 * truncated name costs nothing, because it is repeated in full in the <h1>
 * immediately below.
 */
export function Breadcrumb({
  items,
  label,
  className,
}: {
  items: Crumb[];
  label: string;
  className?: string;
}) {
  return (
    <nav aria-label={label} className={cn('min-w-0', className)}>
      <ol className="flex items-center gap-1 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li
              key={`${item.label}-${index}`}
              className={cn(
                'flex items-center gap-1',
                // Only the last crumb is allowed to give up space; the rest
                // keep their labels whole.
                isLast ? 'min-w-0' : 'shrink-0 whitespace-nowrap',
              )}
            >
              {index > 0 ? (
                <ChevronRight
                  className="h-4 w-4 shrink-0 text-ink-300"
                  aria-hidden="true"
                />
              ) : null}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  // The text itself is only 22px tall, which is a small thing
                  // to hit with a thumb. The `after` overlay raises the touch
                  // target to 44px without taking any layout space, so the
                  // crumb trail keeps its height and spacing exactly.
                  className="relative rounded text-ink-500 transition-colors after:absolute after:inset-x-0 after:top-1/2 after:h-11 after:-translate-y-1/2 after:content-[''] hover:text-primary-600 focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:outline-none"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  // `title` keeps the full name available on hover and to
                  // assistive technology even when the text is clipped.
                  title={isLast ? item.label : undefined}
                  className={cn(
                    isLast
                      ? 'block truncate font-medium text-ink-700'
                      : 'text-ink-500',
                  )}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
