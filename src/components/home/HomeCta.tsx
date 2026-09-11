import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';

import { Link } from '@/lib/i18n/routing';
import { Container } from '@/components/ui';

export function HomeCta() {
  const t = useTranslations('home');
  const tActions = useTranslations('actions');

  return (
    <section className="bg-primary-500 py-12 sm:py-16">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            {t('ctaTitle')}
          </h2>
          <p className="mt-3 text-base text-primary-100">{t('ctaBody')}</p>
          <Link
            href="/shop"
            className="mt-7 inline-flex h-14 items-center justify-center gap-2 rounded-lg bg-white px-8 text-base font-semibold text-primary-700 shadow-sm transition-colors hover:bg-beige-50"
          >
            {tActions('shopNow')}
            <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
