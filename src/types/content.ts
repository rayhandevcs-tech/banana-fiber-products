/**
 * Shared content types.
 *
 * Every piece of customer-facing content is bilingual by construction: a
 * `LocalizedText` cannot be created with only one language filled in, which
 * makes a missing translation a type error rather than a runtime surprise.
 */

import type { Locale } from '@/config/locales';

export interface LocalizedText {
  en: string;
  bn: string;
}

/** Pick the active language out of a bilingual field. */
export function pick(text: LocalizedText, locale: Locale): string {
  return text[locale];
}

/**
 * An image, decoupled from where it is hosted.
 *
 * PLACEHOLDER POLICY
 * ------------------
 * `isPlaceholder` marks demo artwork. Swapping in real photography means
 * changing `src`, `alt` and dropping the flag — nothing about the layout,
 * the component tree or the aspect ratio changes, because no component ever
 * reads an image's intrinsic dimensions.
 *
 * `src` may be a local path (`/images/...`) or a remote URL (Cloudinary from
 * Sprint 10 onward). `AspectImage` handles both without the caller caring.
 */
export interface ImageAsset {
  src: string;
  alt: LocalizedText;
  /** True while this is demo artwork rather than a real product photograph. */
  isPlaceholder?: boolean;
}

export interface CategoryCardData {
  slug: string;
  name: LocalizedText;
  image: ImageAsset;
  productCount?: number;
}

export interface ProductCardData {
  id: string;
  slug: string;
  sku: string;
  name: LocalizedText;
  shortDescription: LocalizedText | null;
  pricePoisha: number;
  discountPoisha: number;
  stock: number;
  lowStockThreshold: number;
  image: ImageAsset;
}

export interface Testimonial {
  id: string;
  quote: LocalizedText;
  authorName: LocalizedText;
  authorLocation: LocalizedText;
  rating: 1 | 2 | 3 | 4 | 5;
}
