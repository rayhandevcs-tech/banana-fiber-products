'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { ShoppingBag } from 'lucide-react';

import { Button, useToast } from '@/components/ui';
import type { Locale } from '@/config/locales';
import type { ProductCardData } from '@/types/content';
import { useCartStore } from '@/lib/cart/store';

/**
 * Add to Cart, as it appears on a product card.
 *
 * The card's version always adds one unit; choosing a quantity is what the
 * product page is for. Both go through the same `addItem`, so the rule that a
 * repeat add tops up the existing line rather than creating a second one lives
 * in one place and cannot drift between the two entry points.
 *
 * It takes the whole card record rather than an id because the cart stores a
 * snapshot of what the customer was looking at — name, price and image — so
 * the cart can be drawn without another round trip. That snapshot is for
 * display only; checkout re-reads everything from the database.
 */
export function AddToCartButton({
  product,
  disabled = false,
  fullWidth = true,
  size = 'sm',
}: {
  product: ProductCardData;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  const t = useTranslations('actions');
  const tProduct = useTranslations('productPage');
  const locale = useLocale() as Locale;
  const { show } = useToast();

  const addItem = useCartStore((state) => state.addItem);
  const outOfStock = product.stock <= 0;

  return (
    <Button
      size={size}
      fullWidth={fullWidth}
      disabled={disabled || outOfStock}
      onClick={() => {
        const before = useCartStore
          .getState()
          .lines.find((line) => line.productId === product.id)?.quantity;

        const resulting = addItem(
          {
            productId: product.id,
            slug: product.slug,
            name: product.name,
            pricePoisha: product.pricePoisha,
            discountPoisha: product.discountPoisha,
            image: product.image,
            stockAtAdd: product.stock,
          },
          1,
          product.stock,
        );

        // Unchanged means the cart already held every unit in stock. Saying
        // "added" there would be a small lie the customer discovers later.
        if (resulting === (before ?? 0)) return;

        show(tProduct('addedToCart', { name: product.name[locale] }), 'success');
      }}
      leadingIcon={<ShoppingBag className="h-4 w-4" />}
    >
      {t('addToCart')}
    </Button>
  );
}
