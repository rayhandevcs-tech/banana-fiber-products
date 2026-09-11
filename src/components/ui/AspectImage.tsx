import Image from 'next/image';
import type { Locale } from '@/config/locales';
import type { ImageAsset } from '@/types/content';
import { aspectRatios, type AspectRatioName } from '@/config/images';
import { cn } from '@/lib/utils/cn';

export interface AspectImageProps {
  image: ImageAsset;
  locale: Locale;
  /** Named ratio from the image config — never a raw value. */
  ratio?: AspectRatioName;
  /** Responsive `sizes` hint; pick one from `imageSizes`. */
  sizes: string;
  /** Set on the single largest above-the-fold image only (the hero). */
  priority?: boolean;
  /** Zooms slightly on hover — for cards whose whole surface is a link. */
  zoomOnHover?: boolean;
  className?: string;
  imageClassName?: string;
}

/**
 * THE IMAGE ABSTRACTION.
 *
 * Every image on the site goes through this component. The container owns the
 * aspect ratio and the image fills it with `object-cover`, so:
 *
 *   • no component ever reads or depends on an image's intrinsic dimensions;
 *   • images can never distort, whatever their source dimensions;
 *   • replacing placeholder artwork with real photography of any size is a
 *     data change (`ImageAsset.src`) and nothing else — no layout, no CSS,
 *     no component edits;
 *   • there is no layout shift while loading, because the box is sized before
 *     the image arrives.
 *
 * `fill` is used rather than width/height for exactly that reason: it is the
 * only mode that does not require knowing the source dimensions in advance.
 */
export function AspectImage({
  image,
  locale,
  ratio = 'product',
  sizes,
  priority = false,
  zoomOnHover = false,
  className,
  imageClassName,
}: AspectImageProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-beige-100',
        aspectRatios[ratio],
        className,
      )}
    >
      <Image
        src={image.src}
        alt={image.alt[locale]}
        fill
        sizes={sizes}
        priority={priority}
        // Everything below the fold loads lazily; the hero opts out via
        // `priority`, which also preloads it.
        loading={priority ? undefined : 'lazy'}
        className={cn(
          'object-cover',
          zoomOnHover &&
            'transition-transform duration-300 ease-(--ease-out-soft) group-hover:scale-[1.04]',
          imageClassName,
        )}
      />
    </div>
  );
}
