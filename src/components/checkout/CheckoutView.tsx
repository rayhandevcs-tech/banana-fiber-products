'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { AlertCircle, ShoppingBag } from 'lucide-react';

import { Link, useRouter } from '@/lib/i18n/routing';
import type { Locale } from '@/config/locales';
import { Container, EmptyState, Skeleton } from '@/components/ui';
import { useCartStore } from '@/lib/cart/store';
import type { DeliveryOptions } from '@/server/repositories/catalog';
import type { Quote } from '@/server/checkout/quote';
import { quoteCheckout, submitOrder } from '@/server/actions/checkout';
import { CustomerForm, type CustomerFormValues } from './CustomerForm';
import { CheckoutSummary } from './CheckoutSummary';

/**
 * CHECKOUT
 *
 * The cart is in localStorage, so this has to be a client component — but it
 * is deliberately a thin one. It sends the server two things per line, a
 * product id and a quantity, and renders whatever the server says those are
 * worth.
 *
 * Every figure on the page — unit prices, subtotal, delivery charge, total —
 * comes back from `quoteCheckout`. None of it is read out of the cart. That
 * is the whole point: a customer can rewrite their localStorage cart to say a
 * basket costs one taka, and this page will still show, and charge, what the
 * database says.
 */
export function CheckoutView({
  locale,
  options,
}: {
  locale: Locale;
  options: DeliveryOptions;
}) {
  const t = useTranslations('checkout');
  const router = useRouter();

  const hydrated = useCartStore((state) => state.hydrated);
  const lines = useCartStore((state) => state.lines);
  const clearCart = useCartStore((state) => state.clear);

  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [invalidFields, setInvalidFields] = useState<string[]>([]);
  const [submitting, startSubmit] = useTransition();

  const [districtId, setDistrictId] = useState('');
  const [methodId, setMethodId] = useState(options.methods[0]?.id ?? '');

  /**
   * One idempotency key per visit to this page.
   *
   * Generated once and reused for every attempt, so a double tap or a retry
   * after a dropped connection carries the same key and the server answers
   * with the order it already made instead of creating a second one. A fresh
   * key is only minted after an order actually succeeds.
   */
  const idempotencyKey = useRef(crypto.randomUUID());

  // Only ids and quantities ever leave the browser.
  const requested = useMemo(
    () => lines.map((line) => ({ productId: line.productId, quantity: line.quantity })),
    [lines],
  );

  // What the customer's own cart believes each unit costs. Used solely to
  // point out where the shop's price has since changed — never to charge.
  const snapshotPrices = useMemo(
    () =>
      new Map(
        lines.map((line) => [
          line.productId,
          Math.max(0, line.pricePoisha - line.discountPoisha),
        ]),
      ),
    [lines],
  );

  const refreshQuote = useCallback(async () => {
    if (requested.length === 0) {
      setQuote(null);
      return;
    }
    setQuoting(true);
    const response = await quoteCheckout(
      requested,
      districtId && methodId ? { districtId, methodId } : null,
    );
    setQuoting(false);

    if (response.ok) {
      setQuote(response.quote);
      setFormError(null);
      return;
    }

    setQuote(null);
    setFormError(
      response.problem === 'district-not-found'
        ? t('errorDistrict')
        : response.problem === 'method-not-found'
          ? t('errorMethod')
          : response.problem === 'rate-not-found'
            ? t('errorRate')
            : t('errorFailed'),
    );
  }, [requested, districtId, methodId, t]);

  // Re-priced whenever the cart or the delivery choice changes, so the figures
  // never describe an older version of either.
  useEffect(() => {
    if (!hydrated) return;
    void refreshQuote();
  }, [hydrated, refreshQuote]);

  function handleSubmit(values: CustomerFormValues) {
    setFormError(null);
    setInvalidFields([]);

    startSubmit(async () => {
      const response = await submitOrder(requested, {
        ...values,
        districtId,
        methodId,
        idempotencyKey: idempotencyKey.current,
      });

      if (response.ok) {
        // Cleared only now — after the server has confirmed the order exists.
        // Clearing any earlier would lose the cart of every customer whose
        // order failed.
        clearCart();
        idempotencyKey.current = crypto.randomUUID();
        router.push(`/checkout/success?order=${encodeURIComponent(response.orderNumber)}`);
        return;
      }

      // The cart is deliberately left alone on every failure below, so the
      // customer can correct the problem and try again.
      if (response.reason === 'invalid-customer') {
        setInvalidFields(response.fields);
        setFormError(t('errorFixFields'));
        return;
      }
      if (response.reason === 'lines') {
        setQuote(response.quote);
        setFormError(null);
        return;
      }
      setFormError(
        response.reason === 'stock-conflict'
          ? t('errorStockConflict')
          : response.reason === 'delivery'
            ? t('errorRate')
            : t('errorFailed'),
      );
    });
  }

  if (!hydrated) {
    return (
      <Container className="py-6 sm:py-10">
        <Skeleton className="h-9 w-40" />
        <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:gap-10">
          <div className="min-w-0 flex-1 space-y-4">
            <Skeleton className="h-56 w-full rounded-xl" />
            <Skeleton className="h-72 w-full rounded-xl" />
          </div>
          <div className="w-full lg:w-96 lg:shrink-0">
            <Skeleton className="h-80 w-full rounded-xl" />
          </div>
        </div>
      </Container>
    );
  }

  if (lines.length === 0) {
    return (
      <Container className="py-10 sm:py-16">
        <h1 className="sr-only">{t('title')}</h1>
        <EmptyState
          icon={<ShoppingBag className="h-8 w-8" />}
          title={t('emptyTitle')}
          description={t('emptyBody')}
          action={
            <Link
              href="/shop"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-primary-500 px-6 text-base font-semibold text-white shadow-xs transition-colors hover:bg-primary-600 focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:outline-none"
            >
              {t('goToShop')}
            </Link>
          }
        />
      </Container>
    );
  }

  const blocking = quote?.lines.filter((line) => line.problem !== null) ?? [];

  /**
   * The button is disabled only for something the form itself cannot explain:
   * a cart holding an item that cannot be bought, which has to be fixed on the
   * cart page.
   *
   * An empty district or a missing name does NOT disable it. A disabled button
   * gives no reason, so a customer who has not filled the form would be left
   * pressing something dead with nothing telling them why; letting the press
   * through surfaces every outstanding field error at once instead.
   */
  const canPlace = quote !== null && quote.isFulfillable;

  return (
    <Container className="py-6 sm:py-10">
      <h1 className="text-2xl font-bold text-ink-800 sm:text-3xl">{t('title')}</h1>

      {formError ? (
        <p
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-lg border border-danger-500/40 bg-danger-50 px-4 py-3 text-base text-danger-700"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <span>{formError}</span>
        </p>
      ) : null}

      <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:gap-10">
        <div className="min-w-0 flex-1">
          <CustomerForm
            locale={locale}
            options={options}
            districtId={districtId}
            methodId={methodId}
            onDistrictChange={setDistrictId}
            onMethodChange={setMethodId}
            invalidFields={invalidFields}
            submitting={submitting}
            canSubmit={canPlace}
            onSubmit={handleSubmit}
            estimatedDays={quote?.delivery?.estimatedDays ?? null}
          />
        </div>

        <div className="w-full lg:w-96 lg:shrink-0">
          <div className="lg:sticky lg:top-24">
            <CheckoutSummary
              locale={locale}
              quote={quote}
              quoting={quoting}
              blocking={blocking}
              snapshotPrices={snapshotPrices}
              hasDelivery={Boolean(districtId && methodId)}
            />
          </div>
        </div>
      </div>
    </Container>
  );
}
