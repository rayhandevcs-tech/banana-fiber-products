import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/routing';
import { cn } from '@/lib/utils/cn';

/**
 * Wordmark with a woven-fiber leaf glyph.
 *
 * Inline SVG rather than an image file: it is a few hundred bytes, scales
 * crisply on any screen, needs no extra request, and recolours with the theme.
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
      <svg
        viewBox="0 0 32 32"
        className="h-8 w-8 shrink-0 text-primary-500"
        aria-hidden="true"
        fill="none"
      >
        <path
          d="M16 3C9 8 6 14 6 20a10 10 0 0 0 20 0c0-6-3-12-10-17Z"
          fill="currentColor"
          opacity="0.16"
        />
        <path
          d="M16 3C9 8 6 14 6 20a10 10 0 0 0 20 0c0-6-3-12-10-17Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        {/* The central vein and its ribs read as both a leaf and a weave. */}
        <path
          d="M16 7v19"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M16 12l-5 3M16 12l5 3M16 18l-5 3M16 18l5 3"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          opacity="0.75"
        />
      </svg>

      <span className="text-lg leading-tight font-bold text-primary-600 sm:text-xl">
        {t('name')}
      </span>
    </Link>
  );
}
