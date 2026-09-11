'use client';

import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  /** Usually the available stock. The + button disables at this value. */
  max?: number;
  decreaseLabel: string;
  increaseLabel: string;
  label: string;
  size?: 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

/**
 * Stepper used both by customers (cart, product page) and by the operator
 * (stock updates in admin, Sprint 11).
 *
 * The buttons are the primary control — large, obvious, and reachable with a
 * thumb. The number is editable too, but typing is the fallback, not the
 * expectation: a rural operator updating stock should never have to.
 */
export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max,
  decreaseLabel,
  increaseLabel,
  label,
  size = 'md',
  disabled = false,
  className,
}: QuantitySelectorProps) {
  const canDecrease = !disabled && value > min;
  const canIncrease = !disabled && (max === undefined || value < max);

  const clamp = (next: number) => {
    if (Number.isNaN(next)) return min;
    if (next < min) return min;
    if (max !== undefined && next > max) return max;
    return next;
  };

  const buttonSize = size === 'lg' ? 'h-14 w-14' : 'h-12 w-12';
  const inputSize = size === 'lg' ? 'h-14 w-16 text-lg' : 'h-12 w-14 text-base';

  return (
    <div
      className={cn(
        'inline-flex items-stretch overflow-hidden rounded-lg border border-beige-300 bg-surface',
        disabled && 'opacity-55',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onChange(clamp(value - 1))}
        disabled={!canDecrease}
        aria-label={decreaseLabel}
        className={cn(
          buttonSize,
          'flex shrink-0 items-center justify-center text-ink-700',
          'transition-colors duration-150',
          'hover:bg-beige-100 active:bg-beige-200',
          'disabled:cursor-not-allowed disabled:text-ink-300 disabled:hover:bg-transparent',
        )}
      >
        <Minus className="h-5 w-5" aria-hidden="true" />
      </button>

      <input
        type="number"
        inputMode="numeric"
        value={value}
        min={min}
        max={max}
        disabled={disabled}
        aria-label={label}
        onChange={(event) => onChange(clamp(Number(event.target.value)))}
        className={cn(
          inputSize,
          'border-x border-beige-300 text-center font-semibold text-ink-800',
          'focus:ring-2 focus:ring-primary-500/20 focus:outline-none',
          'disabled:bg-beige-50',
          // Hide the native number spinners — the +/- buttons replace them.
          '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
        )}
      />

      <button
        type="button"
        onClick={() => onChange(clamp(value + 1))}
        disabled={!canIncrease}
        aria-label={increaseLabel}
        className={cn(
          buttonSize,
          'flex shrink-0 items-center justify-center text-ink-700',
          'transition-colors duration-150',
          'hover:bg-beige-100 active:bg-beige-200',
          'disabled:cursor-not-allowed disabled:text-ink-300 disabled:hover:bg-transparent',
        )}
      >
        <Plus className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );
}
