import { Leaf, Hand, Recycle, Users } from 'lucide-react';
import { placeholderImages } from '@/config/images';
import type { ImageAsset } from '@/types/content';

/**
 * Homepage content that is not stored in the database.
 *
 * Copy lives in the message catalogues (so it is translated like everything
 * else); this file holds only the *structure* — which icon, which image, what
 * order — keyed to those translations.
 */

export interface BenefitItem {
  key: string;
  Icon: typeof Leaf;
  titleKey: string;
  bodyKey: string;
}

export const benefits: BenefitItem[] = [
  { key: 'natural', Icon: Leaf, titleKey: 'whyNaturalTitle', bodyKey: 'whyNaturalBody' },
  { key: 'handmade', Icon: Hand, titleKey: 'whyHandmadeTitle', bodyKey: 'whyHandmadeBody' },
  { key: 'eco', Icon: Recycle, titleKey: 'whyEcoTitle', bodyKey: 'whyEcoBody' },
  { key: 'artisans', Icon: Users, titleKey: 'whyArtisansTitle', bodyKey: 'whyArtisansBody' },
];

export interface ProcessStep {
  key: string;
  titleKey: string;
  bodyKey: string;
  altKey: string;
  src: string;
}

export const processSteps: ProcessStep[] = [
  { key: 'plant', titleKey: 'howStep1Title', bodyKey: 'howStep1Body', altKey: 'howStep1Alt', src: placeholderImages.plant },
  { key: 'fiber', titleKey: 'howStep2Title', bodyKey: 'howStep2Body', altKey: 'howStep2Alt', src: placeholderImages.fiber },
  { key: 'crafting', titleKey: 'howStep3Title', bodyKey: 'howStep3Body', altKey: 'howStep3Alt', src: placeholderImages.crafting },
  { key: 'finished', titleKey: 'howStep4Title', bodyKey: 'howStep4Body', altKey: 'howStep4Alt', src: placeholderImages.finished },
];

/** Hero artwork — PLACEHOLDER. Swap `src` for the real photograph. */
export const heroImage = (altEn: string, altBn: string): ImageAsset => ({
  src: placeholderImages.heroCollection,
  alt: { en: altEn, bn: altBn },
  isPlaceholder: true,
});

/** Artisan story artwork — PLACEHOLDER. */
export const storyImage = (altEn: string, altBn: string): ImageAsset => ({
  src: placeholderImages.artisan,
  alt: { en: altEn, bn: altBn },
  isPlaceholder: true,
});

/**
 * Qualitative points about how the work is organised.
 *
 * Deliberately NOT statistics. Numbers like "40+ artisans" or "6 villages"
 * would read as verified business facts, and nobody has verified them — so
 * they are not stated at all until the business supplies real figures.
 * Replacing these with audited numbers later is an edit to this array plus
 * its message keys; the component renders whatever it is given.
 */
export const storyPoints = [
  { key: 'point1', labelKey: 'storyPoint1' },
  { key: 'point2', labelKey: 'storyPoint2' },
  { key: 'point3', labelKey: 'storyPoint3' },
];
