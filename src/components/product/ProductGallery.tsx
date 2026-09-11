'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Expand } from 'lucide-react';

import type { Locale } from '@/config/locales';
import type { ImageAsset } from '@/types/content';
import { AspectImage, Modal } from '@/components/ui';
import { imageSizes } from '@/config/images';
import { formatNumber } from '@/lib/format/money';
import { cn } from '@/lib/utils/cn';

/**
 * Product image gallery.
 *
 * Built entirely on the existing `AspectImage`, so the aspect ratio is fixed
 * before any image loads and switching pictures cannot shift the layout. The
 * thumbnails are real buttons rather than a scroll-snap carousel: a row of
 * buttons is operable by keyboard for free, needs no gesture handling, and on
 * a small screen a tap is a more reliable target than a swipe for someone who
 * is not a confident phone user.
 *
 * With a single image — which is every product until real photography arrives
 * — no thumbnail strip and no counter are rendered at all. Controls for a
 * choice that does not exist are just clutter.
 */
export function ProductGallery({
  images,
  locale,
  productName,
}: {
  images: ImageAsset[];
  locale: Locale;
  productName: string;
}) {
  const t = useTranslations('productPage');
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const hasMultiple = images.length > 1;
  const active = images[activeIndex] ?? images[0];
  if (!active) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="group relative">
        <AspectImage
          image={active}
          locale={locale}
          ratio="product"
          sizes={imageSizes.heroPrimary}
          // The product image is the largest thing on the page and the reason
          // the customer opened it, so it is preloaded rather than lazy.
          priority
          className="rounded-xl border border-beige-200"
        />

        {/* Enlarging is an enhancement, not the only way to see the picture:
            the image above is already full width. */}
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          aria-label={t('openLightbox')}
          className={cn(
            'absolute right-3 bottom-3 flex h-11 w-11 items-center justify-center rounded-full',
            'bg-surface/90 text-ink-700 shadow-sm backdrop-blur-sm',
            'transition-colors hover:bg-surface hover:text-ink-900',
            'focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:outline-none',
          )}
        >
          <Expand className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {hasMultiple ? (
        <>
          <ul
            aria-label={t('gallery')}
            className="grid grid-cols-4 gap-2 sm:grid-cols-5"
          >
            {images.map((image, index) => (
              <li key={`${image.src}-${index}`}>
                <button
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={t('viewImage', {
                    index: formatNumber(index + 1, locale),
                  })}
                  aria-current={index === activeIndex ? 'true' : undefined}
                  className={cn(
                    'block w-full overflow-hidden rounded-lg border-2 transition-colors',
                    'focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:outline-none',
                    index === activeIndex
                      ? 'border-primary-500'
                      : 'border-beige-200 hover:border-ink-300',
                  )}
                >
                  <AspectImage
                    image={image}
                    locale={locale}
                    ratio="product"
                    sizes={imageSizes.productCard}
                  />
                </button>
              </li>
            ))}
          </ul>

          {/* The selected thumbnail is marked by its border, which is a
              colour cue; this says the same thing in words. */}
          <p className="sr-only" role="status" aria-live="polite">
            {t('galleryImage', {
              index: formatNumber(activeIndex + 1, locale),
              total: formatNumber(images.length, locale),
            })}
          </p>
        </>
      ) : null}

      {/* The lightbox reuses the design system's Modal, which is built on the
          native <dialog>: focus trapping, Escape to close and background
          inertness come from the platform rather than from code here. */}
      <Modal
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        title={productName}
        closeLabel={t('closeLightbox')}
        size="lg"
      >
        <AspectImage
          image={active}
          locale={locale}
          ratio="product"
          sizes="(min-width: 640px) 42rem, 100vw"
          className="rounded-lg"
        />
      </Modal>
    </div>
  );
}
