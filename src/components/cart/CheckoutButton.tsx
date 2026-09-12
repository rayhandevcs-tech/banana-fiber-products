'use client';

import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';

import { Link } from '@/lib/i18n/routing';
import { Button } from '@/components/ui';

/**
 * The route to checkout.
 *
 * SPRINT 5 STATE: `/checkout` does not exist yet, and linking to it would send
 * customers to a genuine 404 — the one thing worse than a disabled button. So
 * the action is honestly inert and says so.
 *
 * SPRINT 6: flip `CHECKOUT_READY` to true. Nothing else on this page changes —
 * the link, its label and its placement are already written below, so
 * activating checkout is a one-line edit rather than a redesign of the cart.
 *
 * This mirrors how `AddToCartButton` waited for the cart store in Sprint 2,
 * which flipped cleanly in Sprint 4.
 */

/** Flipped to true in Sprint 6, when /[locale]/checkout exists. */
const CHECKOUT_READY = false;

export function CheckoutButton({ disabled = false }: { disabled?: boolean }) {
  const t = useTranslations('cartPage');

  if (!CHECKOUT_READY) {
    return (
      <Button size="lg" fullWidth disabled>
        {t('checkoutComingSoon')}
      </Button>
    );
  }

  // An anchor styled as a button, never an anchor nested inside one: that is
  // invalid HTML and breaks keyboard activation.
  return (
    <Link
      href="/checkout"
      aria-disabled={disabled || undefined}
      className="inline-flex h-14 w-full items-center justify-center gap-2.5 rounded-lg bg-primary-500 px-7 text-base font-semibold text-white shadow-xs transition-colors hover:bg-primary-600 active:bg-primary-700 focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:outline-none sm:text-lg"
    >
      {t('proceedToCheckout')}
      <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
    </Link>
  );
}
