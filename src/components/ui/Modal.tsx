'use client';

import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  /** Rendered in a sticky footer — typically the confirm/cancel pair. */
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  closeLabel: string;
}

const sizeClasses = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
} as const;

/**
 * Built on the native <dialog> element, which gives focus trapping, Escape
 * handling, inertness of background content and the top layer for free —
 * behaviour that is fiddly and bug-prone to reimplement in JavaScript.
 *
 * On mobile it docks to the bottom of the screen as a sheet, which puts the
 * actions within thumb reach; from `sm` up it centres as a conventional modal.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeLabel,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      document.body.style.overflow = 'hidden';
    } else if (!open && dialog.open) {
      dialog.close();
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // The Escape key closes the dialog natively; mirror that into React state.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleCancel = (event: Event) => {
      event.preventDefault();
      onClose();
    };
    dialog.addEventListener('cancel', handleCancel);
    return () => dialog.removeEventListener('cancel', handleCancel);
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="modal-title"
      aria-describedby={description ? 'modal-description' : undefined}
      onClick={(event) => {
        // Clicking the backdrop (the dialog element itself) closes it.
        if (event.target === dialogRef.current) onClose();
      }}
      className={cn(
        'w-full max-w-none bg-transparent p-0 backdrop:bg-ink-900/50',
        // Dock to the bottom on mobile, centre from sm upward.
        'mt-auto mb-0 sm:m-auto',
        sizeClasses[size],
      )}
    >
      <div
        className={cn(
          'flex max-h-[85vh] flex-col bg-surface',
          'rounded-t-2xl sm:rounded-2xl',
          'animate-slide-up shadow-xl',
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-beige-200 p-4 sm:p-5">
          <div className="min-w-0">
            <h2
              id="modal-title"
              className="text-lg font-semibold text-ink-800 sm:text-xl"
            >
              {title}
            </h2>
            {description ? (
              <p id="modal-description" className="mt-1 text-sm text-ink-500">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="tap-target -mt-1 -mr-1 flex shrink-0 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-beige-100 hover:text-ink-700"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">{children}</div>

        {footer ? (
          <div className="border-t border-beige-200 p-4 sm:p-5">{footer}</div>
        ) : null}
      </div>
    </dialog>
  );
}
