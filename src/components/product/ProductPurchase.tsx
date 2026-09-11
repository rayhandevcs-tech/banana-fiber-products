'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ShoppingBag } from 'lucide-react';

import type { Locale } from '@/config/locales';
import type { ProductCardData } from '@/types/content';
import { Button, QuantitySelector, useToast } from '@/components/ui';
import { formatNumber } from '@/lib/format/money';
import { useCartStore, selectQuantityOf } from '@/lib/cart/store';

/**
 * Quantity and Add to Cart.
 *
 * The only interactive part of the purchase area, so the only part that ships
 * JavaScript. Everything around it — name, price, stock badge, specifications
 * — is rendered on the server.
 *
 * Stock is enforced in three places on purpose, because each catches a
 * different mistake: the stepper will not count past it, this component will
 * not submit past it, and the store clamps whatever it is given. The store's
 * clamp is the one that matters, since it is the only one a customer cannot
 * bypass with dev tools — and even that is only a convenience. Real stock is
 * decided by the server at checkout (Sprint 7).
 */
export function ProductPurchase({
  product,
  locale,
}: {
  /**
   * Deliberately the card shape, not the full detail: this is a client
   * component, so everything it receives is serialised into the HTML. The
   * description and specifications are already on the page as markup and have
   * no business being shipped a second time as JSON.
   */
  product: ProductCardData;
  locale: Locale;
}) {
  const t = useTranslations('productPage');
  const { show } = useToast();

  const addItem = useCartStore((state) => state.addItem);
  const hydrated = useCartStore((state) => state.hydrated);
  const inCart = useCartStore((state) => selectQuantityOf(state, product.id));

  const outOfStock = product.stock <= 0;

  // How many more of this product the customer could still add. Recomputed
  // from the cart so the stepper cannot offer a quantity that would be
  // silently trimmed the moment it is submitted.
  const remaining = Math.max(0, product.stock - (hydrated ? inCart : 0));
  const [quantity, setQuantity] = useState(1);

  // The cart arrives after the first client render (it lives in localStorage,
  // which the server cannot see). If what is already in the cart leaves less
  // room than the customer has selected, bring the selection down.
  useEffect(() => {
    if (remaining > 0 && quantity > remaining) setQuantity(remaining);
  }, [remaining, quantity]);

  const canAdd = !outOfStock && remaining > 0;

  function handleAdd() {
    if (!canAdd) return;

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
      quantity,
      product.stock,
    );

    const added = resulting - inCart;

    show(t('addedToCart', { name: product.name[locale] }), 'success');

    // Say so when the request was trimmed rather than letting the customer
    // believe more went in than did.
    if (added < quantity) {
      show(t('addedToCartCapped', { quantity: formatNumber(added, locale) }), 'warning');
    }

    setQuantity(1);
  }

  if (outOfStock) {
    return (
      <div className="flex flex-col gap-3">
        <p className="rounded-lg border border-beige-300 bg-beige-50 px-4 py-3 text-base text-ink-700">
          {t('outOfStockNotice')}
        </p>
        <Button size="lg" fullWidth disabled leadingIcon={<ShoppingBag className="h-5 w-5" />}>
          {t('addToCart')}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-ink-700">{t('quantity')}</span>
        <QuantitySelector
          value={quantity}
          onChange={setQuantity}
          min={1}
          max={Math.max(1, remaining)}
          disabled={remaining === 0}
          label={t('quantity')}
          decreaseLabel={t('decreaseQuantity')}
          increaseLabel={t('increaseQuantity')}
        />
        {/* Rendered only after hydration: the server has no way to know what
            is in this browser's cart, and guessing would mismatch. */}
        {hydrated && inCart > 0 ? (
          <span className="text-sm text-ink-500">
            {t('alreadyInCart', { quantity: formatNumber(inCart, locale) })}
          </span>
        ) : null}
      </div>

      <Button
        size="lg"
        fullWidth
        onClick={handleAdd}
        disabled={!canAdd}
        leadingIcon={<ShoppingBag className="h-5 w-5" />}
      >
        {t('addToCart')}
      </Button>
    </div>
  );
}
