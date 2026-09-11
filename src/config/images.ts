import type { ImageAsset } from '@/types/content';

/**
 * IMAGE SYSTEM
 *
 * Aspect ratios are named, not written inline. Every image container in the
 * application picks one of these, so a ratio can be changed in one place and
 * nothing anywhere distorts — images always fill their box with `object-cover`.
 */
export const aspectRatios = {
  /** Product cards and the category grid. Square crops read cleanly in a grid. */
  product: 'aspect-square',
  /** Hero and story imagery on desktop. */
  wide: 'aspect-[4/3]',
  /** Editorial/portrait imagery. */
  portrait: 'aspect-[3/4]',
  /** Full-bleed banners. */
  banner: 'aspect-[16/9]',
} as const;

export type AspectRatioName = keyof typeof aspectRatios;

/**
 * `sizes` hints for responsive loading. Getting these right is the single
 * biggest image win on a slow connection: the browser downloads a 400px file
 * for a 400px slot instead of a 1600px one.
 */
export const imageSizes = {
  /** 2 cols mobile → 3 tablet → 4 desktop */
  productCard: '(min-width: 1280px) 300px, (min-width: 768px) 33vw, 50vw',
  /** 2 cols mobile → 3 desktop */
  categoryCard: '(min-width: 768px) 33vw, 50vw',
  /** Full width mobile, half width desktop */
  heroPrimary: '(min-width: 1024px) 50vw, 100vw',
  storyImage: '(min-width: 1024px) 45vw, 100vw',
  stepImage: '(min-width: 768px) 25vw, 50vw',
} as const;

/**
 * PLACEHOLDER ARTWORK — TEMPORARY
 *
 * Locally generated SVG weave textures standing in for product photography.
 * They are deliberately illustrative rather than photographic so nobody can
 * mistake them for final assets.
 *
 * TO REPLACE: upload real photographs (Sprint 10 adds the Cloudinary upload
 * UI), then point `ProductImage.url` rows at them. Nothing here needs editing
 * beyond deleting entries that are no longer referenced.
 */
const PLACEHOLDER_BASE = '/images/placeholders';

export const placeholderImages = {
  basket: `${PLACEHOLDER_BASE}/basket.svg`,
  bag: `${PLACEHOLDER_BASE}/bag.svg`,
  mat: `${PLACEHOLDER_BASE}/mat.svg`,
  storage: `${PLACEHOLDER_BASE}/storage.svg`,
  decor: `${PLACEHOLDER_BASE}/decor.svg`,
  gift: `${PLACEHOLDER_BASE}/gift.svg`,
  weave: `${PLACEHOLDER_BASE}/weave.svg`,
  heroCollection: `${PLACEHOLDER_BASE}/hero-collection.svg`,
  artisan: `${PLACEHOLDER_BASE}/artisan.svg`,
  plant: `${PLACEHOLDER_BASE}/step-plant.svg`,
  fiber: `${PLACEHOLDER_BASE}/step-fiber.svg`,
  crafting: `${PLACEHOLDER_BASE}/step-crafting.svg`,
  finished: `${PLACEHOLDER_BASE}/step-finished.svg`,
} as const;

/** Shown when a product has no image rows at all. */
export const fallbackProductImage: ImageAsset = {
  src: placeholderImages.weave,
  alt: {
    en: 'Product photograph coming soon',
    bn: 'পণ্যের ছবি শীঘ্রই যোগ করা হবে',
  },
  isPlaceholder: true,
};
