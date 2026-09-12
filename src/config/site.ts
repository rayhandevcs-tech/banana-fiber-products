/**
 * The site's own absolute URL.
 *
 * Next needs an absolute `metadataBase` to resolve canonical URLs, hreflang
 * alternates and Open Graph images. The layout used to build it with a bare
 * `new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000')`,
 * which throws on a malformed value — and because it runs inside
 * `generateMetadata`, that throw surfaces as an opaque
 * "An error occurred in the Server Components render" against whichever page
 * the build happened to be prerendering. It killed the production build while
 * pointing at a page that had nothing to do with the problem.
 *
 * A bare hostname is the value people actually paste, and it is also the shape
 * Vercel's own `VERCEL_URL` takes (`my-app.vercel.app`, no scheme), so it is
 * treated as https rather than rejected. Anything genuinely unparseable fails
 * loudly and names the variable, which is the one thing the old behaviour
 * never did.
 */
const DEV_FALLBACK = 'http://localhost:3000';

function resolveSiteUrl(): URL {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!configured) return new URL(DEV_FALLBACK);

  const candidates = /^https?:\/\//i.test(configured)
    ? [configured]
    : [`https://${configured}`];

  for (const candidate of candidates) {
    try {
      return new URL(candidate);
    } catch {
      // fall through to the explicit error below
    }
  }

  throw new Error(
    `NEXT_PUBLIC_SITE_URL is not a valid URL: "${configured}". ` +
      'Use a full origin such as https://example.com.',
  );
}

export const siteUrl = resolveSiteUrl();
