import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export interface ContainerProps {
  children: ReactNode;
  /** narrow: forms and prose · default: pages · wide: full-bleed sections */
  width?: 'narrow' | 'default' | 'wide';
  as?: ElementType;
  className?: string;
}

const widthClasses = {
  narrow: 'max-w-(--container-narrow)',
  default: 'max-w-(--container-default)',
  wide: 'max-w-(--container-wide)',
} as const;

/**
 * The single source of horizontal page gutters. Every page region should be
 * wrapped in a Container rather than setting its own padding, so the gutter
 * can never drift between sections.
 */
export function Container({
  children,
  width = 'default',
  as: Component = 'div',
  className,
}: ContainerProps) {
  return (
    <Component
      className={cn('page-gutter mx-auto w-full', widthClasses[width], className)}
    >
      {children}
    </Component>
  );
}
