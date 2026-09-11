import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Renders a spinner and blocks interaction. */
  isLoading?: boolean;
  /** Accessible label announced while loading. */
  loadingLabel?: string;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 shadow-xs',
  // leaf-500 with white text is only 3.67:1 — below AA. leaf-600 clears it.
  secondary:
    'bg-leaf-600 text-white hover:bg-leaf-700 active:bg-leaf-800 shadow-xs',
  outline:
    'border border-primary-500 text-primary-600 bg-transparent hover:bg-primary-50 active:bg-primary-100',
  ghost:
    'text-ink-700 bg-transparent hover:bg-beige-100 active:bg-beige-200',
  danger:
    'bg-danger-500 text-white hover:bg-danger-700 active:bg-danger-700 shadow-xs',
};

/**
 * Size classes.
 *
 * Every size meets the 44px minimum touch target on its primary axis — `sm`
 * reaches it via `tap-target` rather than by growing its padding, so it can
 * still sit inline in dense layouts without becoming hard to tap.
 */
const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-11 px-3 text-sm gap-1.5',
  md: 'h-12 px-5 text-base gap-2',
  lg: 'h-14 px-7 text-base sm:text-lg gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      loadingLabel,
      fullWidth = false,
      leadingIcon,
      trailingIcon,
      className,
      children,
      disabled,
      type = 'button',
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-semibold',
          'transition-colors duration-150',
          'disabled:cursor-not-allowed disabled:opacity-55',
          // Stops a long Bengali label from overflowing a fixed-width button.
          'text-center whitespace-normal',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <Spinner />
            <span>{loadingLabel ?? children}</span>
          </>
        ) : (
          <>
            {leadingIcon ? (
              <span aria-hidden="true" className="shrink-0">
                {leadingIcon}
              </span>
            ) : null}
            {children}
            {trailingIcon ? (
              <span aria-hidden="true" className="shrink-0">
                {trailingIcon}
              </span>
            ) : null}
          </>
        )}
      </button>
    );
  },
);

function Spinner() {
  return (
    <svg
      className="h-4 w-4 shrink-0 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
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
  );
}
