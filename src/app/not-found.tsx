import { redirect } from 'next/navigation';
import { defaultLocale } from '@/config/locales';

/**
 * A URL that matched no locale segment at all. Send it to the default locale's
 * not-found page so the visitor still gets a translated, navigable screen.
 */
export default function RootNotFound() {
  redirect(`/${defaultLocale}`);
}
