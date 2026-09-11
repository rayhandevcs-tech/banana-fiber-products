import { useTranslations } from 'next-intl';

import { Link } from '@/lib/i18n/routing';
import type { Locale } from '@/config/locales';
import type { CategoryCardData } from '@/types/content';
import { Section, AspectImage } from '@/components/ui';
import { imageSizes } from '@/config/images';

export function FeaturedCategories({
  categories,
  locale,
}: {
  categories: CategoryCardData[];
  locale: Locale;
}) {
  const t = useTranslations('home');
  const tNav = useTranslations('nav');

  if (categories.length === 0) return null;

  return (
    <Section
      title={t('categoriesTitle')}
      description={t('categoriesSubtitle')}
      action={
        <Link
          href="/categories"
          className="flex min-h-11 items-center text-sm font-semibold text-primary-600 hover:underline"
        >
          {tNav('categories')}
        </Link>
      }
    >
      {/* 2 columns on mobile, as specified; 3 from tablet up. */}
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
        {categories.map((category) => (
          <li key={category.slug}>
            <Link
              href={`/categories/${category.slug}`}
              className="group block overflow-hidden rounded-xl border border-beige-200 bg-surface transition-shadow duration-150 hover:shadow-md"
            >
              <AspectImage
                image={category.image}
                locale={locale}
                ratio="product"
                sizes={imageSizes.categoryCard}
                zoomOnHover
              />
              <div className="p-3 text-center sm:p-4">
                <h3 className="text-sm font-semibold text-ink-800 transition-colors group-hover:text-primary-600 sm:text-base">
                  {category.name[locale]}
                </h3>
                {typeof category.productCount === 'number' ? (
                  <p className="mt-0.5 text-xs text-ink-500 sm:text-sm">
                    {t('categoryProductCount', { count: category.productCount })}
                  </p>
                ) : null}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
