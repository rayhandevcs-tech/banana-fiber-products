import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

/**
 * Development seed data.
 *
 * Realistic Bangladeshi catalogue content in both languages — no placeholder
 * text. Deliberately includes the edge cases later sprints need to render:
 * a low-stock product, an out-of-stock product, a discounted product, and an
 * inactive (hidden) product.
 *
 * Safe to re-run: every write is an upsert keyed on a stable unique field.
 */

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is not set.');

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

/** Whole Taka → integer poisha. Money is never a float. */
const taka = (amount: number) => Math.round(amount * 100);

/**
 * Placeholder artwork, keyed by SKU prefix.
 *
 * Locally generated SVG illustrations, not photographs. Used for the products
 * that do not have a photograph of their own yet — see PHOTOGRAPHY_BY_SKU
 * below, which takes precedence wherever it has an entry.
 */
const PLACEHOLDER_BY_PREFIX: Record<string, string> = {
  'BF-BSK': '/images/placeholders/basket.svg',
  'BF-BAG': '/images/placeholders/bag.svg',
  'BF-MAT': '/images/placeholders/mat.svg',
  'BF-STR': '/images/placeholders/storage.svg',
  'BF-DEC': '/images/placeholders/decor.svg',
  'BF-GFT': '/images/placeholders/gift.svg',
};

const placeholderFor = (sku: string) =>
  PLACEHOLDER_BY_PREFIX[sku.slice(0, 6)] ?? '/images/placeholders/weave.svg';

interface Photograph {
  url: string;
  altEn: string;
  altBn: string;
}

/**
 * PRODUCT PHOTOGRAPHY, keyed by SKU.
 *
 * Served from /public as staging assets. Cloudinary (Sprint 10) replaces the
 * `url` with a res.cloudinary.com URL and fills in `cloudinaryId`; nothing
 * else has to change, because every surface in the application reads its
 * image from the ProductImage row rather than from a path written into a
 * component.
 *
 * The `/images/products` prefix carries meaning. `toImageAsset` in
 * src/server/repositories/catalog.ts decides whether an image is placeholder
 * artwork by its path — anything under `/images/placeholders` is treated as a
 * stand-in — so a real photograph filed there would be mislabelled by the
 * whole application.
 *
 * TEMPORARY, AND NOT ALL EQUAL. Three of these (the gift hamper, the tray set
 * and the tote bag) photograph that one product on its own. The other six are
 * workshop and collection shots showing many items at once; they are in use
 * because the shop asked for every available picture to be shown until real
 * photography exists, not because they identify the product. Their alt text
 * therefore describes the scene truthfully rather than claiming a single item,
 * and each should be replaced as soon as that product is photographed on its
 * own.
 */
const PHOTOGRAPHY_BY_SKU: Record<string, Photograph> = {
  'BF-GFT-001': {
    url: '/images/products/artisan-gift-hamper-basket.jpg',
    altEn:
      'Handwoven gift hamper basket with a fitted lid and two arched carrying handles, in teal and natural cream stripes',
    altBn:
      'ঢাকনা ও দুটি বাঁকানো হাতলসহ হাতে বোনা উপহারের ঝুড়ি, সবুজাভ নীল ও প্রাকৃতিক রঙের ডোরাকাটা নকশা',
  },
  'BF-STR-001': {
    url: '/images/products/nested-storage-tray-set.jpg',
    altEn:
      'A nested set of round coiled storage trays in natural fiber, the smaller trays sitting inside the largest',
    altBn:
      'প্রাকৃতিক তন্তুর গোল স্টোরেজ ট্রে সেট, ছোট ট্রেগুলো বড়টির ভিতরে সাজানো',
  },
  'BF-BAG-001': {
    url: '/images/products/woven-market-tote-bag.jpg',
    altEn:
      'Rectangular handwoven market tote bag in natural straw, with two braided carrying handles',
    altBn:
      'প্রাকৃতিক রঙের হাতে বোনা চারকোনা বাজারের টোট ব্যাগ, দুটি বিনুনি করা হাতলসহ',
  },

  // --- Workshop and collection shots, standing in until each product is
  // --- photographed on its own. The alt text describes the whole scene.
  'BF-BSK-001': {
    url: '/images/products/banana-fiber-storage-basket.jpg',
    altEn:
      'Workshop shelves lined with woven lidded storage containers and round mats',
    altBn:
      'কারখানার তাকজুড়ে সাজানো বোনা ঢাকনাওয়ালা পাত্র ও গোল মাদুর',
  },
  'BF-MAT-001': {
    url: '/images/products/handwoven-floor-mat-large.jpg',
    altEn:
      'Stacks of thick coiled natural fiber mats in several sizes, with woven bowls beside them',
    altBn:
      'নানা মাপের মোটা পাকানো প্রাকৃতিক তন্তুর মাদুরের স্তূপ, পাশে বোনা বাটি',
  },
  'BF-STR-002': {
    url: '/images/products/laundry-hamper-with-lid.jpg',
    altEn:
      'Large open woven baskets among assorted handwoven mats and household items',
    altBn:
      'বড় বোনা ঝুড়ি, সাথে নানা রকম হাতে বোনা মাদুর ও ঘরের জিনিসপত্র',
  },
  'BF-BAG-002': {
    url: '/images/products/small-shoulder-bag.jpg',
    altEn:
      'Woven shoulder bags hanging in a row at the workshop, with round mirrors above them',
    altBn:
      'কারখানায় সারি করে ঝোলানো বোনা কাঁধব্যাগ, উপরে গোল আয়না',
  },
  'BF-DEC-001': {
    url: '/images/products/banana-fiber-table-runner.jpg',
    altEn:
      'Rolled natural fiber runners laid out with a tote bag, a pouch and bundles of twine',
    altBn:
      'গুটিয়ে রাখা প্রাকৃতিক তন্তুর রানার, সাথে টোট ব্যাগ, পাউচ ও সুতার বান্ডিল',
  },
  'BF-GFT-002': {
    url: '/images/products/coaster-set-of-six.jpg',
    altEn:
      'Small round lidded containers and woven coasters in many colours, displayed together',
    altBn:
      'নানা রঙের ছোট গোল ঢাকনাওয়ালা পাত্র ও বোনা কোস্টার, একসাথে সাজানো',
  },
};

/**
 * Whether the seed put an image row there, and may therefore rewrite it.
 *
 * A URL the seed does not recognise — a Cloudinary upload made through the
 * Sprint 10 admin, say — belongs to someone else and is never touched.
 */
const isSeedManaged = (url: string) =>
  url.startsWith('/images/placeholders/') || url.startsWith('/images/products/');

async function main() {
  console.log('Seeding database…\n');

  // -------------------------------------------------------------------------
  // Delivery zones
  // -------------------------------------------------------------------------
  const insideDhaka = await db.deliveryZone.upsert({
    where: { code: 'INSIDE_DHAKA' },
    update: {},
    create: {
      code: 'INSIDE_DHAKA',
      nameEn: 'Inside Dhaka',
      nameBn: 'ঢাকার ভিতরে',
      sortOrder: 1,
    },
  });

  const outsideDhaka = await db.deliveryZone.upsert({
    where: { code: 'OUTSIDE_DHAKA' },
    update: {},
    create: {
      code: 'OUTSIDE_DHAKA',
      nameEn: 'Outside Dhaka',
      nameBn: 'ঢাকার বাইরে',
      sortOrder: 2,
    },
  });
  console.log('  ✓ 2 delivery zones');

  // -------------------------------------------------------------------------
  // Delivery methods
  // -------------------------------------------------------------------------
  const homeDelivery = await db.deliveryMethod.upsert({
    where: { code: 'HOME_DELIVERY' },
    update: {},
    create: {
      code: 'HOME_DELIVERY',
      nameEn: 'Home Delivery',
      nameBn: 'বাসায় ডেলিভারি',
      descEn: 'We deliver the parcel to your address.',
      descBn: 'আমরা আপনার ঠিকানায় পণ্য পৌঁছে দেব।',
      sortOrder: 1,
    },
  });

  const pickup = await db.deliveryMethod.upsert({
    where: { code: 'PICKUP' },
    update: {},
    create: {
      code: 'PICKUP',
      nameEn: 'Pickup from Shop',
      nameBn: 'দোকান থেকে নিয়ে যাবেন',
      descEn: 'Collect your order from our workshop. No delivery charge.',
      descBn: 'আমাদের কারখানা থেকে পণ্য সংগ্রহ করুন। কোনো ডেলিভারি খরচ নেই।',
      sortOrder: 2,
    },
  });
  console.log('  ✓ 2 delivery methods');

  // -------------------------------------------------------------------------
  // Delivery rates — the (method × zone) grid the admin will edit
  // -------------------------------------------------------------------------
  const rates = [
    {
      methodId: homeDelivery.id,
      zoneId: insideDhaka.id,
      chargePoisha: taka(60),
      freeAbovePoisha: taka(2000),
      estimatedDaysEn: '1-2 days',
      estimatedDaysBn: '১-২ দিন',
    },
    {
      methodId: homeDelivery.id,
      zoneId: outsideDhaka.id,
      chargePoisha: taka(120),
      freeAbovePoisha: taka(3000),
      estimatedDaysEn: '3-5 days',
      estimatedDaysBn: '৩-৫ দিন',
    },
    {
      methodId: pickup.id,
      zoneId: insideDhaka.id,
      chargePoisha: 0,
      freeAbovePoisha: null,
      estimatedDaysEn: 'Ready in 1 day',
      estimatedDaysBn: '১ দিনে প্রস্তুত',
    },
    {
      methodId: pickup.id,
      zoneId: outsideDhaka.id,
      chargePoisha: 0,
      freeAbovePoisha: null,
      estimatedDaysEn: 'Ready in 1 day',
      estimatedDaysBn: '১ দিনে প্রস্তুত',
    },
  ];

  for (const rate of rates) {
    await db.deliveryRate.upsert({
      where: { methodId_zoneId: { methodId: rate.methodId, zoneId: rate.zoneId } },
      update: {},
      create: rate,
    });
  }
  console.log('  ✓ 4 delivery rates (2 methods × 2 zones)');

  // -------------------------------------------------------------------------
  // Districts — a representative set; the full 64 are loaded in Sprint 6
  // when the checkout address form actually needs them.
  // -------------------------------------------------------------------------
  const districts = [
    ['Dhaka', 'ঢাকা', 'Dhaka', 'ঢাকা', insideDhaka.id],
    ['Gazipur', 'গাজীপুর', 'Dhaka', 'ঢাকা', outsideDhaka.id],
    ['Narayanganj', 'নারায়ণগঞ্জ', 'Dhaka', 'ঢাকা', outsideDhaka.id],
    ['Chattogram', 'চট্টগ্রাম', 'Chattogram', 'চট্টগ্রাম', outsideDhaka.id],
    ['Khulna', 'খুলনা', 'Khulna', 'খুলনা', outsideDhaka.id],
    ['Jhenaidah', 'ঝিনাইদহ', 'Khulna', 'খুলনা', outsideDhaka.id],
    ['Rajshahi', 'রাজশাহী', 'Rajshahi', 'রাজশাহী', outsideDhaka.id],
    ['Sylhet', 'সিলেট', 'Sylhet', 'সিলেট', outsideDhaka.id],
    ['Barishal', 'বরিশাল', 'Barishal', 'বরিশাল', outsideDhaka.id],
    ['Rangpur', 'রংপুর', 'Rangpur', 'রংপুর', outsideDhaka.id],
    ['Mymensingh', 'ময়মনসিংহ', 'Mymensingh', 'ময়মনসিংহ', outsideDhaka.id],
    ['Cumilla', 'কুমিল্লা', 'Chattogram', 'চট্টগ্রাম', outsideDhaka.id],
  ] as const;

  for (const [nameEn, nameBn, divisionEn, divisionBn, zoneId] of districts) {
    await db.district.upsert({
      where: { nameEn },
      update: {},
      create: { nameEn, nameBn, divisionEn, divisionBn, zoneId },
    });
  }
  console.log(`  ✓ ${districts.length} districts`);

  // -------------------------------------------------------------------------
  // Categories
  // -------------------------------------------------------------------------
  const categoryData = [
    {
      slug: 'baskets',
      nameEn: 'Baskets',
      nameBn: 'ঝুড়ি',
      descriptionEn: 'Hand-woven baskets for storage, laundry and display.',
      descriptionBn: 'ঘর গোছানো, কাপড় রাখা ও সাজানোর জন্য হাতে বোনা ঝুড়ি।',
      sortOrder: 1,
    },
    {
      slug: 'bags',
      nameEn: 'Bags',
      nameBn: 'ব্যাগ',
      descriptionEn: 'Handbags and shopping bags woven from natural fiber.',
      descriptionBn: 'প্রাকৃতিক তন্তু দিয়ে বোনা হাতব্যাগ ও বাজারের ব্যাগ।',
      sortOrder: 2,
    },
    {
      slug: 'home-decor',
      nameEn: 'Home Decor',
      nameBn: 'ঘর সাজানোর সামগ্রী',
      descriptionEn: 'Natural pieces that bring warmth to any room.',
      descriptionBn: 'ঘরে উষ্ণতা ছড়িয়ে দেওয়ার প্রাকৃতিক সামগ্রী।',
      sortOrder: 3,
    },
    {
      slug: 'mats-and-rugs',
      nameEn: 'Mats & Rugs',
      nameBn: 'মাদুর ও পাপোশ',
      descriptionEn: 'Durable floor mats woven in traditional patterns.',
      descriptionBn: 'ঐতিহ্যবাহী নকশায় বোনা টেকসই মেঝের মাদুর।',
      sortOrder: 4,
    },
    {
      slug: 'storage',
      nameEn: 'Storage',
      nameBn: 'জিনিস রাখার পাত্র',
      descriptionEn: 'Boxes, trays and containers to organise your home.',
      descriptionBn: 'ঘর গুছিয়ে রাখার বাক্স, ট্রে ও পাত্র।',
      sortOrder: 5,
    },
    {
      slug: 'gift-items',
      nameEn: 'Gift Items',
      nameBn: 'উপহার সামগ্রী',
      descriptionEn: 'Thoughtful handmade gifts for every occasion.',
      descriptionBn: 'যেকোনো উপলক্ষে দেওয়ার মতো হাতে তৈরি উপহার।',
      sortOrder: 6,
    },
  ];

  const categories: Record<string, string> = {};
  for (const cat of categoryData) {
    const created = await db.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categories[cat.slug] = created.id;
  }
  console.log(`  ✓ ${categoryData.length} categories`);

  // -------------------------------------------------------------------------
  // Products
  // -------------------------------------------------------------------------
  const productData = [
    {
      slug: 'banana-fiber-storage-basket',
      sku: 'BF-BSK-001',
      category: 'baskets',
      nameEn: 'Banana Fiber Storage Basket',
      nameBn: 'কলাগাছের তন্তুর স্টোরেজ ঝুড়ি',
      shortDescEn: 'A sturdy round basket for blankets, toys or laundry.',
      shortDescBn: 'কম্বল, খেলনা বা কাপড় রাখার মজবুত গোল ঝুড়ি।',
      descriptionEn:
        'Woven by hand from sun-dried banana fiber, this round basket holds its shape without a rigid frame. The natural fiber keeps its warm golden tone for years and the reinforced base takes the weight of folded blankets without sagging. A practical piece that looks at home in a living room or bedroom.',
      descriptionBn:
        'রোদে শুকানো কলাগাছের তন্তু দিয়ে হাতে বোনা এই গোল ঝুড়িটি শক্ত কাঠামো ছাড়াই নিজের আকৃতি ধরে রাখে। প্রাকৃতিক তন্তুর সোনালি রঙ বছরের পর বছর অটুট থাকে এবং মজবুত তলা ভাঁজ করা কম্বলের ভার সহজেই বহন করে। বসার ঘর বা শোবার ঘর—দুই জায়গাতেই মানিয়ে যায়।',
      materialsEn: '100% natural banana fiber, cotton-wrapped rim',
      materialsBn: '১০০% প্রাকৃতিক কলাগাছের তন্তু, সুতায় মোড়ানো কিনারা',
      careEn: 'Wipe with a dry cloth. Keep away from prolonged damp.',
      careBn: 'শুকনো কাপড় দিয়ে মুছুন। বেশিক্ষণ ভেজা জায়গায় রাখবেন না।',
      dimensionsEn: '35cm wide × 28cm tall',
      dimensionsBn: '৩৫ সেমি চওড়া × ২৮ সেমি উঁচু',
      weightGrams: 620,
      pricePoisha: taka(850),
      discountPoisha: 0,
      stock: 24,
      lowStockThreshold: 5,
      isFeatured: true,
    },
    {
      slug: 'woven-market-tote-bag',
      sku: 'BF-BAG-001',
      category: 'bags',
      nameEn: 'Woven Market Tote Bag',
      nameBn: 'বোনা বাজারের টোট ব্যাগ',
      shortDescEn: 'A roomy everyday bag that replaces plastic for good.',
      shortDescBn: 'প্রতিদিনের বাজারের জন্য বড় ব্যাগ, প্লাস্টিকের বিকল্প।',
      descriptionEn:
        'Deep enough for a full week of vegetables and strong enough to carry them home. The twin handles are double-stitched at the stress points, the part of a market bag that usually fails first. Folds flat when not in use.',
      descriptionBn:
        'পুরো সপ্তাহের সবজি ধরে এমন গভীর, আর সেই ভার বয়ে বাড়ি পৌঁছানোর মতো মজবুত। দুই হাতলের জোড়ের জায়গায় দুইবার সেলাই করা—বাজারের ব্যাগে সাধারণত এই জায়গাটিই আগে ছেঁড়ে। ব্যবহার না করলে ভাঁজ করে রাখা যায়।',
      materialsEn: 'Banana fiber with jute-blend handles',
      materialsBn: 'কলাগাছের তন্তু, পাট মেশানো হাতল',
      careEn: 'Spot clean with a damp cloth. Dry in shade.',
      careBn: 'ভেজা কাপড় দিয়ে দাগ পরিষ্কার করুন। ছায়ায় শুকান।',
      dimensionsEn: '40cm × 35cm × 15cm',
      dimensionsBn: '৪০ × ৩৫ × ১৫ সেমি',
      weightGrams: 380,
      pricePoisha: taka(650),
      discountPoisha: taka(100),
      stock: 42,
      lowStockThreshold: 8,
      isFeatured: true,
    },
    {
      slug: 'handwoven-floor-mat-large',
      sku: 'BF-MAT-001',
      category: 'mats-and-rugs',
      nameEn: 'Handwoven Floor Mat (Large)',
      nameBn: 'হাতে বোনা মেঝের মাদুর (বড়)',
      shortDescEn: 'A large mat woven in a traditional Jhenaidah pattern.',
      shortDescBn: 'ঝিনাইদহের ঐতিহ্যবাহী নকশায় বোনা বড় মাদুর।',
      descriptionEn:
        'Three weavers work about four days on a mat this size. The chevron pattern is counted by eye rather than marked out, so no two mats are identical. Comfortable underfoot and cool to sit on through the hot months.',
      descriptionBn:
        'এই আকারের একটি মাদুর বুনতে তিনজন কারিগরের প্রায় চার দিন সময় লাগে। নকশাটি মেপে আঁকা হয় না, চোখের আন্দাজে গোনা হয়—তাই দুটি মাদুর কখনো হুবহু এক হয় না। পায়ের নিচে আরামদায়ক আর গরমের দিনে বসার জন্য ঠান্ডা।',
      materialsEn: 'Banana fiber and dried water hyacinth',
      materialsBn: 'কলাগাছের তন্তু ও শুকনো কচুরিপানা',
      careEn: 'Shake out weekly. Air in sunlight once a month.',
      careBn: 'সপ্তাহে একবার ঝেড়ে নিন। মাসে একবার রোদে দিন।',
      dimensionsEn: '180cm × 120cm',
      dimensionsBn: '১৮০ × ১২০ সেমি',
      weightGrams: 2400,
      pricePoisha: taka(2200),
      discountPoisha: taka(300),
      stock: 7,
      lowStockThreshold: 3,
      isFeatured: true,
    },
    {
      slug: 'nested-storage-tray-set',
      sku: 'BF-STR-001',
      category: 'storage',
      nameEn: 'Nested Storage Tray Set (3 pieces)',
      nameBn: 'স্টোরেজ ট্রে সেট (৩ টি)',
      shortDescEn: 'Three graduated trays that stack inside one another.',
      shortDescBn: 'তিনটি আলাদা মাপের ট্রে, একটির ভিতরে আরেকটি রাখা যায়।',
      descriptionEn:
        'Useful on a dressing table, a kitchen shelf or a desk. The smallest holds keys and coins, the largest takes fruit or folded napkins. Each tray has a flat woven base so it does not rock when filled.',
      descriptionBn:
        'ড্রেসিং টেবিল, রান্নাঘরের তাক বা পড়ার টেবিল—সব জায়গাতেই কাজে লাগে। ছোটটিতে চাবি আর খুচরা পয়সা রাখা যায়, বড়টিতে ফল বা ভাঁজ করা রুমাল। প্রতিটি ট্রের তলা সমান করে বোনা, তাই ভরা অবস্থাতেও নড়ে না।',
      materialsEn: 'Banana fiber over a cane frame',
      materialsBn: 'বেতের কাঠামোর উপর কলাগাছের তন্তু',
      careEn: 'Dust with a soft brush. Do not soak in water.',
      careBn: 'নরম ব্রাশ দিয়ে ধুলো ঝাড়ুন। পানিতে ভেজাবেন না।',
      dimensionsEn: '30cm, 24cm and 18cm diameter',
      dimensionsBn: '৩০, ২৪ ও ১৮ সেমি ব্যাস',
      weightGrams: 540,
      pricePoisha: taka(1150),
      discountPoisha: 0,
      stock: 16,
      lowStockThreshold: 5,
      isFeatured: false,
    },
    {
      slug: 'banana-fiber-table-runner',
      sku: 'BF-DEC-001',
      category: 'home-decor',
      nameEn: 'Banana Fiber Table Runner',
      nameBn: 'কলাগাছের তন্তুর টেবিল রানার',
      shortDescEn: 'A natural runner that dresses a table without hiding it.',
      shortDescBn: 'টেবিল ঢেকে না রেখেই সাজিয়ে তোলে এমন প্রাকৃতিক রানার।',
      descriptionEn:
        'Loosely woven so the grain of the table shows through. The fringed ends are hand-knotted one strand at a time. Sits flat straight out of the packet — no pressing needed.',
      descriptionBn:
        'হালকা বুননের কারণে টেবিলের কাঠের নকশা ফুটে ওঠে। দুই প্রান্তের ঝালর এক একটি সুতা ধরে হাতে গিঁট দেওয়া। প্যাকেট থেকে বের করেই সমানভাবে বিছানো যায়, ইস্ত্রি করার দরকার নেই।',
      materialsEn: 'Fine-spun banana fiber',
      materialsBn: 'মিহি করে কাটা কলাগাছের তন্তু',
      careEn: 'Hand wash in cool water. Dry flat in shade.',
      careBn: 'ঠান্ডা পানিতে হাতে ধুয়ে নিন। ছায়ায় সমতলে শুকান।',
      dimensionsEn: '150cm × 33cm',
      dimensionsBn: '১৫০ × ৩৩ সেমি',
      weightGrams: 210,
      pricePoisha: taka(720),
      discountPoisha: 0,
      // Low stock: exercises the "Only a few left" badge and the admin alert.
      stock: 3,
      lowStockThreshold: 6,
      isFeatured: false,
    },
    {
      slug: 'round-fruit-bowl-basket',
      sku: 'BF-BSK-002',
      category: 'baskets',
      nameEn: 'Round Fruit Bowl Basket',
      nameBn: 'গোল ফলের ঝুড়ি',
      shortDescEn: 'A shallow bowl that keeps fruit aired and visible.',
      shortDescBn: 'ফল হাওয়া পায় ও চোখে পড়ে এমন অগভীর ঝুড়ি।',
      descriptionEn:
        'The open weave lets air move around the fruit, which keeps it fresh noticeably longer than a closed bowl. Light enough to lift with one hand when full.',
      descriptionBn:
        'ফাঁকা বুননের মধ্য দিয়ে বাতাস চলাচল করায় ফল বন্ধ পাত্রের তুলনায় অনেক বেশি সময় তাজা থাকে। ভরা অবস্থাতেও এক হাতে তোলা যায় এমন হালকা।',
      materialsEn: '100% banana fiber',
      materialsBn: '১০০% কলাগাছের তন্তু',
      careEn: 'Wipe clean. Keep dry.',
      careBn: 'মুছে পরিষ্কার করুন। শুকনো রাখুন।',
      dimensionsEn: '28cm wide × 9cm tall',
      dimensionsBn: '২৮ সেমি চওড়া × ৯ সেমি উঁচু',
      weightGrams: 180,
      pricePoisha: taka(480),
      discountPoisha: 0,
      // Out of stock: exercises the disabled Add to Cart path.
      stock: 0,
      lowStockThreshold: 5,
      isFeatured: false,
    },
    {
      slug: 'artisan-gift-hamper-basket',
      sku: 'BF-GFT-001',
      category: 'gift-items',
      nameEn: 'Artisan Gift Hamper Basket',
      nameBn: 'উপহারের ঝুড়ি',
      shortDescEn: 'A lidded hamper that becomes part of the gift.',
      shortDescBn: 'ঢাকনাসহ ঝুড়ি, যা উপহারেরই একটি অংশ হয়ে ওঠে।',
      descriptionEn:
        'Sized for sweets, dried fruit or a set of smaller gifts, with a fitted lid and a loop closure. Sturdy enough to be reused for storage long after the occasion.',
      descriptionBn:
        'মিষ্টি, শুকনো ফল বা ছোট ছোট উপহার রাখার উপযোগী মাপ, সাথে মানানসই ঢাকনা ও ফিতার বাঁধন। উপলক্ষ শেষ হওয়ার পরেও জিনিস রাখার কাজে বহুদিন ব্যবহার করা যায়।',
      materialsEn: 'Banana fiber with cotton tie',
      materialsBn: 'কলাগাছের তন্তু, সুতির ফিতা',
      careEn: 'Wipe with a dry cloth.',
      careBn: 'শুকনো কাপড় দিয়ে মুছুন।',
      dimensionsEn: '32cm × 24cm × 16cm',
      dimensionsBn: '৩২ × ২৪ × ১৬ সেমি',
      weightGrams: 460,
      pricePoisha: taka(1450),
      discountPoisha: taka(200),
      stock: 11,
      lowStockThreshold: 4,
      isFeatured: true,
    },
    {
      slug: 'small-shoulder-bag',
      sku: 'BF-BAG-002',
      category: 'bags',
      nameEn: 'Small Shoulder Bag',
      nameBn: 'ছোট কাঁধব্যাগ',
      shortDescEn: 'A compact bag for a phone, purse and keys.',
      shortDescBn: 'ফোন, মানিব্যাগ ও চাবি রাখার ছোট ব্যাগ।',
      descriptionEn:
        'An adjustable strap and a cotton-lined interior so nothing catches on the weave. Closes with a wooden button toggle.',
      descriptionBn:
        'ফিতার দৈর্ঘ্য বদলানো যায় এবং ভিতরে সুতির আস্তরণ দেওয়া, তাই বুননে কিছু আটকে যায় না। কাঠের বোতাম দিয়ে বন্ধ হয়।',
      materialsEn: 'Banana fiber, cotton lining, wooden toggle',
      materialsBn: 'কলাগাছের তন্তু, সুতির আস্তরণ, কাঠের বোতাম',
      careEn: 'Spot clean only.',
      careBn: 'শুধু দাগের জায়গা পরিষ্কার করুন।',
      dimensionsEn: '24cm × 18cm × 8cm',
      dimensionsBn: '২৪ × ১৮ × ৮ সেমি',
      weightGrams: 240,
      pricePoisha: taka(890),
      discountPoisha: 0,
      stock: 19,
      lowStockThreshold: 5,
      isFeatured: false,
    },
    {
      slug: 'woven-plant-pot-cover',
      sku: 'BF-DEC-002',
      category: 'home-decor',
      nameEn: 'Woven Plant Pot Cover',
      nameBn: 'গাছের টবের বোনা কভার',
      shortDescEn: 'Hides a plastic nursery pot without repotting.',
      shortDescBn: 'গাছ না সরিয়েই প্লাস্টিকের টব ঢেকে রাখে।',
      descriptionEn:
        'Slips over a standard nursery pot so a plant can be brought indoors without repotting it. Water-resistant inner lining protects the floor.',
      descriptionBn:
        'সাধারণ নার্সারির টবের উপর সহজে পরিয়ে দেওয়া যায়, তাই গাছ না সরিয়েই ঘরে আনা যায়। ভিতরের পানিরোধী আস্তরণ মেঝে রক্ষা করে।',
      materialsEn: 'Banana fiber with waterproof lining',
      materialsBn: 'কলাগাছের তন্তু, পানিরোধী আস্তরণ',
      careEn: 'Empty and dry if water collects inside.',
      careBn: 'ভিতরে পানি জমলে ফেলে দিয়ে শুকিয়ে নিন।',
      dimensionsEn: 'Fits pots up to 20cm diameter',
      dimensionsBn: '২০ সেমি ব্যাস পর্যন্ত টবে লাগে',
      weightGrams: 260,
      pricePoisha: taka(560),
      discountPoisha: 0,
      stock: 28,
      lowStockThreshold: 6,
      isFeatured: false,
    },
    {
      slug: 'laundry-hamper-with-lid',
      sku: 'BF-STR-002',
      category: 'storage',
      nameEn: 'Laundry Hamper with Lid',
      nameBn: 'ঢাকনাসহ কাপড় রাখার ঝুড়ি',
      shortDescEn: 'A tall hamper that holds a full family wash.',
      shortDescBn: 'পুরো পরিবারের কাপড় ধরে এমন লম্বা ঝুড়ি।',
      descriptionEn:
        'Tall and wide-mouthed so clothes go in easily, with a lid that sits flush. The breathable weave stops damp laundry from turning musty.',
      descriptionBn:
        'লম্বা ও চওড়া মুখ, তাই কাপড় রাখতে সুবিধা; ঢাকনাটি সমানভাবে বসে। বাতাস চলাচলের বুননের কারণে ভেজা কাপড়ে গন্ধ হয় না।',
      materialsEn: 'Banana fiber over a bamboo frame',
      materialsBn: 'বাঁশের কাঠামোর উপর কলাগাছের তন্তু',
      careEn: 'Air regularly. Wipe the frame with a dry cloth.',
      careBn: 'নিয়মিত বাতাসে রাখুন। কাঠামো শুকনো কাপড়ে মুছুন।',
      dimensionsEn: '40cm wide × 60cm tall',
      dimensionsBn: '৪০ সেমি চওড়া × ৬০ সেমি উঁচু',
      weightGrams: 1850,
      pricePoisha: taka(1850),
      discountPoisha: 0,
      stock: 9,
      lowStockThreshold: 4,
      isFeatured: false,
    },
    {
      slug: 'coaster-set-of-six',
      sku: 'BF-GFT-002',
      category: 'gift-items',
      nameEn: 'Coaster Set of Six',
      nameBn: 'কোস্টার সেট (৬ টি)',
      shortDescEn: 'Six thick woven coasters with a holder.',
      shortDescBn: 'ছয়টি পুরু বোনা কোস্টার, সাথে রাখার পাত্র।',
      descriptionEn:
        'Thick enough to take a hot cup without marking the table underneath. Comes with a small matching stand so the set stays together.',
      descriptionBn:
        'যথেষ্ট পুরু, তাই গরম কাপ রাখলেও নিচের টেবিলে দাগ পড়ে না। সাথে মানানসই ছোট স্ট্যান্ড, যাতে পুরো সেট একসাথে থাকে।',
      materialsEn: 'Tightly coiled banana fiber',
      materialsBn: 'শক্ত করে পাকানো কলাগাছের তন্তু',
      careEn: 'Wipe spills immediately with a dry cloth.',
      careBn: 'কিছু পড়লে সাথে সাথে শুকনো কাপড়ে মুছে ফেলুন।',
      dimensionsEn: '10cm diameter each',
      dimensionsBn: 'প্রতিটি ১০ সেমি ব্যাস',
      weightGrams: 300,
      pricePoisha: taka(420),
      discountPoisha: 0,
      stock: 35,
      lowStockThreshold: 10,
      isFeatured: false,
    },
    {
      slug: 'rectangular-shelf-basket',
      sku: 'BF-BSK-003',
      category: 'baskets',
      nameEn: 'Rectangular Shelf Basket',
      nameBn: 'তাকের চারকোনা ঝুড়ি',
      shortDescEn: 'Sized to fit standard shelving units.',
      shortDescBn: 'সাধারণ তাকের মাপে তৈরি।',
      descriptionEn:
        'Made to the dimensions of common shelf units so it slides in without a gap. Cut-out handles on both ends make a full basket easy to pull down.',
      descriptionBn:
        'প্রচলিত তাকের মাপ অনুযায়ী তৈরি, তাই ফাঁক না রেখেই বসে যায়। দুই পাশে কাটা হাতল থাকায় ভরা ঝুড়ি নামানো সহজ।',
      materialsEn: '100% banana fiber',
      materialsBn: '১০০% কলাগাছের তন্তু',
      careEn: 'Wipe with a dry cloth.',
      careBn: 'শুকনো কাপড় দিয়ে মুছুন।',
      dimensionsEn: '33cm × 25cm × 20cm',
      dimensionsBn: '৩৩ × ২৫ × ২০ সেমি',
      weightGrams: 490,
      pricePoisha: taka(680),
      discountPoisha: 0,
      // Inactive: hidden from the storefront, visible in admin. Proves that
      // listing queries filter on isActive from Sprint 3 onward.
      stock: 14,
      lowStockThreshold: 5,
      isFeatured: false,
      isActive: false,
    },
  ];

  let productCount = 0;
  let photographed = 0;
  for (const p of productData) {
    const { category, isActive, ...fields } = p;
    const product = await db.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: {
        ...fields,
        isActive: isActive ?? true,
        categoryId: categories[category]!,
      },
    });

    // The product's primary image: its own photograph where one exists, the
    // placeholder illustration otherwise.
    //
    // Idempotent by rewriting the existing row in place rather than inserting,
    // so re-running the seed can never add a second image to a product. The
    // previous version skipped products that already had an image, which meant
    // it could create artwork but never correct it — real photography would
    // never have reached a database seeded before it arrived.
    const photograph = PHOTOGRAPHY_BY_SKU[product.sku];
    if (photograph) photographed++;
    const primaryImage = {
      url: photograph?.url ?? placeholderFor(product.sku),
      altEn: photograph?.altEn ?? product.nameEn,
      altBn: photograph?.altBn ?? product.nameBn,
    };

    const existingImage = await db.productImage.findFirst({
      where: { productId: product.id },
      orderBy: { sortOrder: 'asc' },
    });

    if (!existingImage) {
      await db.productImage.create({
        data: { productId: product.id, ...primaryImage, sortOrder: 0 },
      });
    } else if (isSeedManaged(existingImage.url)) {
      await db.productImage.update({
        where: { id: existingImage.id },
        data: primaryImage,
      });
    }

    // Opening stock balance — the first row of the append-only audit trail.
    const existingMovements = await db.stockMovement.count({
      where: { productId: product.id },
    });
    if (existingMovements === 0 && product.stock > 0) {
      await db.stockMovement.create({
        data: {
          productId: product.id,
          delta: product.stock,
          reason: 'INITIAL',
          resultingStock: product.stock,
          note: 'Opening stock recorded when the product was added',
        },
      });
    }
    productCount++;
  }
  console.log(`  ✓ ${productCount} products (1 low stock, 1 out of stock, 1 inactive)`);
  console.log(
    `  ✓ primary image on each product (${photographed} photograph${
      photographed === 1 ? '' : 's'
    }, ${productCount - photographed} placeholder)`,
  );

  // -------------------------------------------------------------------------
  // Settings
  // -------------------------------------------------------------------------
  const settings: Array<{ key: string; value: unknown }> = [
    { key: 'shop.nameEn', value: 'Banana Fiber' },
    { key: 'shop.nameBn', value: 'কলাগাছের তন্তু' },
    { key: 'shop.phone', value: '01712345678' },
    { key: 'shop.email', value: 'hello@bananafiber.com.bd' },
    { key: 'shop.addressEn', value: 'Jhenaidah, Khulna Division, Bangladesh' },
    { key: 'shop.addressBn', value: 'ঝিনাইদহ, খুলনা বিভাগ, বাংলাদেশ' },
    { key: 'shop.facebook', value: 'https://facebook.com/' },
    { key: 'shop.instagram', value: 'https://instagram.com/' },
    { key: 'order.lowStockAlertEnabled', value: true },
  ];

  for (const s of settings) {
    await db.setting.upsert({
      where: { key: s.key },
      update: {},
      create: { key: s.key, value: s.value as never },
    });
  }
  console.log(`  ✓ ${settings.length} settings`);

  console.log('\nSeed complete.\n');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
