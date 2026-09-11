import 'server-only';

import { db } from '@/server/db/client';
import { fallbackProductImage, placeholderImages } from '@/config/images';
import type { CategoryCardData, ProductCardData, ImageAsset } from '@/types/content';

/**
 * Catalogue reads for customer-facing pages.
 *
 * Every query filters `deletedAt: null` and `isActive: true` — a soft-deleted
 * or deactivated product must never appear in the storefront. Admin queries
 * (Sprint 10) will have their own repository that deliberately does not.
 */

/** Per-category fallback artwork while real photography is pending. */
const categoryPlaceholder: Record<string, string> = {
  baskets: placeholderImages.basket,
  bags: placeholderImages.bag,
  'home-decor': placeholderImages.decor,
  'mats-and-rugs': placeholderImages.mat,
  storage: placeholderImages.storage,
  'gift-items': placeholderImages.gift,
};

function toImageAsset(
  row: { url: string; altEn: string | null; altBn: string | null } | undefined,
  fallbackAlt: { en: string; bn: string },
): ImageAsset {
  if (!row) return fallbackProductImage;
  return {
    src: row.url,
    alt: {
      en: row.altEn ?? fallbackAlt.en,
      bn: row.altBn ?? fallbackAlt.bn,
    },
    // Placeholder artwork is served from /images/placeholders; anything else
    // (a Cloudinary URL) is real photography.
    isPlaceholder: row.url.startsWith('/images/placeholders'),
  };
}

export async function getFeaturedProducts(limit = 8): Promise<ProductCardData[]> {
  const products = await db.product.findMany({
    where: { isFeatured: true, isActive: true, deletedAt: null },
    include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } },
    orderBy: [{ stock: 'desc' }, { createdAt: 'desc' }],
    take: limit,
  });

  return products.map((product) => ({
    id: product.id,
    slug: product.slug,
    sku: product.sku,
    name: { en: product.nameEn, bn: product.nameBn },
    shortDescription:
      product.shortDescEn && product.shortDescBn
        ? { en: product.shortDescEn, bn: product.shortDescBn }
        : null,
    pricePoisha: product.pricePoisha,
    discountPoisha: product.discountPoisha,
    stock: product.stock,
    lowStockThreshold: product.lowStockThreshold,
    image: toImageAsset(product.images[0], {
      en: product.nameEn,
      bn: product.nameBn,
    }),
  }));
}

export async function getFeaturedCategories(limit = 6): Promise<CategoryCardData[]> {
  const categories = await db.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    take: limit,
    include: {
      _count: {
        select: { products: { where: { isActive: true, deletedAt: null } } },
      },
    },
  });

  return categories.map((category) => ({
    slug: category.slug,
    name: { en: category.nameEn, bn: category.nameBn },
    productCount: category._count.products,
    image: {
      src:
        category.imageUrl ??
        categoryPlaceholder[category.slug] ??
        fallbackProductImage.src,
      alt: { en: category.nameEn, bn: category.nameBn },
      isPlaceholder: !category.imageUrl,
    },
  }));
}
