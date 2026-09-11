import { useTranslations } from 'next-intl';
import { Check } from 'lucide-react';

import { Link } from '@/lib/i18n/routing';
import type { Locale } from '@/config/locales';
import { Container, AspectImage } from '@/components/ui';
import { storyImage, storyPoints } from '@/content/home';
import { imageSizes } from '@/config/images';

/**
 * The community story.
 *
 * Copy is deliberately concrete and modest — how artisans are paid, where the
 * work happens — rather than making claims about impact that cannot be
 * verified. All of it is placeholder text to be replaced with the real story;
 * the note under the stats says so in the UI during development.
 */
export function ArtisanStory({ locale }: { locale: Locale }) {
  const t = useTranslations('home');
  const tNav = useTranslations('nav');

  const image = storyImage(t('storyImageAlt'), t('storyImageAlt'));

  return (
    <section className="border-y border-beige-200 bg-beige-50 py-10 sm:py-14 lg:py-20">
      <Container>
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Image first on desktop, second on mobile: the heading should be
              the first thing read on a phone. */}
          <div className="order-2 lg:order-1">
            <AspectImage
              image={image}
              locale={locale}
              ratio="wide"
              sizes={imageSizes.storyImage}
              className="rounded-2xl shadow-sm"
            />
          </div>

          <div className="order-1 lg:order-2">
            <p className="text-sm font-semibold tracking-wide text-leaf-700 uppercase">
              {t('storyEyebrow')}
            </p>
            <h2 className="mt-2 text-2xl font-bold text-ink-800 sm:text-3xl">
              {t('storyTitle')}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-600">
              {t('storyBody')}
            </p>
            <p className="mt-3 text-base leading-relaxed text-ink-600">
              {t('storyBodySecondary')}
            </p>

            <ul className="mt-6 space-y-2.5 border-t border-beige-300 pt-5">
              {storyPoints.map((point) => (
                <li key={point.key} className="flex items-start gap-2.5">
                  <Check
                    className="mt-0.5 h-5 w-5 shrink-0 text-leaf-700"
                    aria-hidden="true"
                  />
                  <span className="text-sm text-ink-600 sm:text-base">
                    {t(point.labelKey)}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              href="/about"
              className="mt-6 inline-flex min-h-11 items-center text-sm font-semibold text-primary-600 hover:underline"
            >
              {tNav('about')}
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
