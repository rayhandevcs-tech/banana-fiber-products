'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { X, Phone } from 'lucide-react';

import { Link } from '@/lib/i18n/routing';
import { primaryNav, trackOrderNav } from '@/config/navigation';
import { LanguageSwitcher } from './LanguageSwitcher';
import { cn } from '@/lib/utils/cn';

/**
 * Mobile navigation drawer.
 *
 * Slides in from the side rather than squeezing links into the header bar.
 * Built on <dialog> so focus trapping, Escape-to-close and background inertness
 * come from the platform rather than from hand-written JavaScript.
 *
 * Every row is a full-width 56px target — comfortably tappable with a thumb,
 * and large enough that a longer Bengali label still reads clearly.
 */
export function MobileNav({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations('nav');
  const tFooter = useTranslations('footer');
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
      aria-label={t('mainNavigation')}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
      className={cn(
        'm-0 h-dvh max-h-none w-full max-w-none bg-transparent p-0',
        'backdrop:bg-ink-900/50',
      )}
    >
      <div
        className={cn(
          'animate-slide-in-right ms-auto flex h-dvh w-[86%] max-w-sm flex-col',
          'bg-canvas shadow-xl',
        )}
      >
        <div className="flex items-center justify-between border-b border-beige-200 px-4 py-3">
          <span className="text-base font-semibold text-ink-700">
            {t('menu')}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('closeMenu')}
            className="tap-target -me-2 flex items-center justify-center rounded-lg text-ink-600 transition-colors hover:bg-beige-100"
          >
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          <ul>
            {primaryNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex min-h-14 items-center px-4 text-base font-medium text-ink-700',
                    'border-b border-beige-100',
                    'transition-colors active:bg-beige-100',
                  )}
                >
                  {t(item.labelKey)}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={trackOrderNav.href}
                onClick={onClose}
                className={cn(
                  'flex min-h-14 items-center px-4 text-base font-semibold text-primary-600',
                  'border-b border-beige-100',
                  'transition-colors active:bg-primary-50',
                )}
              >
                {t(trackOrderNav.labelKey)}
              </Link>
            </li>
          </ul>
        </nav>

        <div className="space-y-4 border-t border-beige-200 p-4">
          <LanguageSwitcher />
          <a
            href="tel:+8801712345678"
            className="flex min-h-11 items-center gap-2 text-sm text-ink-600 transition-colors hover:text-primary-600"
          >
            <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              {tFooter('phone')}: <span dir="ltr">01712-345678</span>
            </span>
          </a>
        </div>
      </div>
    </dialog>
  );
}
