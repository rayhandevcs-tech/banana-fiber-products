'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { AlertTriangle } from 'lucide-react';

import { Section, EmptyState, Button } from '@/components/ui';

/**
 * Shown when checkout itself fails to render. Order-level problems never reach
 * here — those are answered inline so the customer can correct them.
 *
 * The underlying error is logged on the server and never rendered: it can name
 * tables, columns and connection details.
 */
export default function CheckoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('states');
  const tActions = useTranslations('actions');

  useEffect(() => {
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
