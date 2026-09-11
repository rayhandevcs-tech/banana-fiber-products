import { useTranslations } from 'next-intl';
import { ArrowRight, Leaf } from 'lucide-react';

import { Link } from '@/lib/i18n/routing';
import type { Locale } from '@/config/locales';
import { Container, AspectImage } from '@/components/ui';
import { imageSizes } from '@/config/images';
import { heroImage } from '@/content/home';

/**
 * Hero.
 *
 * Mobile  : text first, image below — the customer reads the promise before
 *           scrolling, and the image is not allowed to eat the first screen.
 * Desktop : text left, image right.
 *
 * Deliberately not full-height. A 100vh hero on a phone means the visitor
 * scrolls past a picture before seeing a single product, which the brief
 * explicitly warns against.
 */
export function Hero({ locale }: { locale: Locale }) {
  const t = useTranslations('home');
  const tActions = useTranslations('actions');
  const tTrust = useTranslations('trust');

  const image = heroImage(t('heroImageAlt'), t('heroImageAlt'));

  return (
    <section className="border-b border-beige-200 bg-beige-50">
      <Container>
        <div className="grid items-center gap-8 py-10 sm:py-14 lg:grid-cols-2 lg:gap-12 lg:py-20">
          {/* Text */}
          <div className="order-1 max-w-xl">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700">
              <Leaf className="h-4 w-4 shrink-0" aria-hidden="true" />
              {t('heroEyebrow')}
            </p>

            <h1 className="mt-4 text-3xl leading-tight font-bold text-ink-800 xs:text-4xl sm:text-5xl lg:text-5xl xl:text-6xl">
              {t('heroTitle')}
            </h1>

            <p className="mt-4 text-base text-ink-600 sm:text-lg">
              {t('heroBody')}
            </p>

            <div className="mt-7 flex flex-col gap-3 xs:flex-row">
              <Link
                href="/shop"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-lg bg-primary-500 px-7 text-base font-semibold text-white shadow-xs transition-colors hover:bg-primary-600 active:bg-primary-700"
              >
                {tActions('shopNow')}
                <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
              </Link>
              <Link
                href="/categories"
                className="inline-flex h-14 items-center justify-center rounded-lg border border-primary-500 px-7 text-base font-semibold text-primary-600 transition-colors hover:bg-primary-50"
              >
                {tActions('exploreProducts')}
              </Link>
            </div>

            <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-500">
              <li className="flex items-center gap-1.5">
                <Leaf className="h-4 w-4 shrink-0 text-leaf-600" aria-hidden="true" />
                {tTrust('naturalMaterials')}
              </li>
              <li className="flex items-center gap-1.5">
                <Leaf className="h-4 w-4 shrink-0 text-leaf-600" aria-hidden="true" />
                {tTrust('cashOnDelivery')}
              </li>
            </ul>
          </div>

          {/* Image */}
          <div className="order-2">
            <AspectImage
              image={image}
              locale={locale}
              ratio="wide"
              sizes={imageSizes.heroPrimary}
              // The only preloaded image on the page: it is the largest
              // contentful paint on every screen size.
              priority
              className="rounded-2xl shadow-sm"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
