'use client';

import { forwardRef, useId } from 'react';
import type { SelectHTMLAttributes } from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label: string;
  options: SelectOption[];
  hint?: string;
  error?: string;
  placeholder?: string;
}

/**
 * A native <select>. Deliberately not a custom dropdown: the OS picker is
 * faster on low-end Android, works offline, is keyboard and screen-reader
 * accessible for free, and adds no JavaScript weight.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    { label, options, hint, error, placeholder, className, id, required, ...props },
    ref,
  ) {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const hintId = `${selectId}-hint`;
    const errorId = `${selectId}-error`;

    return (
      <div className="w-full">
        <label
          htmlFor={selectId}
          className="mb-1.5 block text-sm font-medium text-ink-700"
        >
          {label}
          {required ? (
            <span className="text-danger-500" aria-hidden="true">
              {' '}
              *
            </span>
          ) : null}
        </label>

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            required={required}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : hint ? hintId : undefined}
            className={cn(
              'h-12 w-full appearance-none rounded-lg border bg-surface pr-10 pl-3',
              'text-base text-ink-800',
              'transition-colors duration-150',
              'focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none',
              'disabled:cursor-not-allowed disabled:bg-beige-50 disabled:text-ink-400',
              error ? 'border-danger-500' : 'border-beige-300',
              className,
            )}
            {...props}
          >
            {placeholder ? (
              <option value="" disabled>
                {placeholder}
              </option>
            ) : null}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 text-ink-400"
            aria-hidden="true"
          />
        </div>

        {error ? (
          <p
            id={errorId}
            role="alert"
            className="mt-1.5 flex items-start gap-1.5 text-sm text-danger-700"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </p>
        ) : hint ? (
          <p id={hintId} className="mt-1.5 text-sm text-ink-500">
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);
