import { useTranslations } from 'next-intl';

import { Link } from '@/lib/i18n/routing';
import type { Locale } from '@/config/locales';
import type { ProductCardData } from '@/types/content';
import { imageSizes } from '@/config/images';
import { AspectImage, PriceDisplay } from '@/components/ui';
import { StockBadge, getStockLevel } from './StockBadge';
import { AddToCartButton } from './AddToCartButton';
import { cn } from '@/lib/utils/cn';

/**
 * Product card.
 *
 * Deliberately restrained: image, name, price, stock, one action. No rating
 * stars, no wishlist heart, no "new" flash — the brief asks for a clean card
 * and every extra badge costs scanning speed on a small screen.
 *
 * A Server Component; only the Add to Cart button ships JavaScript.
 */
export function ProductCard({
  product,
  locale,
  className,
}: {
  product: ProductCardData;
  locale: Locale;
  className?: string;
}) {
  const t = useTranslations('stock');
  const tProduct = useTranslations('product');

  const level = getStockLevel(product.stock, product.lowStockThreshold);
  const isOutOfStock = level === 'out-of-stock';

  const stockLabel = {
    'in-stock': t('inStock'),
    'low-stock': t('lowStock'),
    'out-of-stock': t('outOfStock'),
  }[level];

  return (
    <article
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-xl border border-beige-200 bg-surface',
        'transition-shadow duration-150 hover:shadow-md',
        className,
      )}
    >
      <Link href={`/products/${product.slug}`} className="relative block">
        <AspectImage
          image={product.image}
          locale={locale}
          ratio="product"
          sizes={imageSizes.productCard}
          zoomOnHover
        />
        {isOutOfStock ? (
          // A wash over the image makes unavailability obvious before the
          // customer reads any text.
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-canvas/55"
          />
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
        <div className="flex-1">
          <h3 className="text-sm leading-snug font-semibold text-ink-800 sm:text-base">
            <Link
              href={`/products/${product.slug}`}
              className="transition-colors hover:text-primary-600"
            >
              {product.name[locale]}
            </Link>
          </h3>
          {product.shortDescription ? (
            // Hidden on the narrowest screens, where two cards per row leaves
            // no room for a description without cramping the price.
            <p className="mt-1 hidden text-sm text-ink-500 xs:line-clamp-2 xs:block">
              {product.shortDescription[locale]}
            </p>
          ) : null}
        </div>

        <PriceDisplay
          pricePoisha={product.pricePoisha}
          discountPoisha={product.discountPoisha}
          locale={locale}
          size="md"
          originalPriceLabel={tProduct('originalPrice')}
        />

        <StockBadge level={level} label={stockLabel} className="self-start" />

        <AddToCartButton product={product} disabled={isOutOfStock} />
      </div>
    </article>
  );
}
