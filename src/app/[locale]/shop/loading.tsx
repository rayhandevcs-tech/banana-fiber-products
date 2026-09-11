import { useTranslations } from 'next-intl';

import { Container, PageHeader, Skeleton } from '@/components/ui';
import { ProductGrid } from '@/components/product';
import { PAGE_SIZE } from '@/lib/shop/searchParams';

/**
 * Shown while the shop's first render is in flight.
 *
 * A skeleton in the shape of the real page rather than a spinner: the header,
 * the sidebar and a full grid of cards are all the size they will be when the
 * data lands, so nothing moves when it does.
 *
 * Subsequent filter changes do not reach this boundary — those keep the
 * previous results on screen and dim them (see `ShopResults`), which preserves
 * the customer's scroll position.
 */
export default function ShopLoading() {
  const t = useTranslations('shop');

  return (
    <>
      <PageHeader title={t('title')} description={t('subtitle')} />

      <Container className="py-6 sm:py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          <aside className="hidden w-64 shrink-0 lg:block" aria-hidden="true">
            <Skeleton className="mb-4 h-7 w-24" />
            <div className="flex flex-col gap-6">
              <Skeleton className="h-44 w-full" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <p role="status" aria-live="polite" className="sr-only">
              {t('loadingProducts')}
            </p>

            <div className="flex flex-col gap-3" aria-hidden="true">
              <Skeleton className="h-12 w-full" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-11 w-28" />
                <Skeleton className="ml-auto h-11 w-44" />
              </div>
            </div>

            <Skeleton className="mt-4 h-5 w-32" aria-hidden="true" />

            <ProductGrid className="mt-4">
              {Array.from({ length: PAGE_SIZE }).map((_, index) => (
                <div
                  key={index}
                  aria-hidden="true"
                  className="overflow-hidden rounded-xl border border-beige-200 bg-surface"
                >
                  {/* Matches ProductCard's square image, so the grid does not
                      change height when the real cards arrive. */}
                  <Skeleton className="aspect-square w-full rounded-none" />
                  <div className="flex flex-col gap-2 p-3 sm:p-4">
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-11 w-full" />
                  </div>
                </div>
              ))}
            </ProductGrid>
          </div>
        </div>
      </Container>
    </>
  );
}
