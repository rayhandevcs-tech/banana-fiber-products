'use client';

import { Modal } from './Modal';
import { Button } from './Button';

export interface ConfirmDialogProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  closeLabel: string;
  /** Styles the confirm button as destructive. */
  destructive?: boolean;
  isLoading?: boolean;
}

/**
 * Confirmation gate for destructive actions. Nothing irreversible in this
 * application may be a single tap.
 *
 * The cancel button is listed first and given equal visual weight so the safe
 * choice is the easy one — important when the operator may be unsure.
 */
export function ConfirmDialog({
  open,
  onCancel,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel,
  closeLabel,
  destructive = false,
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      closeLabel={closeLabel}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? 'danger' : 'primary'}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <p className="text-base text-ink-600">{message}</p>
    </Modal>
  );
}
