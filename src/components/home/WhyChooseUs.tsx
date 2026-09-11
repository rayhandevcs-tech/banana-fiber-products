import { useTranslations } from 'next-intl';

import { Section } from '@/components/ui';
import { benefits } from '@/content/home';

/**
 * Four reasons to trust the shop.
 *
 * Mobile  : a compact row per benefit — icon beside the text. Two columns at
 *           320-390px would wrap a Bengali heading like
 *           "গ্রামীণ কারিগরদের পাশে" onto three lines; stacked full-width
 *           cards with the icon on top waste vertical space instead.
 * Desktop : four across, icon above the text.
 */
export function WhyChooseUs() {
  const t = useTranslations('home');

  return (
    <Section title={t('whyTitle')} description={t('whySubtitle')}>
      <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        {benefits.map(({ key, Icon, titleKey, bodyKey }) => (
          <li
            key={key}
            className="flex items-start gap-3 rounded-xl border border-beige-200 bg-surface p-4 sm:flex-col sm:gap-0 sm:p-5"
          >
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-leaf-50 text-leaf-700 sm:h-12 sm:w-12"
              aria-hidden="true"
            >
              <Icon className="h-6 w-6" />
            </span>
            <div className="min-w-0 sm:mt-3">
              <h3 className="text-base font-semibold text-ink-800">
                {t(titleKey)}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-500 sm:mt-1.5">
                {t(bodyKey)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
