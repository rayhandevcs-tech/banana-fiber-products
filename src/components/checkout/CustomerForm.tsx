'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';

import type { Locale } from '@/config/locales';
import type { LocalizedText } from '@/types/content';
import { Input, Select, Textarea, Button } from '@/components/ui';
import { isValidBdPhone } from '@/lib/format/phone';
import type { DeliveryOptions } from '@/server/repositories/catalog';
import { cn } from '@/lib/utils/cn';

export interface CustomerFormValues {
  name: string;
  phone: string;
  email: string;
  upazila: string;
  area: string;
  addressLine: string;
  deliveryNote: string;
}

/**
 * Who the order is for and where it goes.
 *
 * Validated here for speed and again on the server for truth. This copy only
 * decides whether to bother the server; the server's copy decides whether an
 * order exists, and it re-checks every field from scratch.
 *
 * Deliberately short. Every field asked for is one the shop actually needs to
 * deliver the parcel or ring the customer about it — there is no marketing
 * question, no account to create and no password to choose.
 */
export function CustomerForm({
  locale,
  options,
  districtId,
  methodId,
  onDistrictChange,
  onMethodChange,
  invalidFields,
  submitting,
  canSubmit,
  onSubmit,
  estimatedDays,
}: {
  locale: Locale;
  options: DeliveryOptions;
  districtId: string;
  methodId: string;
  onDistrictChange: (id: string) => void;
  onMethodChange: (id: string) => void;
  /** Field names the server rejected, so its verdict can be shown inline. */
  invalidFields: string[];
  submitting: boolean;
  canSubmit: boolean;
  onSubmit: (values: CustomerFormValues) => void;
  estimatedDays: LocalizedText | null;
}) {
  const t = useTranslations('checkout');
  const methodName = useId();

  const [values, setValues] = useState<CustomerFormValues>({
    name: '',
    phone: '',
    email: '',
    upazila: '',
    area: '',
    addressLine: '',
    deliveryNote: '',
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const set = (field: keyof CustomerFormValues) => (value: string) =>
    setValues((current) => ({ ...current, [field]: value }));

  // A field's error appears once the customer has left it, or once the server
  // has objected — never while they are still part-way through typing it.
  const errors: Partial<Record<string, string>> = {
    name: values.name.trim().length < 2 ? t('nameError') : undefined,
    phone: !isValidBdPhone(values.phone) ? t('phoneError') : undefined,
    email:
      values.email.trim().length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())
        ? t('emailError')
        : undefined,
    upazila: values.upazila.trim().length < 1 ? t('upazilaError') : undefined,
    addressLine: values.addressLine.trim().length < 5 ? t('addressLineError') : undefined,
    districtId: districtId ? undefined : t('districtError'),
    methodId: methodId ? undefined : t('methodError'),
  };

  const showError = (field: string) =>
    (touched[field] || invalidFields.includes(field)) ? errors[field] : undefined;

  const blur = (field: string) => () =>
    setTouched((current) => ({ ...current, [field]: true }));

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        // Reveal every outstanding error at once rather than one per attempt.
        setTouched({
          name: true, phone: true, email: true, upazila: true,
          addressLine: true, districtId: true, methodId: true,
        });
        if (Object.values(errors).some(Boolean)) return;
        onSubmit(values);
      }}
      className="flex flex-col gap-6"
    >
      <section
        aria-labelledby="customer-heading"
        className="rounded-xl border border-beige-200 bg-surface p-4 sm:p-5"
      >
        <h2 id="customer-heading" className="text-lg font-semibold text-ink-800">
          {t('customerHeading')}
        </h2>

        <div className="mt-4 flex flex-col gap-4">
          <Input
            label={t('name')}
            value={values.name}
            onChange={(e) => set('name')(e.target.value)}
            onBlur={blur('name')}
            placeholder={t('namePlaceholder')}
            autoComplete="name"
            required
            {...(showError('name') ? { error: showError('name') } : {})}
          />

          <Input
            label={t('phone')}
            // `tel` brings up the phone keypad, which is the only keyboard
            // that makes sense for an 11-digit number on a phone.
            type="tel"
            inputMode="numeric"
            value={values.phone}
            onChange={(e) => set('phone')(e.target.value)}
            onBlur={blur('phone')}
            placeholder={t('phonePlaceholder')}
            autoComplete="tel"
            required
            hint={t('phoneHint')}
            {...(showError('phone') ? { error: showError('phone') } : {})}
          />

          <Input
            label={t('email')}
            type="email"
            value={values.email}
            onChange={(e) => set('email')(e.target.value)}
            onBlur={blur('email')}
            placeholder={t('emailPlaceholder')}
            autoComplete="email"
            optionalLabel={t('emailOptional')}
            {...(showError('email') ? { error: showError('email') } : {})}
          />
        </div>
      </section>

      <section
        aria-labelledby="address-heading"
        className="rounded-xl border border-beige-200 bg-surface p-4 sm:p-5"
      >
        <h2 id="address-heading" className="text-lg font-semibold text-ink-800">
          {t('addressHeading')}
        </h2>

        <div className="mt-4 flex flex-col gap-4">
          <Select
            label={t('district')}
            value={districtId}
            onChange={(e) => onDistrictChange(e.target.value)}
            onBlur={blur('districtId')}
            placeholder={t('districtPlaceholder')}
            required
            options={options.districts.map((district) => ({
              value: district.id,
              label: `${district.name[locale]} — ${district.division[locale]}`,
            }))}
            {...(showError('districtId') ? { error: showError('districtId') } : {})}
          />

          <Input
            label={t('upazila')}
            value={values.upazila}
            onChange={(e) => set('upazila')(e.target.value)}
            onBlur={blur('upazila')}
            placeholder={t('upazilaPlaceholder')}
            required
            {...(showError('upazila') ? { error: showError('upazila') } : {})}
          />

          <Input
            label={t('area')}
            value={values.area}
            onChange={(e) => set('area')(e.target.value)}
            placeholder={t('areaPlaceholder')}
          />

          <Textarea
            label={t('addressLine')}
            value={values.addressLine}
            onChange={(e) => set('addressLine')(e.target.value)}
            onBlur={blur('addressLine')}
            placeholder={t('addressLinePlaceholder')}
            rows={3}
            required
            {...(showError('addressLine') ? { error: showError('addressLine') } : {})}
          />

          <Textarea
            label={t('deliveryNote')}
            value={values.deliveryNote}
            onChange={(e) => set('deliveryNote')(e.target.value)}
            placeholder={t('deliveryNotePlaceholder')}
            rows={2}
          />
        </div>
      </section>

      <section
        aria-labelledby="method-heading"
        className="rounded-xl border border-beige-200 bg-surface p-4 sm:p-5"
      >
        <h2 id="method-heading" className="text-lg font-semibold text-ink-800">
          {t('methodHeading')}
        </h2>

        {/* Radios rather than a dropdown: there are two choices and their
            descriptions matter to the decision, so both are shown at once. */}
        <fieldset className="mt-4">
          <legend className="sr-only">{t('methodHeading')}</legend>
          <div className="flex flex-col gap-2">
            {options.methods.map((method) => (
              <label
                key={method.id}
                className={cn(
                  'flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors',
                  'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary-500/40',
                  methodId === method.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-beige-300 hover:bg-beige-50',
                )}
              >
                <input
                  type="radio"
                  name={methodName}
                  checked={methodId === method.id}
                  onChange={() => onMethodChange(method.id)}
                  className="mt-0.5 h-5 w-5 shrink-0 accent-primary-500"
                />
                <span className="min-w-0">
                  <span className="block text-base font-medium text-ink-800">
                    {method.name[locale]}
                  </span>
                  {method.description ? (
                    <span className="mt-0.5 block text-sm text-ink-500">
                      {method.description[locale]}
                    </span>
                  ) : null}
                  {/* Shown only for the selected method, because the estimate
                      comes from the rate the server quoted for it. */}
                  {methodId === method.id && estimatedDays ? (
                    <span className="mt-1 block text-sm text-ink-600">
                      {t('estimatedDays', { days: estimatedDays[locale] })}
                    </span>
                  ) : null}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      <Button
        type="submit"
        size="lg"
        fullWidth
        // Disabled while a submission is in flight, so a second tap cannot
        // start a second one. The idempotency key is the guarantee behind it;
        // this is only the first line of defence.
        disabled={submitting || !canSubmit}
        isLoading={submitting}
        loadingLabel={t('placing')}
      >
        {submitting ? t('placing') : t('placeOrder')}
      </Button>
    </form>
  );
}
