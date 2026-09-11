import { useTranslations } from 'next-intl';
import { Phone, Mail, MapPin, Leaf } from 'lucide-react';

import { Link } from '@/lib/i18n/routing';
import { FacebookIcon, InstagramIcon } from '@/components/icons/SocialIcons';
import { footerShopNav } from '@/config/navigation';
import { Container } from '@/components/ui';

/**
 * Site footer.
 *
 * A Server Component — it holds no interactive state, so none of it is shipped
 * to the browser as JavaScript.
 *
 * Stacks to a single column on mobile and opens to four on desktop. Contact
 * details come first in the mobile order because a phone number is the action
 * a hesitant first-time buyer is most likely to want.
 */
export function Footer() {
  const t = useTranslations('footer');
  const tNav = useTranslations('nav');
  const tBrand = useTranslations('brand');
  const tTrust = useTranslations('trust');

  const year = new Date().getFullYear();

  const helpLinks = [
    { href: '/delivery-information', label: t('deliveryInfo') },
    { href: '/return-policy', label: t('returnPolicy') },
    { href: '/faq', label: t('faq') },
    { href: '/privacy-policy', label: t('privacyPolicy') },
  ];

  return (
    <footer className="mt-auto border-t border-beige-200 bg-primary-600 text-primary-50">
      <Container>
        <div className="grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4 lg:py-14">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2">
              <Leaf className="h-6 w-6 shrink-0" aria-hidden="true" />
              <span className="text-lg font-bold text-white">
                {tBrand('name')}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-primary-100">
              {t('aboutText')}
            </p>
            <div className="mt-4 flex items-center gap-2">
              <a
                href="https://facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="tap-target flex items-center justify-center rounded-lg text-primary-100 transition-colors hover:bg-primary-500 hover:text-white"
              >
                <FacebookIcon className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="tap-target flex items-center justify-center rounded-lg text-primary-100 transition-colors hover:bg-primary-500 hover:text-white"
              >
                <InstagramIcon className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <nav aria-labelledby="footer-shop">
            <h2
              id="footer-shop"
              className="text-sm font-semibold tracking-wide text-white uppercase"
            >
              {t('shopTitle')}
            </h2>
            <ul className="mt-3 space-y-1">
              {footerShopNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex min-h-10 items-center text-sm text-primary-100 transition-colors hover:text-white"
                  >
                    {tNav(item.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Help */}
          <nav aria-labelledby="footer-help">
            <h2
              id="footer-help"
              className="text-sm font-semibold tracking-wide text-white uppercase"
            >
              {t('helpTitle')}
            </h2>
            <ul className="mt-3 space-y-1">
              {helpLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex min-h-10 items-center text-sm text-primary-100 transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-white uppercase">
              {t('contactTitle')}
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-primary-100">
              <li>
                <a
                  href="tel:+8801712345678"
                  className="flex min-h-10 items-center gap-2 transition-colors hover:text-white"
                >
                  <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {/* dir="ltr" keeps the number readable in a Bengali page. */}
                  <span dir="ltr">01712-345678</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@bananafiber.com.bd"
                  className="flex min-h-10 items-center gap-2 transition-colors hover:text-white"
                >
                  <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="break-all" dir="ltr">
                    hello@bananafiber.com.bd
                  </span>
                </a>
              </li>
              <li className="flex items-start gap-2 py-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{t('addressValue')}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Trust strip */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-primary-500 py-4 text-xs text-primary-100">
          <span>{tTrust('cashOnDelivery')}</span>
          <span aria-hidden="true" className="hidden sm:inline">
            ·
          </span>
          <span>{tTrust('deliveryAcrossBangladesh')}</span>
          <span aria-hidden="true" className="hidden sm:inline">
            ·
          </span>
          <span>{tTrust('handmade')}</span>
        </div>

        <div className="flex flex-col items-center gap-1 border-t border-primary-500 py-4 text-center text-xs text-primary-200 sm:flex-row sm:justify-between">
          <p>
            © {year} {tBrand('name')}. {t('rights')}
          </p>
          <p>{t('madeWith')}</p>
        </div>
      </Container>
    </footer>
  );
}
