import 'server-only';

import { cache } from 'react';
import { unstable_cache } from 'next/cache';

import type { Prisma } from '@/generated/prisma/client';

import { db } from '@/server/db/client';
import { fallbackProductImage, placeholderImages } from '@/config/images';
import type {
  CategoryCardData,
  ProductCardData,
  ImageAsset,
  LocalizedText,
} from '@/types/content';
import { PAGE_SIZE, type ShopQuery, type SortOption } from '@/lib/shop/searchParams';

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
    // is real photography — /images/products while the photographs are staged
    // locally, a Cloudinary URL once Sprint 10 uploads them.
    isPlaceholder: row.url.startsWith('/images/placeholders'),
  };
}

/** A product row with the one image the card needs. */
type ProductRow = Prisma.ProductGetPayload<{ include: { images: true } }>;

/**
 * The single place a database row becomes a product card.
 *
 * Shared by the homepage's featured rail and the shop listing so the two can
 * never disagree about what a card shows.
 */
function toProductCardData(product: ProductRow): ProductCardData {
  return {
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
  };
}

/** A category row with its active-product count. */
type CategoryRow = Prisma.CategoryGetPayload<{
  include: { _count: { select: { products: true } } };
}>;

/** The single place a category row becomes a category card. */
function toCategoryCardData(category: CategoryRow): CategoryCardData {
  return {
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
  };
}

export async function getFeaturedProducts(limit = 8): Promise<ProductCardData[]> {
  const products = await db.product.findMany({
    where: { isFeatured: true, isActive: true, deletedAt: null },
    include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } },
    orderBy: [{ stock: 'desc' }, { createdAt: 'desc' }],
    take: limit,
  });

  return products.map(toProductCardData);
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

  return categories.map(toCategoryCardData);
}

/* ------------------------------------------------------------------------ *
 * SHOP / PRODUCT DISCOVERY (Sprint 3)
 * ------------------------------------------------------------------------ */

/**
 * Every shop query is filtered, sorted, counted and paginated by PostgreSQL.
 * The browser never receives more than one page of products, and no catalogue
 * array is ever held in JavaScript to be filtered or sorted afterwards.
 */

/** The predicate every storefront query starts from. */
const STOREFRONT: Prisma.ProductWhereInput = { isActive: true, deletedAt: null };

/**
 * Ordering for each customer-facing sort.
 *
 * Every list ends with `id: 'asc'`. Without a unique tiebreaker, rows that
 * compare equal (two products at the same price, say) may come back in a
 * different order on each query, which makes a product appear twice on page 1
 * and never on page 2. Pagination is only coherent over a total order.
 *
 * Price sorts use `effectivePricePoisha` — the database-computed
 * price-after-discount — so the order matches the prices printed on the cards.
 */
const ORDER_BY: Record<SortOption, Prisma.ProductOrderByWithRelationInput[]> = {
  featured: [{ isFeatured: 'desc' }, { createdAt: 'desc' }, { id: 'asc' }],
  newest: [{ createdAt: 'desc' }, { id: 'asc' }],
  'price-low': [{ effectivePricePoisha: 'asc' }, { id: 'asc' }],
  'price-high': [{ effectivePricePoisha: 'desc' }, { id: 'asc' }],
  'name-asc': [{ nameEn: 'asc' }, { id: 'asc' }],
};

/**
 * Translate discovery state into a Prisma `where`.
 *
 * Used by both the page query and the count, so a product can never be
 * counted but not listed.
 */
function buildWhere(query: ShopQuery): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = { ...STOREFRONT };

  if (query.category) {
    where.category = { slug: query.category, isActive: true };
  }

  if (query.search) {
    // Both languages plus the SKU: a customer may type "bag", "ব্যাগ" or read
    // a code off a printed list. `insensitive` is a no-op for Bengali, which
    // has no letter case, and necessary for English.
    where.OR = [
      { nameEn: { contains: query.search, mode: 'insensitive' } },
      { nameBn: { contains: query.search } },
      { shortDescEn: { contains: query.search, mode: 'insensitive' } },
      { shortDescBn: { contains: query.search } },
      { sku: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  if (query.minPricePoisha !== undefined || query.maxPricePoisha !== undefined) {
    // Filtered on the discounted price, so the range matches what the customer
    // sees on the card rather than a pre-discount number they never read.
    where.effectivePricePoisha = {
      ...(query.minPricePoisha !== undefined && { gte: query.minPricePoisha }),
      ...(query.maxPricePoisha !== undefined && { lte: query.maxPricePoisha }),
    };
  }

  if (query.availability === 'in-stock') where.stock = { gt: 0 };
  if (query.availability === 'out-of-stock') where.stock = { lte: 0 };

  return where;
}

export interface ShopResult {
  products: ProductCardData[];
  /** Total matching the filters, not the number on this page. */
  total: number;
  page: number;
  pageCount: number;
  pageSize: number;
}

/**
 * One page of the catalogue.
 *
 * Two queries — the page and the total — issued together. The total is what
 * lets the page report "24 products" and render pagination without fetching
 * anything it will not display.
 */
export async function searchProducts(query: ShopQuery): Promise<ShopResult> {
  const where = buildWhere(query);

  const [total, rows] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } },
      orderBy: ORDER_BY[query.sort],
      skip: (query.page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  return {
    products: rows.map(toProductCardData),
    total,
    page: query.page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    pageSize: PAGE_SIZE,
  };
}

/**
 * Every active category, for the shop's category filter.
 *
 * The shop page is `force-dynamic` because its results depend on the query
 * string — but this list does not. Without a cache every filtered view, every
 * page of results and every search paid for the same query again. Cached
 * across requests, it is one round trip an hour for the whole site instead of
 * one per visitor.
 *
 * The product counts it carries can therefore lag by up to an hour. That is a
 * number beside a filter label, not a fact anyone buys on.
 */
export const getShopCategories = unstable_cache(
  async function getShopCategories(): Promise<CategoryCardData[]> {
  const categories = await db.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    include: {
      _count: {
        select: { products: { where: { isActive: true, deletedAt: null } } },
      },
    },
  });

  return categories.map(toCategoryCardData);
  },
  ['shop-categories'],
  { revalidate: 3600, tags: ['catalog'] },
);

/**
 * The cheapest and dearest prices in the catalogue, in poisha.
 *
 * Used to label the price inputs with the real range, so a customer is not
 * left guessing what numbers are worth typing. Deliberately computed over the
 * whole catalogue rather than the current results: a range that moved every
 * time a filter changed would be a moving target.
 *
 * Cached across requests for the same reason as the category list: it is the
 * same two numbers for every visitor, and it was being recomputed on each one.
 */
export const getPriceBounds = unstable_cache(
  async function getPriceBounds(): Promise<{ min: number; max: number }> {
  const result = await db.product.aggregate({
    where: STOREFRONT,
    _min: { effectivePricePoisha: true },
    _max: { effectivePricePoisha: true },
  });

  return {
    min: result._min.effectivePricePoisha ?? 0,
    max: result._max.effectivePricePoisha ?? 0,
  };
  },
  ['shop-price-bounds'],
  { revalidate: 3600, tags: ['catalog'] },
);

/* ------------------------------------------------------------------------ *
 * PRODUCT DETAIL (Sprint 4)
 * ------------------------------------------------------------------------ */

/**
 * Every storefront product's slug, for `generateStaticParams`.
 *
 * Prerendering the product pages is what lets them be cached at all: without
 * a static params list, next-intl has to read the locale from the request
 * headers, which opts the whole route out of caching no matter what
 * `revalidate` says.
 *
 * A product added after the build is not in this list. It still works —
 * `dynamicParams` is on by default, so Next renders it on demand and caches
 * the result from then on.
 */
export async function getAllProductSlugs(): Promise<string[]> {
  const products = await db.product.findMany({
    where: STOREFRONT,
    select: { slug: true },
    orderBy: { slug: 'asc' },
  });

  return products.map((product) => product.slug);
}

/** Everything the product page shows, already localised into pairs. */
export interface ProductDetail extends ProductCardData {
  description: LocalizedText | null;
  materials: LocalizedText | null;
  care: LocalizedText | null;
  dimensions: LocalizedText | null;
  weightGrams: number | null;
  /** Every image, in sort order. The gallery decides what to do with them. */
  images: ImageAsset[];
  category: { slug: string; name: LocalizedText };
  /** Needed to find siblings; never rendered. */
  categoryId: string;
}

/**
 * Pair two nullable bilingual columns into one field.
 *
 * Returns null unless BOTH languages are present: a specification row that
 * renders in English and blank in Bengali is worse than one that is absent in
 * both, because only one of the two audiences ever sees the hole.
 */
function pair(en: string | null, bn: string | null): LocalizedText | null {
  return en && bn ? { en, bn } : null;
}

/**
 * One product, by slug, for the detail page.
 *
 * Returns null rather than throwing, so the page can answer with a real 404.
 *
 * Wrapped in React's `cache()` because both `generateMetadata` and the page
 * component need the same product: without it Next runs this function twice
 * per request and Prisma issues the product, image and category queries twice
 * over — eight round trips to render one page instead of five. `cache()`
 * memoises per request, so the second caller gets the first one's result.
 *
 * The storefront predicate is applied here, not in the caller: an inactive or
 * soft-deleted product is indistinguishable from a slug that never existed,
 * which is exactly right. A customer must not be able to tell that a product
 * was withdrawn by watching the status code change.
 */
export const getProductBySlug = cache(async function getProductBySlug(
  slug: string,
): Promise<ProductDetail | null> {
  const product = await db.product.findFirst({
    where: { slug, ...STOREFRONT },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      category: {
        select: { id: true, slug: true, nameEn: true, nameBn: true, isActive: true },
      },
    },
  });

  if (!product) return null;

  const card = toProductCardData(product);

  return {
    ...card,
    description: pair(product.descriptionEn, product.descriptionBn),
    materials: pair(product.materialsEn, product.materialsBn),
    care: pair(product.careEn, product.careBn),
    dimensions: pair(product.dimensionsEn, product.dimensionsBn),
    weightGrams: product.weightGrams,
    images:
      product.images.length > 0
        ? product.images.map((image) =>
            toImageAsset(image, { en: product.nameEn, bn: product.nameBn }),
          )
        : // A product with no image row still has to render something, and the
          // gallery should not have to know about that case.
          [fallbackProductImage],
    category: {
      slug: product.category.slug,
      name: { en: product.category.nameEn, bn: product.category.nameBn },
    },
    categoryId: product.categoryId,
  };
});

/**
 * A few other products from the same category.
 *
 * Category membership is the only relationship the schema actually models, so
 * it is the only one used: there is no purchase history to mine and no
 * similarity data, and inventing a "recommendation" from nothing would be
 * dressing up a random pick. In-stock items come first, because suggesting
 * something unbuyable is worse than suggesting nothing.
 *
 * Bounded by `take`, so this never grows into a catalogue fetch.
 */
export async function getRelatedProducts(
  categoryId: string,
  excludeProductId: string,
  limit = 4,
): Promise<ProductCardData[]> {
  const products = await db.product.findMany({
    where: { categoryId, id: { not: excludeProductId }, ...STOREFRONT },
    include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } },
    orderBy: [{ stock: 'desc' }, { isFeatured: 'desc' }, { id: 'asc' }],
    take: limit,
  });

  return products.map(toProductCardData);
}

/* ------------------------------------------------------------------------ *
 * CHECKOUT OPTIONS (Sprint 6)
 * ------------------------------------------------------------------------ */

export interface DeliveryOptions {
  districts: { id: string; name: LocalizedText; division: LocalizedText }[];
  methods: { id: string; code: string; name: LocalizedText; description: LocalizedText | null }[];
}

/**
 * The districts and delivery methods a customer may choose between.
 *
 * Two small queries, both fully indexed, run once when the checkout page is
 * rendered. Rates are deliberately NOT included: a charge depends on the
 * subtotal (some rates are waived above a threshold), so it is quoted by the
 * server for a specific cart rather than handed to the browser as a table it
 * could apply itself.
 */
export async function getDeliveryOptions(): Promise<DeliveryOptions> {
  const [districts, methods] = await Promise.all([
    db.district.findMany({
      where: { zone: { isActive: true } },
      orderBy: { nameEn: 'asc' },
      select: {
        id: true,
        nameEn: true,
        nameBn: true,
        divisionEn: true,
        divisionBn: true,
      },
    }),
    db.deliveryMethod.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        code: true,
        nameEn: true,
        nameBn: true,
        descEn: true,
        descBn: true,
      },
    }),
  ]);

  return {
    districts: districts.map((district) => ({
      id: district.id,
      name: { en: district.nameEn, bn: district.nameBn },
      division: { en: district.divisionEn, bn: district.divisionBn },
    })),
    methods: methods.map((method) => ({
      id: method.id,
      code: method.code,
      name: { en: method.nameEn, bn: method.nameBn },
      description:
        method.descEn && method.descBn
          ? { en: method.descEn, bn: method.descBn }
          : null,
    })),
  };
}
