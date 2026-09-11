import { useTranslations } from 'next-intl';
import { PackageSearch } from 'lucide-react';

import { Link } from '@/lib/i18n/routing';
import type { Locale } from '@/config/locales';
import type { ProductCardData } from '@/types/content';
import { Section, EmptyState } from '@/components/ui';
import { ProductCard, ProductGrid } from '@/components/product';

export function FeaturedProducts({
  products,
  locale,
}: {
  products: ProductCardData[];
  locale: Locale;
}) {
  const t = useTranslations('home');
  const tStates = useTranslations('states');

  return (
    <Section
      tone="muted"
      title={t('featuredTitle')}
      description={t('featuredSubtitle')}
      action={
        <Link
          href="/shop"
          className="flex min-h-11 items-center text-sm font-semibold text-primary-600 hover:underline"
        >
          {t('viewAllProducts')}
        </Link>
      }
    >
      {products.length === 0 ? (
        // The homepage must never render a blank band: if nothing is flagged
        // as featured, say so rather than showing an empty grid.
        <EmptyState
          icon={<PackageSearch className="h-8 w-8" />}
          title={tStates('noProductsTitle')}
          description={tStates('emptyBody')}
        />
      ) : (
        <ProductGrid>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} locale={locale} />
          ))}
        </ProductGrid>
      )}
    </Section>
  );
}
