import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { Container } from './Container';

export interface SectionProps {
  children: ReactNode;
  title?: string;
  description?: string;
  /** A "View all" link or similar, aligned with the heading. */
  action?: ReactNode;
  /** `muted` tints the band to separate it from neighbouring sections. */
  tone?: 'default' | 'muted' | 'primary';
  width?: 'narrow' | 'default' | 'wide';
  spacing?: 'sm' | 'md' | 'lg';
  className?: string;
  id?: string;
}

const toneClasses = {
  default: '',
  muted: 'bg-beige-50',
  primary: 'bg-primary-500 text-white',
} as const;

/**
 * A vertical page band with a consistent rhythm. Vertical spacing is set here
 * and nowhere else, so the page keeps an even cadence as sections are added.
 */
const spacingClasses = {
  sm: 'py-8 sm:py-10',
  md: 'py-10 sm:py-14 lg:py-16',
  lg: 'py-14 sm:py-20 lg:py-24',
} as const;

export function Section({
  children,
  title,
  description,
  action,
  tone = 'default',
  width = 'default',
  spacing = 'md',
  className,
  id,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(toneClasses[tone], spacingClasses[spacing], className)}
    >
      <Container width={width}>
        {title || action ? (
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3 sm:mb-8">
            <div className="min-w-0">
              {title ? (
                <h2
                  className={cn(
                    'text-2xl font-bold sm:text-3xl',
                    tone === 'primary' ? 'text-white' : 'text-ink-800',
                  )}
                >
                  {title}
                </h2>
              ) : null}
              {description ? (
                <p
                  className={cn(
                    'mt-2 max-w-2xl text-base',
                    tone === 'primary' ? 'text-primary-100' : 'text-ink-500',
                  )}
                >
                  {description}
                </p>
              ) : null}
            </div>
            {action ? <div className="shrink-0">{action}</div> : null}
          </div>
        ) : null}
        {children}
      </Container>
    </section>
  );
}
