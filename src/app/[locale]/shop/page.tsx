import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import type { Locale } from '@/config/locales';
import { Container, PageHeader } from '@/components/ui';
import { ProductCard, ProductGrid } from '@/components/product';
import {
  ShopNavigationProvider,
  ShopSearch,
  SortSelect,
  FilterPanel,
  MobileFilterSheet,
  ActiveFilters,
  ShopResults,
  ShopEmptyState,
  Pagination,
} from '@/components/shop';
import {
  searchProducts,
  getShopCategories,
  getPriceBounds,
} from '@/server/repositories/catalog';
import {
  parseShopParams,
  toShopQuery,
  type RawSearchParams,
} from '@/lib/shop/searchParams';
import { formatNumber } from '@/lib/format/money';

/**
 * Shop — product discovery.
 *
 * A Server Component. The filters, the sort order and the page number all
 * arrive in the URL, so the server renders the correct results into the HTML
 * on the very first response. A shared link opens on the right products
 * without waiting for JavaScript, and a search engine sees a real, crawlable
 * product listing rather than an empty grid.
 *
 * Filtering, sorting, counting and pagination are all done by PostgreSQL. At
 * most one page of products is ever sent to the browser, so the page costs the
 * same on a 10-product catalogue as on a 10,000-product one.
 */

/**
 * Rendered per request rather than cached: the results depend on the query
 * string, and stock changes should be visible immediately on the page a
 * customer uses to decide what to buy.
 */
export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'shop' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    // Deliberately the bare path, with no query string: every filtered view is
    // a view of the same shop, and pointing them all at one canonical URL
    // keeps search engines from indexing hundreds of near-duplicate pages.
    alternates: {
      canonical: `/${locale}/shop`,
      languages: { bn: '/bn/shop', en: '/en/shop' },
    },
    openGraph: {
      title: t('metaTitle'),
      description: t('metaDescription'),
      url: `/${locale}/shop`,
    },
  };
}

export default async function ShopPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<RawSearchParams>;
}) {
  const [{ locale }, rawSearchParams] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);
  const activeLocale = locale as Locale;

  const t = await getTranslations({ locale, namespace: 'shop' });

  // Never throws: a malformed or hand-edited query string falls back to
  // defaults rather than showing the customer an error page.
  const shopParams = parseShopParams(rawSearchParams);

  const [result, categories, priceBounds] = await Promise.all([
    searchProducts(toShopQuery(shopParams)),
    getShopCategories(),
    getPriceBounds(),
  ]);

  // A category slug that is syntactically valid but matches no row — a renamed
  // category, or a stale bookmark. The query simply returns nothing; this is
  // what lets the empty state explain why.
  const unknownCategory =
    shopParams.category !== undefined &&
    !categories.some((category) => category.slug === shopParams.category);

  const from = (result.page - 1) * result.pageSize + 1;
  const to = Math.min(result.page * result.pageSize, result.total);

  return (
    <ShopNavigationProvider params={shopParams}>
      <PageHeader title={t('title')} description={t('subtitle')} />

      <Container className="py-6 sm:py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          {/* Filters — a sidebar from `lg` up, where there is room for it
              beside a four-column grid without squeezing the products. */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <h2 className="mb-4 text-lg font-semibold text-ink-800">
              {t('filters')}
            </h2>
            <FilterPanel
              categories={categories}
              priceBounds={priceBounds}
              locale={activeLocale}
            />
          </aside>

          <div className="min-w-0 flex-1">
            {/* Controls. Search takes the full width on a phone, where it is
                the primary way in; the filter and sort controls share the row
                below it. */}
            <div className="flex flex-col gap-3">
              <ShopSearch />
              <div className="flex items-center gap-2">
                <MobileFilterSheet
                  categories={categories}
                  priceBounds={priceBounds}
                  locale={activeLocale}
                  className="lg:hidden"
                />
                <SortSelect className="min-w-0 flex-1 sm:flex-none sm:justify-end lg:ml-auto" />
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <ActiveFilters categories={categories} locale={activeLocale} />

              {/* The result count is the page's running commentary: it is how
                  a customer knows a filter did something, even when the grid
                  below is scrolled out of view. */}
              <p className="text-sm text-ink-600">
                <span className="font-medium text-ink-800">
                  {t('resultCount', { count: result.total })}
                </span>
                {result.total > 0 && result.pageCount > 1 ? (
                  <span className="text-ink-500">
                    {' · '}
                    {/* Formatted before interpolation, not passed as raw
                        numbers: ICU only applies the locale's numbering
                        system to values it is told are numbers, so plain
                        arguments would print Latin digits beside the Bengali
                        ones the plural above produces — "১১ টি পণ্য · 11 টির
                        মধ্যে 1–8". */}
                    {t('showingRange', {
                      from: formatNumber(from, activeLocale),
                      to: formatNumber(to, activeLocale),
                      total: formatNumber(result.total, activeLocale),
                    })}
                  </span>
                ) : null}
              </p>
            </div>

            <ShopResults>
              {result.products.length > 0 ? (
                <>
                  <ProductGrid className="mt-4">
                    {result.products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        locale={activeLocale}
                      />
                    ))}
                  </ProductGrid>

                  <Pagination
                    page={result.page}
                    pageCount={result.pageCount}
                    locale={activeLocale}
                  />
                </>
              ) : (
                <ShopEmptyState unknownCategory={unknownCategory} />
              )}
            </ShopResults>
          </div>
        </div>
      </Container>
    </ShopNavigationProvider>
  );
}
