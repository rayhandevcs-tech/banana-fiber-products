'use client';

import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string;
  /** Guidance shown under the field before any error occurs. */
  hint?: string;
  error?: string;
  /** Appends a visible "optional" marker instead of a required asterisk. */
  optionalLabel?: string;
  leadingIcon?: ReactNode;
  /** Fixed text inside the field, e.g. a phone country code. */
  prefix?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    hint,
    error,
    optionalLabel,
    leadingIcon,
    prefix,
    className,
    id,
    required,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;

  return (
    <div className="w-full">
      <label
        htmlFor={inputId}
        className="mb-1.5 block text-sm font-medium text-ink-700"
      >
        {label}
        {required ? (
          <span className="text-danger-500" aria-hidden="true">
            {' '}
            *
          </span>
        ) : optionalLabel ? (
          <span className="font-normal text-ink-400"> ({optionalLabel})</span>
        ) : null}
      </label>

      <div className="relative flex items-center">
        {leadingIcon ? (
          <span
            className="pointer-events-none absolute left-3 text-ink-400"
            aria-hidden="true"
          >
            {leadingIcon}
          </span>
        ) : null}
        {prefix ? (
          <span className="pointer-events-none absolute left-3 text-sm text-ink-500">
            {prefix}
          </span>
        ) : null}

        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            error ? errorId : hint ? hintId : undefined
          }
          className={cn(
            // h-12 (48px) clears the 44px touch minimum; text-base keeps iOS
            // Safari from zooming the viewport when the field is focused.
            'h-12 w-full rounded-lg border bg-surface px-3 text-base text-ink-800',
            'placeholder:text-ink-300',
            'transition-colors duration-150',
            'focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none',
            'disabled:cursor-not-allowed disabled:bg-beige-50 disabled:text-ink-400',
            leadingIcon && 'pl-10',
            prefix && 'pl-12',
            error
              ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20'
              : 'border-beige-300',
            className,
          )}
          {...props}
        />
      </div>

      {error ? (
        <p
          id={errorId}
          role="alert"
          className="mt-1.5 flex items-start gap-1.5 text-sm text-danger-700"
        >
          {/* An icon accompanies the colour so the error is not signalled by
              colour alone. */}
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
});
