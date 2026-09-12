'use client';

import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';

import { Link } from '@/lib/i18n/routing';
import { Button } from '@/components/ui';

/**
 * The route to checkout.
 *
 * Inert through Sprint 5, because `/checkout` did not exist and linking to it
 * would have sent customers to a genuine 404 — the one thing worse than a
 * disabled button. Sprint 6 built the route, so the constant below is now
 * true and the link written for it is live; nothing else about this component
 * changed.
 *
 * The same staged approach `AddToCartButton` used while waiting for the cart
 * store: write the finished control, gate it on one constant, flip the
 * constant when the thing it needs arrives.
 */

/** Flipped in Sprint 6: /[locale]/checkout now exists. */
const CHECKOUT_READY = true;

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
