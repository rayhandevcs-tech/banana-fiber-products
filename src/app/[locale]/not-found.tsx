import { useTranslations } from 'next-intl';
import { SearchX } from 'lucide-react';

import { Link } from '@/lib/i18n/routing';
import { Section, EmptyState } from '@/components/ui';

export default function LocaleNotFound() {
  const t = useTranslations('states');
  const tNav = useTranslations('nav');

  return (
    <Section spacing="lg">
      <EmptyState
        icon={<SearchX className="h-8 w-8" />}
        title={t('notFoundTitle')}
        description={t('notFoundBody')}
        action={
          // A link, not a Button — an anchor inside a <button> is invalid HTML
          // and breaks keyboard activation.
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-primary-500 px-5 font-semibold text-white transition-colors hover:bg-primary-600"
          >
            {tNav('home')}
          </Link>
        }
      />
    </Section>
  );
}
