import { useTranslations } from 'next-intl';
import { LoadingState } from '@/components/ui';

export default function LocaleLoading() {
  const t = useTranslations('states');
  return <LoadingState label={t('loading')} className="py-24" />;
}
