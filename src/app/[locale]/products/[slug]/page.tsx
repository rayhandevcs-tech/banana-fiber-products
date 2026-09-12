import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import type { Locale } from '@/config/locales';
import { isLocale } from '@/config/locales';
import { Container, Section, PriceDisplay } from '@/components/ui';
import {
  ProductCard,
  ProductGrid,
  ProductGallery,
  ProductPurchase,
  ProductSpecs,
  ProductJsonLd,
  Breadcrumb,
  StockBadge,
  getStockLevel,
} from '@/components/product';
import {
  getAllProductSlugs,
  getProductBySlug,
  getRelatedProducts,
} from '@/server/repositories/catalog';
import { formatNumber } from '@/lib/format/money';

/**
 * Product detail.
 *
 * A Server Component. Only three things below ship JavaScript — the gallery,
 * the quantity stepper and Add to Cart — so the name, price, stock,
 * specifications and description are all in the first HTML response.
 *
 * NOTE ON 404s
 * ------------
 * This route must answer an unknown slug with a real HTTP 404, and that is
 * why there is deliberately NO `loading.tsx` anywhere above it.
 *
 * A `loading.tsx` puts a Suspense boundary around the segment, so Next flushes
 * the document shell as soon as the layout resolves — with a 200 already on
 * the wire. By the time this component calls `notFound()` the status line has
 * been sent and cannot be changed, so the customer gets a "not found" page
 * that every crawler and monitor reads as a success. Removing the boundary
 * makes Next hold the response until this component has decided, which is the
 * only point at which the status is still ours to set.
 *
 * `src/app/[locale]/loading.tsx` was removed for exactly this reason; see the
 * Sprint 4 report.
 */

/**
 * Cached and revalidated, not rendered per request.
 *
 * This page used to be `force-dynamic` so the stock badge could never be
 * stale. That cost every visitor a full render plus two database round trips
 * on a page whose content changes a few times a day, and on a phone in a
 * village that wait is the whole first impression.
 *
 * It is safe to cache because the badge is not what protects stock. Checkout
 * takes stock with a conditional `update ... where stock >= quantity` inside a
 * transaction (see src/server/checkout/placeOrder.ts), so an order for
 * something that has just sold out fails with `stock-conflict` and writes
 * nothing — whatever the page said a minute earlier. The badge is guidance;
 * the transaction is the guarantee.
 *
 * Two minutes is the window a customer could see a sold-out item as available
 * before the cart corrects them. Lowering it costs cache hits; raising it
 * lengthens that window.
 */
export const revalidate = 120;

/**
 * Prerender the catalogue at build time.
 *
 * Required, not an optimisation: `getTranslations` falls back to reading the
 * locale from request headers unless the route's params are statically known,
 * and that alone makes the page uncacheable. With this list the pages are
 * built once and served from the cache, revalidating on the schedule above.
 *
 * Only the slugs — the `locale` segment comes from the layout above.
 */
export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProductBySlug(slug);
  const t = await getTranslations({ locale, namespace: 'productPage' });

  // A withdrawn or non-existent product gets no descriptive metadata and is
  // explicitly not indexable — the page it accompanies is a 404.
  if (!product) {
    return {
      title: t('notFoundTitle'),
      robots: { index: false, follow: false },
    };
  }

  const activeLocale = isLocale(locale) ? locale : 'bn';
  const name = product.name[activeLocale];
  const description =
    product.shortDescription?.[activeLocale] ??
    product.description?.[activeLocale] ??
    undefined;

  return {
    title: name,
    ...(description ? { description } : {}),
    alternates: {
      canonical: `/${locale}/products/${product.slug}`,
      languages: {
        bn: `/bn/products/${product.slug}`,
        en: `/en/products/${product.slug}`,
      },
    },
    openGraph: {
      type: 'website',
      title: name,
      ...(description ? { description } : {}),
      url: `/${locale}/products/${product.slug}`,
      images: product.images.slice(0, 1).map((image) => ({
        url: image.src,
        alt: image.alt[activeLocale],
      })),
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const activeLocale = locale as Locale;

  const product = await getProductBySlug(slug);

  // Inactive and soft-deleted products are filtered out by the query, so they
  // land here and are indistinguishable from a slug that never existed. A
  // withdrawn product must not be identifiable by its status code.
  if (!product) notFound();

  const [t, tStock, tProduct, related] = await Promise.all([
    getTranslations({ locale, namespace: 'productPage' }),
    getTranslations({ locale, namespace: 'stock' }),
    getTranslations({ locale, namespace: 'product' }),
    getRelatedProducts(product.categoryId, product.id, 4),
  ]);

  const level = getStockLevel(product.stock, product.lowStockThreshold);
  const stockLabel = {
    'in-stock': tStock('inStock'),
    'low-stock': tStock('lowStock'),
    'out-of-stock': tStock('outOfStock'),
  }[level];

  // Only rows the database actually has a value for. A missing column is
  // omitted rather than shown blank or filled with a guess.
  const specRows = [
    ...(product.materials
      ? [{ label: t('material'), value: product.materials[activeLocale] }]
      : []),
    ...(product.dimensions
      ? [{ label: t('dimensions'), value: product.dimensions[activeLocale] }]
      : []),
    ...(product.weightGrams
      ? [
          {
            label: t('weight'),
            value: t('weightValue', {
              grams: formatNumber(product.weightGrams, activeLocale),
            }),
          },
        ]
      : []),
    ...(product.care ? [{ label: t('care'), value: product.care[activeLocale] }] : []),
    { label: t('category'), value: product.category.name[activeLocale] },
    { label: t('sku'), value: product.sku },
  ];

  return (
    <>
      <ProductJsonLd
        product={product}
        locale={activeLocale}
        url={`/${locale}/products/${product.slug}`}
        imageUrls={product.images.map((image) => image.src)}
      />

      <Container className="py-4 sm:py-6">
        <Breadcrumb
          label={t('breadcrumb')}
          items={[
            { label: t('home'), href: '/' },
            { label: t('shop'), href: '/shop' },
            {
              label: product.category.name[activeLocale],
              href: `/shop?category=${product.category.slug}`,
            },
            { label: product.name[activeLocale] },
          ]}
        />

        {/* Mobile order is the brief's order: image, name, price, stock,
            quantity, Add to Cart, then the reading matter.
            
            The two-column split starts at `md` rather than `lg` because on a
            768px tablet a single column pushes Add to Cart roughly 1,300px
            down the page — the buy action ends up further from the fold on a
            tablet than on a phone. Side by side, it sits just under 400px on
            every screen from 768 up.

            From `lg` the gallery column is capped rather than taking half the
            width. The product image is square, so on a wide screen an
            unconstrained half-width image is also half-width TALL — roughly
            900px against a 500px purchase panel, leaving a dead area of
            whitespace beside the buy action. Capping the image keeps the two
            columns close in height. */}
        <div className="mt-4 grid gap-6 md:mt-6 md:grid-cols-2 md:gap-8 lg:grid-cols-[minmax(0,30rem)_1fr] lg:gap-12">
          <ProductGallery
            images={product.images}
            locale={activeLocale}
            productName={product.name[activeLocale]}
          />

          <div className="flex flex-col gap-5">
            <div>
              <h1 className="text-2xl leading-tight font-bold text-ink-800 sm:text-3xl">
                {product.name[activeLocale]}
              </h1>
              {product.shortDescription ? (
                <p className="mt-2 text-base text-ink-600">
                  {product.shortDescription[activeLocale]}
                </p>
              ) : null}
            </div>

            <PriceDisplay
              pricePoisha={product.pricePoisha}
              discountPoisha={product.discountPoisha}
              locale={activeLocale}
              size="lg"
              originalPriceLabel={tProduct('originalPrice')}
            />

            <div className="flex flex-wrap items-center gap-3">
              <StockBadge level={level} label={stockLabel} size="md" />
              {/* The exact count only appears when it is low enough to matter;
                  "24 left" on a well-stocked item is noise, and on a nearly
                  sold-out one it is the deciding fact. */}
              {level === 'low-stock' ? (
                <span className="text-sm text-ink-500">
                  {t('unitsAvailable', { count: product.stock })}
                </span>
              ) : null}
            </div>

            <ProductPurchase
              product={{
                id: product.id,
                slug: product.slug,
                sku: product.sku,
                name: product.name,
                shortDescription: product.shortDescription,
                pricePoisha: product.pricePoisha,
                discountPoisha: product.discountPoisha,
                stock: product.stock,
                lowStockThreshold: product.lowStockThreshold,
                image: product.image,
              }}
              locale={activeLocale}
            />
          </div>
        </div>

        <div className="mt-10 grid gap-10 lg:mt-14 lg:grid-cols-2 lg:gap-12">
          {product.description ? (
            <section aria-labelledby="product-description-title">
              <h2
                id="product-description-title"
                className="text-lg font-semibold text-ink-800 sm:text-xl"
              >
                {t('descriptionTitle')}
              </h2>
              {/* Plain text from the database rendered as text, never as
                  markup: there is no rich-text or markdown field in the
                  schema, and passing product copy through an HTML renderer
                  would be an injection route for no gain. */}
              <p className="mt-4 text-base leading-relaxed whitespace-pre-line text-ink-700">
                {product.description[activeLocale]}
              </p>
            </section>
          ) : null}

          <ProductSpecs rows={specRows} title={t('detailsTitle')} />
        </div>
      </Container>

      {related.length > 0 ? (
        <Section
          tone="muted"
          spacing="md"
          title={t('relatedTitle')}
          description={t('relatedSubtitle')}
          className="mt-12"
        >
          <ProductGrid>
            {related.map((item) => (
              <ProductCard key={item.id} product={item} locale={activeLocale} />
            ))}
          </ProductGrid>
        </Section>
      ) : null}
    </>
  );
}
