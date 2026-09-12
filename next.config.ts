import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/lib/i18n/request.ts');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Cloudinary is the confirmed image host (Sprint 0). The upload UI lands in
    // Sprint 10; the delivery pipeline is configured here from the start so every
    // image rendered in later sprints is already responsive AVIF/WebP.
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [{ protocol: 'https', hostname: 'res.cloudinary.com' }],
    deviceSizes: [320, 360, 414, 640, 768, 1024, 1280, 1440, 1920],
    imageSizes: [96, 128, 192, 256, 384],
    // Encoding one AVIF variant costs a few hundred milliseconds. The default
    // keeps the result for 60 seconds, so a quiet shop re-encodes the same
    // picture over and over and every one of those waits lands on a customer.
    // These files are immutable — a new picture arrives under a new name — so
    // there is nothing to gain by expiring them sooner than a month.
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  // The catalogue is read far more often than it is written, and most of it is
  // identical for every visitor. Compressing once and holding the result is
  // what makes the site usable on a slow connection.
  compress: true,
  experimental: {
    // Ship only the icons actually imported rather than the whole set.
    optimizePackageImports: ['lucide-react'],
  },
};

export default withNextIntl(nextConfig);
