'use client';

import { useTranslations } from 'next-intl';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui';

/**
 * Add to Cart.
 *
 * SPRINT 2 STATE: the cart store arrives in Sprint 5, so the action is
 * genuinely disabled and labelled "Cart coming soon". It is deliberately
 * inert rather than showing an "Added to cart" confirmation for an item that
 * is not stored anywhere — a fake success is worse than a disabled control,
 * especially for a first-time online shopper deciding whether to trust the
 * shop.
 *
 * SPRINT 5: delete the `cartReady = false` constant and its two branches, and
 * wire `onClick` to the cart store. The label, the disabled-on-out-of-stock
 * behaviour and every caller stay exactly as they are.
 */

/** Flipped to true in Sprint 5 when the cart store lands. */
const CART_READY = false;

export function AddToCartButton({
  productId,
  disabled = false,
  fullWidth = true,
  size = 'sm',
}: {
  productId: string;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  const t = useTranslations('actions');
  const tCart = useTranslations('cart');

  if (!CART_READY) {
    return (
      <Button
        size={size}
        variant="outline"
        fullWidth={fullWidth}
        disabled
        leadingIcon={<ShoppingBag className="h-4 w-4" />}
      >
        {tCart('comingSoon')}
      </Button>
    );
  }

  return (
    <Button
      size={size}
      fullWidth={fullWidth}
      disabled={disabled}
      onClick={() => {
        void productId; // Sprint 5: addItem(productId, 1)
      }}
      leadingIcon={<ShoppingBag className="h-4 w-4" />}
    >
      {t('addToCart')}
    </Button>
  );
}
