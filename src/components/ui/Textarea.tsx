'use client';

import { forwardRef, useId } from 'react';
import type { TextareaHTMLAttributes } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
  error?: string;
  optionalLabel?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    { label, hint, error, optionalLabel, className, id, required, rows = 4, ...props },
    ref,
  ) {
    const generatedId = useId();
    const textareaId = id ?? generatedId;
    const hintId = `${textareaId}-hint`;
    const errorId = `${textareaId}-error`;

    return (
      <div className="w-full">
        <label
          htmlFor={textareaId}
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

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={cn(
            'w-full rounded-lg border bg-surface px-3 py-2.5 text-base text-ink-800',
            'placeholder:text-ink-300',
            'transition-colors duration-150',
            'focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none',
            'disabled:cursor-not-allowed disabled:bg-beige-50',
            'resize-y',
            error ? 'border-danger-500' : 'border-beige-300',
            className,
          )}
          {...props}
        />

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
