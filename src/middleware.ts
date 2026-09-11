import createMiddleware from 'next-intl/middleware';
import { routing } from '@/lib/i18n/routing';

/**
 * Locale negotiation and redirection.
 *
 * Sprint 8 will extend this file with the admin authentication gate; the
 * structure below keeps that addition to a single composed step.
 */
export default createMiddleware(routing);

export const config = {
  // Run on every path except Next internals, API routes and static assets.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
