'use client';

import { useTranslations } from 'next-intl';
import { PackageSearch, SearchX, FolderX } from 'lucide-react';

import { EmptyState, Button } from '@/components/ui';
import { clearedFilters, hasActiveFilters } from '@/lib/shop/searchParams';
import { useShopNavigation } from './ShopNavigation';

/**
 * Why the grid is empty, and what to do about it.
 *
 * Four different situations reach this component and each needs a different
 * sentence. "No products found" is unhelpful when the real answer is that the
 * category in the link no longer exists, or that the catalogue itself is
 * empty and no amount of clearing filters will help.
 *
 * The distinction is made here rather than in the page so that every case is
 * visible in one place and none can quietly fall through to a blank screen.
 */
export function ShopEmptyState({
  /** True when the URL names a category that is not in the catalogue. */
  unknownCategory,
}: {
  unknownCategory: boolean;
}) {
  const t = useTranslations('shop');
  const { params, navigate } = useShopNavigation();

  const filtersActive = hasActiveFilters(params);
  const clearAction = (
    <Button variant="outline" onClick={() => navigate(clearedFilters(params))}>
      {t('clearFilters')}
    </Button>
  );

  // A link that points at a renamed or deleted category. Clearing every filter
  // would also throw away a search the customer still wants, so this offers
  // only to drop the category.
  if (unknownCategory) {
    return (
      <EmptyState
        icon={<FolderX className="h-8 w-8" />}
        title={t('unknownCategoryTitle')}
        description={t('unknownCategoryBody')}
        action={
          <Button variant="outline" onClick={() => navigate({ category: undefined })}>
            {t('browseAll')}
          </Button>
        }
      />
    );
  }

  // A search with no matches: name the term back, since the field may be
  // scrolled out of view by the time the customer reads this.
  if (params.search) {
    return (
      <EmptyState
        icon={<SearchX className="h-8 w-8" />}
        title={t('noSearchResultsTitle', { query: params.search })}
        description={t('noSearchResultsBody')}
        action={clearAction}
      />
    );
  }

  if (filtersActive) {
    return (
      <EmptyState
        icon={<PackageSearch className="h-8 w-8" />}
        title={t('noResultsTitle')}
        description={t('noResultsBody')}
        action={clearAction}
      />
    );
  }

  // Nothing is filtered and there is still nothing to show: the catalogue is
  // empty. Offering "clear filters" here would be a button that does nothing.
  return (
    <EmptyState
      icon={<PackageSearch className="h-8 w-8" />}
      title={t('emptyCatalogTitle')}
      description={t('emptyCatalogBody')}
    />
  );
}
