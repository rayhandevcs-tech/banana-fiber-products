import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

type BadgeTone =
  | 'neutral'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'clay';

export interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  /**
   * Rendered before the label. Status badges should always carry an icon so
   * meaning never depends on colour alone.
   */
  icon?: ReactNode;
  size?: 'sm' | 'md';
  className?: string;
}

const toneClasses: Record<BadgeTone, string> = {
  neutral: 'bg-beige-100 text-ink-700 border-beige-300',
  primary: 'bg-primary-50 text-primary-700 border-primary-200',
  success: 'bg-success-50 text-success-700 border-success-500/30',
  warning: 'bg-warning-50 text-warning-700 border-warning-500/30',
  danger: 'bg-danger-50 text-danger-700 border-danger-500/30',
  clay: 'bg-clay-50 text-clay-700 border-clay-200',
};

export function Badge({
  children,
  tone = 'neutral',
  icon,
  size = 'md',
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        toneClasses[tone],
        className,
      )}
    >
      {icon ? (
        <span aria-hidden="true" className="shrink-0">
          {icon}
        </span>
      ) : null}
      {children}
    </span>
  );
}
