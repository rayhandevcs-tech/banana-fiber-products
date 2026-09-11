'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

type ToastTone = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  tone: ToastTone;
  message: string;
}

interface ToastContextValue {
  show: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/** Show a transient message. Must be called inside <ToastProvider>. */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const toneConfig: Record<
  ToastTone,
  { icon: typeof CheckCircle2; classes: string }
> = {
  success: { icon: CheckCircle2, classes: 'bg-success-50 border-success-500/40 text-success-700' },
  error: { icon: AlertCircle, classes: 'bg-danger-50 border-danger-500/40 text-danger-700' },
  info: { icon: Info, classes: 'bg-info-50 border-info-500/40 text-info-700' },
  warning: { icon: AlertTriangle, classes: 'bg-warning-50 border-warning-500/40 text-warning-700' },
};

const AUTO_DISMISS_MS = 4000;

export function ToastProvider({
  children,
  dismissLabel,
}: {
  children: ReactNode;
  dismissLabel: string;
}) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (message: string, tone: ToastTone = 'success') => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current, { id, tone, message }]);
      window.setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/*
        Bottom-anchored on mobile so a toast never covers the header or the
        sticky action bar; top-right on desktop where that space is free.
        `pointer-events-none` on the container keeps the page clickable while
        a toast is visible; each toast re-enables its own events.
      */}
      <div
        role="region"
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:top-0 sm:right-0 sm:bottom-auto sm:items-end"
      >
        {toasts.map((toast) => {
          const { icon: Icon, classes } = toneConfig[toast.tone];
          return (
            <div
              key={toast.id}
              role="status"
              className={cn(
                'pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-lg border p-3 shadow-md',
                'animate-slide-up',
                classes,
              )}
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <p className="min-w-0 flex-1 text-sm font-medium break-words">
                {toast.message}
              </p>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label={dismissLabel}
                className="-m-1 shrink-0 rounded p-1 opacity-70 transition-opacity hover:opacity-100"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
