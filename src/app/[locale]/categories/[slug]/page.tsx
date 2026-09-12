import { redirect } from '@/lib/i18n/routing';

/**
 * /categories/<slug> — served by the shop, filtered to that category.
 *
 * The six category cards on the homepage link here. The destination they want
 * — the products in one category — is precisely /shop?category=<slug>, which
 * already exists, is already filterable and sortable, and is already
 * paginated. So this forwards rather than duplicating that listing.
 *
 * The slug is passed through without checking it against the database: the
 * shop treats an unrecognised category as a filter that matches nothing and
 * renders its normal empty state, so a mistyped URL lands somewhere sensible
 * instead of erroring, and this route stays free of a query of its own.
 */
export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  redirect({ href: { pathname: '/shop', query: { category: slug } }, locale });
}
