import { useTranslations } from 'next-intl';
import { Star, Quote } from 'lucide-react';

import type { Locale } from '@/config/locales';
import { Section } from '@/components/ui';
import { testimonials } from '@/content/testimonials';

/**
 * Customer quotes.
 *
 * The data comes from `content/testimonials.ts` in a fixed shape, so replacing
 * placeholder quotes with real ones — or moving them into the database later —
 * requires no change here.
 */
export function Testimonials({ locale }: { locale: Locale }) {
  const t = useTranslations('home');

  if (testimonials.length === 0) return null;

  return (
    <Section title={t('testimonialsTitle')} description={t('testimonialsSubtitle')}>
      <ul className="grid gap-4 md:grid-cols-3">
        {testimonials.map((testimonial) => (
          <li
            key={testimonial.id}
            className="flex flex-col rounded-xl border border-beige-200 bg-surface p-5"
          >
            <Quote
              className="h-6 w-6 shrink-0 text-beige-400"
              aria-hidden="true"
            />

            <blockquote className="mt-3 flex-1 text-base leading-relaxed text-ink-600">
              {testimonial.quote[locale]}
            </blockquote>

            <div className="mt-4 border-t border-beige-200 pt-3">
              {/* The star row is decorative; the rating is announced in words. */}
              <p
                className="flex items-center gap-0.5"
                aria-label={`${testimonial.rating} / 5`}
              >
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    aria-hidden="true"
                    className={
                      index < testimonial.rating
                        ? 'h-4 w-4 fill-clay-500 text-clay-500'
                        : 'h-4 w-4 text-beige-300'
                    }
                  />
                ))}
              </p>
              <p className="mt-1.5 text-sm font-semibold text-ink-800">
                {testimonial.authorName[locale]}
              </p>
              <p className="text-sm text-ink-500">
                {testimonial.authorLocation[locale]}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
