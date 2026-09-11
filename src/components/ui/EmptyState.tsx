import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export interface EmptyStateProps {
  /** A large, muted illustration or icon. */
  icon?: ReactNode;
  title: string;
  description?: string;
  /** A primary action that resolves the emptiness, e.g. "Browse products". */
  action?: ReactNode;
  className?: string;
}

/**
 * Shown when a query legitimately returns nothing. Distinct from an error
 * state: nothing has gone wrong, so the tone stays calm and offers a way
 * forward rather than an apology.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center px-4 py-12 text-center sm:py-16',
        className,
      )}
    >
      {icon ? (
        <div
          className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-beige-100 text-beige-600"
          aria-hidden="true"
        >
          {icon}
        </div>
      ) : null}
      <h2 className="text-lg font-semibold text-ink-800 sm:text-xl">{title}</h2>
      {description ? (
        <p className="mt-2 max-w-md text-base text-ink-500">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
