'use client';

import { useTranslations } from 'next-intl';
import { ShoppingBag } from 'lucide-react';
import { Button, useToast } from '@/components/ui';

/**
 * Add to Cart.
 *
 * SPRINT 2 NOTE: the cart store arrives in Sprint 5. Until then this button
 * deliberately tells the customer the truth rather than showing a false
 * "added to cart" confirmation for an item that was not stored anywhere.
 *
 * Sprint 5 replaces the body of `handleAdd` with the store call and switches
 * the toast to `cart.addedToCart` (already translated). Nothing else about
 * this component — or any card using it — needs to change.
 */
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
  const { show } = useToast();

  const handleAdd = () => {
    void productId; // Sprint 5: addItem(productId, 1)
    show(tCart('notReadyYet'), 'info');
  };

  return (
    <Button
      size={size}
      fullWidth={fullWidth}
      disabled={disabled}
      onClick={handleAdd}
      leadingIcon={<ShoppingBag className="h-4 w-4" />}
    >
      {t('addToCart')}
    </Button>
  );
}
