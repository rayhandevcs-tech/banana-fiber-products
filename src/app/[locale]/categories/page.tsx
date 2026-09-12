import { redirect } from '@/lib/i18n/routing';

/**
 * /categories — served by the shop.
 *
 * The header, the footer and the hero have always linked here, but no such
 * page existed, so every one of those links 404'd.
 *
 * No new page is needed: browsing the catalogue by category is exactly what
 * /shop already does, and its category filter is driven by the same six
 * categories this page would have listed. Redirecting keeps the visible link
 * working and any bookmark or prefetch of this URL valid, without standing up
 * a second listing page that would have to be kept in step with the first.
 */
export default async function CategoriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect({ href: '/shop', locale });
}
