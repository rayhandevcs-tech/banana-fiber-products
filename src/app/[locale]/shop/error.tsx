'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { AlertTriangle } from 'lucide-react';

import { Section, EmptyState, Button } from '@/components/ui';

/**
 * Shown when the shop itself fails — the database is unreachable, a query
 * times out.
 *
 * The customer is told that something went wrong and offered a retry. The
 * error's own message is never rendered: it can carry table names, connection
 * strings and other internals that must not reach a browser.
 */
export default function ShopError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('states');
  const tActions = useTranslations('actions');

  useEffect(() => {
    // Server-side logs keep the detail; the customer sees the calm version.
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
