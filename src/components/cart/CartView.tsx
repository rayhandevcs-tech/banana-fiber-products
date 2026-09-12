'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ShoppingBag, Trash2 } from 'lucide-react';

import { Link } from '@/lib/i18n/routing';
import type { Locale } from '@/config/locales';
import {
  Container,
  EmptyState,
  Button,
  ConfirmDialog,
  Skeleton,
  useToast,
} from '@/components/ui';
import {
  useCartStore,
  selectItemCount,
  selectSubtotalPoisha,
} from '@/lib/cart/store';
import { CartLineRow } from './CartLineRow';
import { CartSummary } from './CartSummary';

/**
 * The cart.
 *
 * A client component by necessity, not by preference: the cart lives in
 * `localStorage`, which the server cannot read. Nothing here fetches anything
 * — every figure comes from the store the rest of the site already writes to,
 * so there is no second copy of the cart and no request to make this page
 * useful.
 *
 * Everything the customer changes writes straight to that store, which is why
 * the header badge, the line totals and the subtotal cannot disagree: they are
 * three views of one number.
 */
export function CartView({
  locale,
  originalPriceLabel,
}: {
  locale: Locale;
  originalPriceLabel: string;
}) {
  const t = useTranslations('cartPage');
  const { show } = useToast();

  const hydrated = useCartStore((state) => state.hydrated);
  const lines = useCartStore((state) => state.lines);
  const itemCount = useCartStore(selectItemCount);
  const subtotal = useCartStore(selectSubtotalPoisha);
  const clear = useCartStore((state) => state.clear);

  const [confirmingClear, setConfirmingClear] = useState(false);

  // Until the persisted cart has been read back, the server's empty render and
  // the browser's real cart disagree. Showing a skeleton for that moment is
  // the difference between a brief placeholder and a flash of "your cart is
  // empty" at someone who has just added three things to it.
  if (!hydrated) {
    return (
      <Container className="py-6 sm:py-10">
        <Skeleton className="h-9 w-48" />
        <p role="status" aria-live="polite" className="sr-only">
          {t('loading')}
        </p>
        <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:gap-10">
          <div className="min-w-0 flex-1">
            {[0, 1].map((i) => (
              <div key={i} className="flex gap-3 border-b border-beige-200 py-4 sm:gap-4">
                <Skeleton className="aspect-square w-20 shrink-0 sm:w-24" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/5" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-12 w-36" />
                </div>
              </div>
            ))}
          </div>
          <div className="w-full lg:w-80 lg:shrink-0">
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </Container>
    );
  }

  if (lines.length === 0) {
    return (
      <Container className="py-10 sm:py-16">
        <h1 className="sr-only">{t('title')}</h1>
        <EmptyState
          icon={<ShoppingBag className="h-8 w-8" />}
          title={t('emptyTitle')}
          description={t('emptyBody')}
          action={
            // A styled link, not a Button with a link inside it: an anchor
            // nested in a button is invalid and stops working with a keyboard.
            <Link
              href="/shop"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-primary-500 px-6 text-base font-semibold text-white shadow-xs transition-colors hover:bg-primary-600 active:bg-primary-700 focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:outline-none"
            >
              {t('continueShopping')}
            </Link>
          }
        />
      </Container>
    );
  }

  return (
    <Container className="py-6 sm:py-10">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h1 className="text-2xl font-bold text-ink-800 sm:text-3xl">
          {t('title')}
        </h1>
        <p className="text-base text-ink-500">
          {t('itemCountHeading', { count: itemCount })}
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:gap-10">
        <div className="min-w-0 flex-1">
          {/* The list needs a heading of its own. Without it the product
              names (h3) follow the page title (h1) directly and the summary's
              h2 arrives after them, so anyone navigating by headings meets a
              level jump and then a backwards step. It is visually redundant
              beside the item count, so it is announced rather than drawn. */}
          <h2 className="sr-only">{t('itemsHeading')}</h2>

          <ul className="divide-y divide-beige-200 border-y border-beige-200">
            {lines.map((line) => (
              <CartLineRow
                key={line.productId}
                line={line}
                locale={locale}
                originalPriceLabel={originalPriceLabel}
              />
            ))}
          </ul>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/shop"
              className="tap-target inline-flex items-center rounded-lg px-2 text-base font-medium text-primary-600 transition-colors hover:bg-primary-50 focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:outline-none"
            >
              {t('continueShopping')}
            </Link>

            <Button
              variant="ghost"
              onClick={() => setConfirmingClear(true)}
              leadingIcon={<Trash2 className="h-4 w-4" />}
            >
              {t('clearCart')}
            </Button>
          </div>
        </div>

        {/* From `lg` the summary sits beside the items and sticks, so the
            subtotal and the checkout action stay in view while a long cart is
            scrolled. Below that it follows the items, which is the order the
            brief asks for on a phone. */}
        <div className="w-full lg:w-80 lg:shrink-0">
          <div className="lg:sticky lg:top-24">
            <CartSummary subtotalPoisha={subtotal} locale={locale} />
          </div>
        </div>
      </div>

      {/* Emptying the cart is destructive and cannot be undone, which is
          exactly what the design system's confirmation gate exists for. */}
      <ConfirmDialog
        open={confirmingClear}
        onCancel={() => setConfirmingClear(false)}
        onConfirm={() => {
          clear();
          setConfirmingClear(false);
          show(t('cleared'), 'info');
        }}
        title={t('clearCartTitle')}
        message={t('clearCartMessage')}
        confirmLabel={t('clearCartConfirm')}
        cancelLabel={t('cancel')}
        closeLabel={t('cancel')}
        destructive
      />

      {/* Quantity and removal change the page silently for anyone not watching
          it; this announces the running total instead. */}
      <p role="status" aria-live="polite" className="sr-only">
        {t('itemCountHeading', { count: itemCount })}
      </p>
    </Container>
  );
}
