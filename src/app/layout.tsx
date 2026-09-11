import type { ReactNode } from 'react';

/**
 * The root layout is intentionally minimal: `next-intl` needs the locale from
 * the URL segment before <html lang> can be set correctly, so the real
 * document shell lives in app/[locale]/layout.tsx.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
