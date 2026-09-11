'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { AlertTriangle } from 'lucide-react';

import { Section, EmptyState, Button } from '@/components/ui';

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('states');
  const tActions = useTranslations('actions');

  useEffect(() => {
    // Surfaced in server logs; the message itself is never shown to the
    // customer, since it can leak internal detail.
    console.error(error);
  }, [error]);

  return (
    <Section spacing="lg">
      <EmptyState
        icon={<AlertTriangle className="h-8 w-8" />}
        title={t('errorTitle')}
        description={t('errorBody')}
        action={<Button onClick={reset}>{tActions('retry')}</Button>}
      />
    </Section>
  );
}
