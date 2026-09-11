import Link from 'next/link';
import { defaultLocale } from '@/config/locales';

/**
 * Global not-found: a path that matched no locale at all (e.g. /favicon.zip).
 *
 * This renders OUTSIDE any locale layout, so there is no translation context
 * and it must supply its own <html>/<body>. It deliberately does not redirect:
 * a redirect during a 404 render produces Next's bare internal error page
 * instead of a usable screen.
 *
 * Locale-scoped 404s (/bn/missing) are handled by [locale]/not-found.tsx,
 * which is fully translated.
 */
export default function RootNotFound() {
  return (
    <html lang={defaultLocale}>
      <body
        style={{
          margin: 0,
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FAF8F2',
          color: '#24332D',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
          padding: '1rem',
        }}
      >
        <main>
          <h1 style={{ fontSize: '1.5rem', margin: 0 }}>
            পাতাটি পাওয়া যায়নি
          </h1>
          <p style={{ marginTop: '0.5rem', color: '#4a5b54' }}>
            Page not found
          </p>
          <Link
            href={`/${defaultLocale}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              minHeight: '2.75rem',
              marginTop: '1.5rem',
              padding: '0 1.25rem',
              borderRadius: '0.5rem',
              backgroundColor: '#2F5D50',
              color: '#fff',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            হোম / Home
          </Link>
        </main>
      </body>
    </html>
  );
}
