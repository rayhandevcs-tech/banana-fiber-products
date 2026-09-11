import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * The responsive product grid: 2 columns on mobile, 3 on tablet, 4 on desktop,
 * exactly as the brief specifies. Defined once here so the shop page (Sprint 3)
 * and the homepage cannot drift apart.
 */
export function ProductGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4',
        className,
      )}
    >
      {children}
    </div>
  );
}
