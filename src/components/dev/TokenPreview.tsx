'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle2, AlertTriangle, XCircle, Trash2 } from 'lucide-react';

import {
  Section,
  Card,
  CardHeader,
  Button,
  Input,
  Select,
  Textarea,
  Badge,
  Skeleton,
  SkeletonText,
  LoadingState,
  QuantitySelector,
  ConfirmDialog,
  useToast,
} from '@/components/ui';

/**
 * DEVELOPMENT ONLY — a live gallery of the design system.
 *
 * Lets every component be checked at every breakpoint and in both languages
 * without waiting for the feature pages that will use them. Remove this
 * component (and its route usage) once the customer pages exist.
 */
export function TokenPreview() {
  const t = useTranslations('actions');
  const tStock = useTranslations('stock');
  const tStates = useTranslations('states');
  const tProduct = useTranslations('product');
  const tCommon = useTranslations('common');
  const { show } = useToast();

  const [quantity, setQuantity] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const swatches = [
    { name: 'primary', hex: '#2F5D50', className: 'bg-primary-500' },
    { name: 'leaf', hex: '#6F8F4E', className: 'bg-leaf-500' },
    { name: 'beige', hex: '#D8C3A5', className: 'bg-beige-300' },
    { name: 'clay', hex: '#B56B4A', className: 'bg-clay-500' },
    { name: 'ink', hex: '#24332D', className: 'bg-ink-700' },
    { name: 'canvas', hex: '#FAF8F2', className: 'bg-canvas border-beige-300' },
  ];

  return (
    <Section
      title="Design system"
      description="Every component below is shared by the customer site and the admin panel."
      spacing="md"
    >
      <div className="space-y-6">
        {/* Colour */}
        <Card>
          <CardHeader title="Colour" />
          <div className="mt-4 grid grid-cols-2 gap-3 xs:grid-cols-3 lg:grid-cols-6">
            {swatches.map((swatch) => (
              <div key={swatch.name}>
                <div
                  className={`h-16 rounded-lg border border-transparent ${swatch.className}`}
                />
                <p className="mt-1.5 text-sm font-medium text-ink-700">
                  {swatch.name}
                </p>
                <p className="text-xs text-ink-400" dir="ltr">
                  {swatch.hex}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Typography */}
        <Card>
          <CardHeader title="Typography" />
          <div className="mt-4 space-y-3">
            <p className="text-4xl font-bold text-ink-800">
              প্রকৃতির ছোঁয়ায় তৈরি
            </p>
            <p className="text-4xl font-bold text-ink-800">
              Handmade with Nature
            </p>
            <p className="text-base text-ink-600">
              কলাগাছের তন্তু দিয়ে হাতে বোনা এই পণ্যগুলো বাংলাদেশের গ্রামীণ
              কারিগরদের নিপুণ কাজের ফল। প্রতিটি পণ্যে রয়েছে প্রকৃতির নিজস্ব
              ছোঁয়া।
            </p>
            <p className="text-base text-ink-600">
              Woven by hand from banana fiber, these products are the work of
              skilled rural artisans across Bangladesh.
            </p>
          </div>
        </Card>

        {/* Buttons */}
        <Card>
          <CardHeader title="Buttons" />
          <div className="mt-4 flex flex-wrap gap-3">
            <Button>{t('addToCart')}</Button>
            <Button variant="secondary">{t('buyNow')}</Button>
            <Button variant="outline">{t('viewDetails')}</Button>
            <Button variant="ghost">{t('back')}</Button>
            <Button
              variant="danger"
              leadingIcon={<Trash2 className="h-4 w-4" />}
              onClick={() => setConfirmOpen(true)}
            >
              {t('delete')}
            </Button>
            <Button isLoading loadingLabel={tStates('loading')}>
              {t('save')}
            </Button>
            <Button disabled>{t('addToCart')}</Button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button size="sm">{t('viewAll')}</Button>
            <Button size="md">{t('viewAll')}</Button>
            <Button size="lg">{t('viewAll')}</Button>
          </div>
        </Card>

        {/* Badges */}
        <Card>
          <CardHeader title="Badges" />
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge tone="success" icon={<CheckCircle2 className="h-3.5 w-3.5" />}>
              {tStock('inStock')}
            </Badge>
            <Badge tone="warning" icon={<AlertTriangle className="h-3.5 w-3.5" />}>
              {tStock('lowStock')}
            </Badge>
            <Badge tone="danger" icon={<XCircle className="h-3.5 w-3.5" />}>
              {tStock('outOfStock')}
            </Badge>
            <Badge tone="clay">-১৫%</Badge>
            <Badge tone="primary">{tProduct('handmade')}</Badge>
            <Badge tone="neutral">{tProduct('bangladesh')}</Badge>
          </div>
        </Card>

        {/* Forms */}
        <Card>
          <CardHeader title="Form controls" />
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Input
              label={tProduct('price')}
              placeholder="850"
              inputMode="numeric"
              prefix={tCommon('currencySymbol')}
              required
            />
            <Input
              label="ফোন নম্বর"
              placeholder="01712345678"
              inputMode="tel"
              error="সঠিক মোবাইল নম্বর লিখুন (১১ ডিজিট)"
            />
            <Select
              label={tProduct('quantity')}
              placeholder="নির্বাচন করুন"
              defaultValue=""
              options={[
                { value: 'baskets', label: 'ঝুড়ি' },
                { value: 'bags', label: 'ব্যাগ' },
                { value: 'mats', label: 'মাদুর ও পাপোশ' },
              ]}
              hint="পণ্যের ধরন বেছে নিন"
            />
            <Textarea
              label="ঠিকানা"
              placeholder="বাড়ি নম্বর, রাস্তা, এলাকা"
              optionalLabel={tCommon('optional')}
            />
          </div>
        </Card>

        {/* Quantity + feedback */}
        <Card>
          <CardHeader title="Quantity & feedback" />
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <QuantitySelector
              value={quantity}
              onChange={setQuantity}
              max={10}
              label={tProduct('quantity')}
              decreaseLabel={tProduct('decrease')}
              increaseLabel={tProduct('increase')}
            />
            <QuantitySelector
              value={quantity}
              onChange={setQuantity}
              max={10}
              size="lg"
              label={tProduct('quantity')}
              decreaseLabel={tProduct('decrease')}
              increaseLabel={tProduct('increase')}
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => show('পণ্যটি কার্টে যোগ করা হয়েছে', 'success')}
            >
              Toast: success
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => show(tStates('errorBody'), 'error')}
            >
              Toast: error
            </Button>
          </div>
        </Card>

        {/* Loading */}
        <Card>
          <CardHeader title="Loading states" />
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            <div>
              <Skeleton className="aspect-[4/3] w-full" />
              <SkeletonText lines={2} className="mt-3" />
              <Skeleton className="mt-3 h-11 w-full" />
            </div>
            <LoadingState label={tStates('loadingProducts')} />
          </div>
        </Card>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          show('পণ্যটি মুছে ফেলা হয়েছে', 'success');
        }}
        title="আপনি কি এই পণ্যটি মুছে ফেলতে চান?"
        message="মুছে ফেললে পণ্যটি আর ওয়েবসাইটে দেখা যাবে না। পরে দরকার হলে ফিরিয়ে আনা যাবে।"
        confirmLabel="হ্যাঁ, মুছে ফেলুন"
        cancelLabel="না, ফিরে যান"
        closeLabel={t('close')}
        destructive
      />
    </Section>
  );
}
