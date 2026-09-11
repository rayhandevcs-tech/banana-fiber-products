import { useTranslations } from 'next-intl';
import { ArrowDown } from 'lucide-react';

import type { Locale } from '@/config/locales';
import { Section, AspectImage } from '@/components/ui';
import { processSteps } from '@/content/home';
import { imageSizes } from '@/config/images';

/**
 * The four-step process, told visually.
 *
 * Mobile  : a compact horizontal row per step — thumbnail on the left, text on
 *           the right — with a downward arrow between. Four full-width square
 *           cards would add roughly 1,400px of scrolling to the page for a
 *           section the customer only needs to skim.
 * Desktop : four cards across, image on top.
 *
 * Order is carried for every user by the numbered "Step N" label and by the
 * list being an <ol>; the arrows are decorative and mobile-only. They live
 * inside each <li> rather than as siblings, because `display: contents` on a
 * list item strips list semantics in several browsers.
 */
export function HowItsMade({ locale }: { locale: Locale }) {
  const t = useTranslations('home');

  return (
    <Section
      id="how-its-made"
      title={t('howTitle')}
      description={t('howSubtitle')}
    >
      <ol className="grid gap-2 md:grid-cols-4 md:gap-4">
        {processSteps.map((step, index) => {
          const isLast = index === processSteps.length - 1;
          return (
            <li key={step.key} className="flex flex-col">
              <div
                className={
                  // Row on mobile, column from md up.
                  'flex flex-1 items-center gap-3 rounded-xl border border-beige-200 bg-surface p-3 ' +
                  'md:flex-col md:items-stretch md:gap-0 md:p-4'
                }
              >
                <AspectImage
                  image={{
                    src: step.src,
                    alt: { en: t(step.altKey), bn: t(step.altKey) },
                    isPlaceholder: true,
                  }}
                  locale={locale}
                  ratio="product"
                  sizes={imageSizes.stepImage}
                  className="w-20 shrink-0 rounded-lg sm:w-24 md:w-full"
                />
                <div className="min-w-0 md:mt-3">
                  <p className="text-xs font-semibold tracking-wide text-leaf-700 uppercase">
                    {t('howStep', { number: index + 1 })}
                  </p>
                  <h3 className="mt-0.5 text-base font-semibold text-ink-800 md:mt-1">
                    {t(step.titleKey)}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-500 md:mt-1.5">
                    {t(step.bodyKey)}
                  </p>
                </div>
              </div>

              {!isLast ? (
                <div
                  aria-hidden="true"
                  className="flex justify-center py-1 text-beige-500 md:hidden"
                >
                  <ArrowDown className="h-5 w-5" />
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
