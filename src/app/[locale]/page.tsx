import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Leaf, PackageSearch } from 'lucide-react';

import { Section, Card, Badge, Button, EmptyState } from '@/components/ui';
import { TokenPreview } from '@/components/dev/TokenPreview';

/**
 * TEMPORARY — Sprint 1 foundation page.
 *
 * The real homepage is Sprint 2. This page exists so the application can be
 * run and the design system verified across breakpoints and both languages.
 * Delete this file at the start of Sprint 2.
 */
export default async function FoundationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('brand');
  const tActions = await getTranslations('actions');
  const tStates = await getTranslations('states');

  return (
    <>
      <Section spacing="lg" tone="muted">
        <div className="mx-auto max-w-2xl text-center">
          <Badge tone="primary" icon={<Leaf className="h-3.5 w-3.5" />}>
            Sprint 1 — Design System
          </Badge>
          <h1 className="mt-4 text-3xl font-bold text-ink-800 sm:text-4xl lg:text-5xl">
            {t('tagline')}
          </h1>
          <p className="mt-4 text-base text-ink-500 sm:text-lg">
            {t('shortDescription')}
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" disabled>
              {tActions('shopNow')}
            </Button>
            <Button size="lg" variant="outline" disabled>
              {tActions('exploreProducts')}
            </Button>
          </div>
          <p className="mt-4 text-sm text-ink-400">
            These actions are wired up in Sprint 2.
          </p>
        </div>
      </Section>

      <TokenPreview />

      <Section spacing="md">
        <Card padding="none">
          <EmptyState
            icon={<PackageSearch className="h-8 w-8" />}
            title={tStates('emptyTitle')}
            description={tStates('emptyBody')}
          />
        </Card>
      </Section>
    </>
  );
}
