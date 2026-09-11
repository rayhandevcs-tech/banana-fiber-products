/**
 * Navigation structure.
 *
 * Defined once and consumed by the desktop header, the mobile drawer and the
 * footer, so a link can never appear in one place and be missing from another.
 *
 * `labelKey` points into the `nav` namespace of the message catalogues — no
 * navigation label is ever written as literal text in a component.
 */

export interface NavItem {
  href: string;
  labelKey: string;
}

/** Primary navigation, shown in the desktop header and the mobile drawer. */
export const primaryNav: NavItem[] = [
  { href: '/shop', labelKey: 'shop' },
  { href: '/categories', labelKey: 'categories' },
  { href: '/how-its-made', labelKey: 'howItsMade' },
  { href: '/about', labelKey: 'about' },
  { href: '/contact', labelKey: 'contact' },
];

/**
 * Order tracking replaces the customer account entry: checkout is guest-only,
 * so there is no account to sign in to.
 */
export const trackOrderNav: NavItem = {
  href: '/track-order',
  labelKey: 'trackOrder',
};

/** Footer "Shop" column. */
export const footerShopNav: NavItem[] = [
  { href: '/shop', labelKey: 'shop' },
  { href: '/categories', labelKey: 'categories' },
  { href: '/track-order', labelKey: 'trackOrder' },
];
