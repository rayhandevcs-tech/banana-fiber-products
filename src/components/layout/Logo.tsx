import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/routing';
import { cn } from '@/lib/utils/cn';
import { BrandMark } from './BrandMark';

/**
 * The header wordmark: the brand mark followed by the shop's name.
 *
 * The name is read from the message catalogue rather than written here, so it
 * is translated with everything else and lives in exactly one place.
 */
export function Logo({ className }: { className?: string }) {
  const t = useTranslations('brand');

  return (
    <Link
      href="/"
      className={cn(
        'flex shrink-0 items-center gap-2 rounded-lg',
        'transition-opacity hover:opacity-85',
        className,
      )}
    >
      <BrandMark className="h-8 w-8" />

      <span className="text-lg leading-tight font-bold text-primary-600 sm:text-xl">
        {t('name')}
      </span>
    </Link>
  );
}
