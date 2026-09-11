import { cn } from '@/lib/utils/cn';

export interface LoadingStateProps {
  /** Announced to screen readers and shown under the spinner. */
  label: string;
  className?: string;
  /** Hide the visible text, keeping only the screen-reader announcement. */
  labelHidden?: boolean;
}

/**
 * A centred spinner for a whole region. Prefer a <Skeleton> that matches the
 * shape of the incoming content wherever the layout is known in advance —
 * skeletons avoid the layout shift that a spinner causes when data lands.
 */
export function LoadingState({
  label,
  className,
  labelHidden = false,
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex flex-col items-center justify-center gap-3 px-4 py-12',
        className,
      )}
    >
      <svg
        className="h-8 w-8 animate-spin text-primary-500"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle
          className="opacity-20"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          className="opacity-90"
          fill="currentColor"
          d="M4 12a8 8 0 0 1 8-8v3a5 5 0 0 0-5 5H4z"
        />
      </svg>
      <p className={cn('text-sm text-ink-500', labelHidden && 'sr-only')}>
        {label}
      </p>
    </div>
  );
}
