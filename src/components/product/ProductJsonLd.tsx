import type { Locale } from '@/config/locales';
import type { ProductDetail } from '@/server/repositories/catalog';
import { effectivePrice, toTaka } from '@/lib/format/money';

/**
 * Product structured data.
 *
 * Only fields the database can actually vouch for. There is no rating system,
 * no review system and no brand record in the schema, so `aggregateRating`,
 * `review` and `brand` are absent rather than fabricated — inventing them
 * would be both a lie to customers and a violation of Google's guidelines.
 *
 * The price is emitted in Taka as a decimal string because that is what
 * schema.org expects; it is derived from the integer poisha by the same
 * helper the visible price uses, so the two can never disagree.
 */
export function ProductJsonLd({
  product,
  locale,
  url,
  imageUrls,
}: {
  product: ProductDetail;
  locale: Locale;
  url: string;
  imageUrls: string[];
}) {
  const price = effectivePrice(product.pricePoisha, product.discountPoisha);

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name[locale],
    sku: product.sku,
    ...(product.description ? { description: product.description[locale] } : {}),
    ...(imageUrls.length > 0 ? { image: imageUrls } : {}),
    ...(product.materials ? { material: product.materials[locale] } : {}),
    ...(product.weightGrams
      ? {
          weight: {
            '@type': 'QuantitativeValue',
            value: product.weightGrams,
            unitCode: 'GRM',
          },
        }
      : {}),
    category: product.category.name[locale],
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'BDT',
      price: toTaka(price).toFixed(2),
      availability:
        product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <script
      type="application/ld+json"
      // JSON.stringify escapes quotes and backslashes, but not the sequence
      // `</script>`, which would end this block early if it ever appeared in a
      // product description. Escaping `<` closes that hole; the value stays
      // valid JSON because < is a legal escape.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}
