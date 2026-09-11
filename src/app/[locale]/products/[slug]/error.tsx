'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { AlertTriangle } from 'lucide-react';

import { Section, EmptyState, Button } from '@/components/ui';

/**
 * Shown when loading a product fails — the database is unreachable, a query
 * times out. Distinct from a missing product, which is a 404 handled by
 * `notFound()` and never reaches this boundary.
 *
 * The error's own message is never rendered: it can carry table names and
 * connection details that must not reach a browser.
 */
export default function ProductError({
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
