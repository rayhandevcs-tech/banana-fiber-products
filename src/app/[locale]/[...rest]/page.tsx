import { notFound } from 'next/navigation';

/**
 * Catch-all for unmatched paths inside a locale.
 *
 * Without this, a URL like /bn/does-not-exist matches no segment under
 * [locale], so Next falls through to the ROOT not-found — which has no locale
 * context and no layout, producing a bare error page.
 *
 * Calling notFound() here routes it to [locale]/not-found.tsx instead, so the
 * visitor gets the translated 404 inside the normal header/footer shell.
 */
export default function CatchAllNotFound() {
  notFound();
}
