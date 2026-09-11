'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Menu, Search, PackageSearch } from 'lucide-react';

import { Link } from '@/lib/i18n/routing';
import { primaryNav, trackOrderNav } from '@/config/navigation';
import { Container } from '@/components/ui';
import { Logo } from './Logo';
import { SearchBar } from './SearchBar';
import { CartButton } from './CartButton';
import { LanguageSwitcher } from './LanguageSwitcher';
import { MobileNav } from './MobileNav';
import { cn } from '@/lib/utils/cn';

/**
 * Site header.
 *
 * Mobile  : [Logo]           [Search] [Cart] [Menu]
 * Desktop : [Logo] [nav…]    [Search] [Language] [Track Order] [Cart]
 *
 * Mobile search opens as a full-width row below the bar rather than competing
 * for space inside it — at 320px there is no room for a usable inline field.
 */
export function Header() {
  const t = useTranslations('nav');
  const tSearch = useTranslations('search');
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-beige-200 bg-canvas/95 backdrop-blur-sm">
        <Container>
          <div className="flex h-16 items-center gap-2 sm:gap-4">
            <Logo />

            {/* Desktop primary navigation */}
            <nav
              aria-label={t('mainNavigation')}
              className="hidden flex-1 xl:block"
            >
              <ul className="flex items-center gap-1">
                {primaryNav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex h-10 items-center rounded-lg px-3 text-sm font-medium',
                        // Multi-word labels ("How It's Made", "পণ্যের ধরন")
                        // must not wrap — a two-line link doubles the header
                        // height and looks broken.
                        'whitespace-nowrap text-ink-600 transition-colors',
                        'hover:bg-beige-100 hover:text-primary-600',
                      )}
                    >
                      {t(item.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Desktop search — flexible, but never so wide it dominates. */}
            <div className="ms-auto hidden max-w-xs flex-1 xl:block">
              <SearchBar />
            </div>

            <div className="ms-auto flex items-center gap-0.5 xl:ms-0 xl:gap-2">
              <div className="hidden xl:block">
                <LanguageSwitcher variant="compact" />
              </div>

              <Link
                href={trackOrderNav.href}
                className={cn(
                  'hidden h-10 items-center gap-1.5 rounded-lg px-3 xl:flex',
                  'text-sm font-semibold whitespace-nowrap text-primary-600',
                  'transition-colors hover:bg-primary-50',
                )}
              >
                <PackageSearch className="h-4 w-4 shrink-0" aria-hidden="true" />
                {t(trackOrderNav.labelKey)}
              </Link>

              {/* Mobile-only search toggle */}
              <button
                type="button"
                onClick={() => setSearchOpen((current) => !current)}
                aria-label={searchOpen ? tSearch('close') : tSearch('open')}
                aria-expanded={searchOpen}
                className="tap-target flex items-center justify-center rounded-lg text-ink-700 transition-colors hover:bg-beige-100 xl:hidden"
              >
                <Search className="h-6 w-6" aria-hidden="true" />
              </button>

              <CartButton />

              {/* Mobile-only menu toggle */}
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                aria-label={t('openMenu')}
                aria-expanded={menuOpen}
                className="tap-target flex items-center justify-center rounded-lg text-ink-700 transition-colors hover:bg-beige-100 xl:hidden"
              >
                <Menu className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>

          {searchOpen ? (
            <div className="animate-fade-in pb-3 xl:hidden">
              <SearchBar autoFocus onClose={() => setSearchOpen(false)} />
            </div>
          ) : null}
        </Container>
      </header>

      <MobileNav open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
