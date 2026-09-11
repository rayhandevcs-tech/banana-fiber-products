import type { ReactNode } from 'react';

/**
 * The specification table.
 *
 * A description list, which is what a set of label/value pairs actually is,
 * and which lets a screen reader announce "Material: 100% natural banana
 * fiber" as one unit.
 *
 * Rows with no value are dropped by the caller rather than rendered empty:
 * a blank "Weight —" row invites the reader to wonder whether the product has
 * no weight or the shop simply does not know. Nothing here is invented; every
 * row comes from a column that is actually filled in.
 */
export function ProductSpecs({
  rows,
  title,
}: {
  rows: { label: string; value: ReactNode }[];
  title: string;
}) {
  if (rows.length === 0) return null;

  return (
    <section aria-labelledby="product-specs-title">
      <h2
        id="product-specs-title"
        className="text-lg font-semibold text-ink-800 sm:text-xl"
      >
        {title}
      </h2>
      <dl className="mt-4 divide-y divide-beige-200 border-y border-beige-200">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4"
          >
            <dt className="text-sm font-medium text-ink-500">{row.label}</dt>
            <dd className="text-base text-ink-800">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
