import { cn } from '@/lib/utils/cn';

export interface SkeletonProps {
  className?: string;
  /** Renders a circle — for avatars and icon placeholders. */
  circle?: boolean;
}

/**
 * A loading placeholder. Always mirror the size of the real content so the
 * layout does not shift when data arrives.
 */
export function Skeleton({ className, circle = false }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'skeleton-shimmer',
        circle ? 'rounded-full' : 'rounded-md',
        className,
      )}
    />
  );
}

/** Several lines of placeholder text, the last one shortened. */
export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn('h-4', index === lines - 1 ? 'w-2/3' : 'w-full')}
        />
      ))}
    </div>
  );
}
