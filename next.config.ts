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
  },
};

export default withNextIntl(nextConfig);
