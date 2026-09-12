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
 * PRODUCT PHOTOGRAPHY, keyed by SKU. First entry is the primary image; any
 * that follow become the rest of the gallery, in order.
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
 * Every entry here now photographs its own product against a clean or styled
 * background. The shop-floor and workshop shots that stood in earlier were
 * withdrawn: they showed stacked inventory with price tags rather than the
 * item for sale, and two of them carried another business's labels. A product
 * that has no photograph of its own shows placeholder artwork instead, which
 * at least reads as a drawing rather than as a misleading photograph.
 *
 * The one deliberate exception is the wall plate set, whose second and third
 * images are room shots showing the pieces hung together. Their alt text says
 * so.
 */
const PHOTOGRAPHY_BY_SKU: Record<string, Photograph[]> = {
  // --- Baskets ------------------------------------------------------------
  'BF-BSK-001': [
    {
      url: '/images/products/banana-fiber-storage-basket.jpg',
      altEn:
        'Round coiled storage basket with a fitted lid, cream fiber banded in red and blue',
      altBn:
        'ঢাকনাসহ গোল পাকানো স্টোরেজ ঝুড়ি, ক্রিম রঙের তন্তুতে লাল ও নীল নকশা',
    },
  ],

  // --- Bags ---------------------------------------------------------------
  'BF-BAG-001': [
    {
      url: '/images/products/woven-market-tote-bag.jpg',
      altEn:
        'Rectangular handwoven market tote bag in natural straw, with two braided carrying handles',
      altBn:
        'প্রাকৃতিক রঙের হাতে বোনা চারকোনা বাজারের টোট ব্যাগ, দুটি বিনুনি করা হাতলসহ',
    },
  ],
  'BF-BAG-002': [
    {
      url: '/images/products/small-shoulder-bag.jpg',
      altEn:
        'Small woven handbag held by its braided handles, embroidered with pink, white and purple flowers',
      altBn:
        'বিনুনি হাতল ধরে তোলা ছোট বোনা হাতব্যাগ, গোলাপি, সাদা ও বেগুনি ফুলের সূচিকর্মসহ',
    },
  ],
  'BF-BAG-003': [
    {
      url: '/images/products/wildflower-embroidered-tote.jpg',
      altEn:
        'Woven straw tote bag covered in hand-embroidered wildflowers, standing on a wooden stool',
      altBn:
        'কাঠের টুলের উপর রাখা বোনা খড়ের টোট ব্যাগ, সারা গায়ে হাতে করা বুনো ফুলের সূচিকর্ম',
    },
  ],
  'BF-BAG-004': [
    {
      url: '/images/products/daisy-embroidered-beach-basket.jpg',
      altEn:
        'Fan-shaped woven basket bag with leather handles and a row of embroidered lilac daisies',
      altBn:
        'চামড়ার হাতলসহ পাখার আকৃতির বোনা ঝুড়ি-ব্যাগ, সামনে সারিবদ্ধ হালকা বেগুনি ডেইজি ফুলের সূচিকর্ম',
    },
  ],
  'BF-BAG-005': [
    {
      url: '/images/products/hibiscus-embroidered-shopper.jpg',
      altEn:
        'Flat-bottomed woven shopper basket with a bright pink lining and a large embroidered hibiscus',
      altBn:
        'সমতল তলার বোনা শপিং ঝুড়ি, ভিতরে উজ্জ্বল গোলাপি আস্তরণ ও বাইরে বড় জবা ফুলের সূচিকর্ম',
    },
  ],
  'BF-BAG-006': [
    {
      url: '/images/products/crescent-ring-handle-bag.jpg',
      altEn:
        'Four crescent-shaped woven bags with round wooden handles, each embroidered with a different flower spray',
      altBn:
        'গোল কাঠের হাতলসহ চারটি অর্ধচন্দ্রাকৃতি বোনা ব্যাগ, প্রতিটিতে আলাদা ফুলের সূচিকর্ম',
    },
  ],
  'BF-BAG-007': [
    {
      url: '/images/products/blossom-bucket-basket-bag.jpg',
      altEn:
        'Round woven bucket bag with a pink braided handle, a cotton lining and a band of embroidered flowers',
      altBn:
        'গোলাপি বিনুনি হাতলসহ গোল বোনা বালতি-ব্যাগ, ভিতরে সুতির আস্তরণ ও চারদিকে ফুলের সূচিকর্মের পাড়',
    },
  ],
  'BF-BAG-008': [
    {
      url: '/images/products/pink-daisy-beach-tote.jpg',
      altEn:
        'A woman carrying a large woven beach tote embroidered with pink daisies over her shoulder',
      altBn:
        'কাঁধে বড় বোনা সৈকত টোট ব্যাগ নিয়ে হাঁটছেন একজন নারী, ব্যাগে গোলাপি ডেইজি ফুলের সূচিকর্ম',
    },
  ],

  // --- Storage ------------------------------------------------------------
  'BF-STR-001': [
    {
      url: '/images/products/nested-storage-tray-set-lidded.jpg',
      altEn:
        'Three round lidded storage boxes in three sizes, each lid finished with a woven loop and coloured strands',
      altBn:
        'তিন মাপের তিনটি গোল ঢাকনাওয়ালা স্টোরেজ বাক্স, প্রতিটি ঢাকনায় বোনা আংটা ও রঙিন তন্তু',
    },
    {
      url: '/images/products/nested-storage-tray-set.jpg',
      altEn:
        'The same set shown open, the rope-coiled trays stacked one inside the other',
      altBn:
        'একই সেট খোলা অবস্থায়, পাকানো দড়ির ট্রেগুলো একটির ভিতরে আরেকটি সাজানো',
    },
  ],
  'BF-STR-002': [
    {
      url: '/images/products/laundry-hamper-with-lid.jpg',
      altEn:
        'Tall coiled laundry hamper with a fitted lid and a row of fiber tassels around its widest point',
      altBn:
        'ঢাকনাসহ লম্বা পাকানো কাপড়ের ঝুড়ি, সবচেয়ে চওড়া জায়গায় সারিবদ্ধ তন্তুর ঝালর',
    },
  ],
  'BF-STR-003': [
    {
      url: '/images/products/diamond-pattern-lidded-basket.jpg',
      altEn:
        'Coiled lidded basket in tan, cream and grey, worked in a diamond pattern, with a woven knob on the lid',
      altBn:
        'বাদামি, ক্রিম ও ধূসর রঙের পাকানো ঢাকনাওয়ালা ঝুড়ি, হীরক নকশা ও ঢাকনায় বোনা হাতল',
    },
  ],

  // --- Home decor ---------------------------------------------------------
  'BF-DEC-003': [
    {
      url: '/images/products/embroidered-round-serving-tray.jpg',
      altEn:
        'Round woven serving tray with a raised rim bound in yellow, embroidered with a yellow mimosa sprig',
      altBn:
        'হলুদ পাড় বাঁধানো উঁচু কিনারার গোল বোনা পরিবেশন ট্রে, হলুদ ফুলের ডাল সূচিকর্ম করা',
    },
  ],
  'BF-DEC-004': [
    {
      url: '/images/products/woven-wall-plate-set.jpg',
      altEn:
        'Five round woven wall plates laid on white cloth, each worked with a different plant and sun motif',
      altBn:
        'সাদা কাপড়ের উপর পাঁচটি গোল বোনা দেয়াল-থালা, প্রতিটিতে আলাদা গাছ ও সূর্যের নকশা',
    },
    {
      url: '/images/products/woven-wall-plate-set-styled.jpg',
      altEn:
        'Room view: a cluster of patterned woven wall plates hung together above a sofa',
      altBn:
        'ঘরের দৃশ্য: সোফার উপরে একসাথে ঝোলানো নকশাদার বোনা দেয়াল-থালার সমাহার',
    },
    {
      url: '/images/products/woven-wall-basket-display.jpg',
      altEn:
        'Room view: woven wall plates and shallow baskets arranged around a rope-framed mirror',
      altBn:
        'ঘরের দৃশ্য: দড়ির ফ্রেমের আয়নাকে ঘিরে সাজানো বোনা দেয়াল-থালা ও অগভীর ঝুড়ি',
    },
  ],
  'BF-DEC-005': [
    {
      url: '/images/products/embroidered-bread-basket.jpg',
      altEn:
        'Rectangular woven bread basket with a cotton liner and red and blue flowers embroidered along the rim',
      altBn:
        'সুতির আস্তরণসহ চারকোনা বোনা রুটির ঝুড়ি, কিনারা জুড়ে লাল ও নীল ফুলের সূচিকর্ম',
    },
  ],

  // --- Gift items ---------------------------------------------------------
  'BF-GFT-001': [
    {
      url: '/images/products/artisan-gift-hamper-basket.jpg',
      altEn:
        'Handwoven gift hamper basket with a fitted lid and two arched carrying handles, in teal and natural cream stripes',
      altBn:
        'ঢাকনা ও দুটি বাঁকানো হাতলসহ হাতে বোনা উপহারের ঝুড়ি, সবুজাভ নীল ও প্রাকৃতিক রঙের ডোরাকাটা নকশা',
    },
  ],
  'BF-GFT-002': [
    {
      url: '/images/products/coaster-set-of-six.jpg',
      altEn:
        'Two round coiled coasters edged with cowrie shells and a fringe of natural fiber',
      altBn:
        'কড়ি ও প্রাকৃতিক তন্তুর ঝালর দিয়ে ঘেরা দুটি গোল পাকানো কোস্টার',
    },
  ],
  'BF-GFT-003': [
    {
      url: '/images/products/round-lidded-keepsake-box.jpg',
      altEn:
        'Round lidded keepsake box in pale fiber, the lid worked in a coloured starburst and the sides in small diamonds',
      altBn:
        'ফ্যাকাশে তন্তুর গোল ঢাকনাওয়ালা স্মৃতি-বাক্স, ঢাকনায় রঙিন তারার নকশা ও পাশে ছোট হীরক নকশা',
    },
  ],
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
      shortDescEn: 'A large mat woven in a traditional Mymensingh pattern.',
      shortDescBn: 'ময়মনসিংহের ঐতিহ্যবাহী নকশায় বোনা বড় মাদুর।',
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
    // -------------------------------------------------------------------
    // Products added once their own photography arrived.
    // -------------------------------------------------------------------
    {
      slug: 'wildflower-embroidered-tote',
      sku: 'BF-BAG-003',
      category: 'bags',
      nameEn: 'Wildflower Embroidered Tote',
      nameBn: 'বুনো ফুলের সূচিকর্মের টোট ব্যাগ',
      shortDescEn: 'A roomy market tote embroidered with a meadow of flowers.',
      shortDescBn: 'ফুলে ভরা মাঠের সূচিকর্ম করা প্রশস্ত বাজারের ব্যাগ।',
      descriptionEn:
        'Every flower on this bag is stitched by hand, one at a time, so no two bags carry quite the same meadow. The body is woven tightly enough to hold a full week of vegetables, and the twisted rope handles are bound where they meet the bag — the point that gives way first on a cheaper bag.',
      descriptionBn:
        'এই ব্যাগের প্রতিটি ফুল একটি একটি করে হাতে সেলাই করা, তাই দুটি ব্যাগের নকশা কখনো হুবহু এক হয় না। বুনন এতটাই ঘন যে পুরো সপ্তাহের বাজার অনায়াসে ধরে, আর পাকানো দড়ির হাতল ব্যাগের সাথে জোড়ার জায়গায় শক্ত করে বাঁধা — সস্তা ব্যাগে এই জায়গাটিই আগে ছেঁড়ে।',
      materialsEn: 'Woven natural fiber, cotton embroidery thread, rope handles',
      materialsBn: 'বোনা প্রাকৃতিক তন্তু, সুতির সূচিকর্মের সুতা, দড়ির হাতল',
      careEn: 'Spot clean with a damp cloth. Do not soak the embroidery.',
      careBn: 'ভেজা কাপড়ে দাগের জায়গা মুছুন। সূচিকর্ম ভেজাবেন না।',
      dimensionsEn: '38cm wide × 30cm tall, 13cm base',
      dimensionsBn: '৩৮ সেমি চওড়া × ৩০ সেমি উঁচু, তলা ১৩ সেমি',
      weightGrams: 420,
      pricePoisha: taka(1250),
      discountPoisha: 0,
      stock: 18,
      lowStockThreshold: 5,
      isFeatured: true,
    },
    {
      slug: 'daisy-embroidered-beach-basket',
      sku: 'BF-BAG-004',
      category: 'bags',
      nameEn: 'Daisy Embroidered Basket Bag',
      nameBn: 'ডেইজি ফুলের সূচিকর্মের ঝুড়ি-ব্যাগ',
      shortDescEn: 'Fan-shaped basket bag with leather handles.',
      shortDescBn: 'চামড়ার হাতলসহ পাখার আকৃতির ঝুড়ি-ব্যাগ।',
      descriptionEn:
        'The fan shape opens wide at the top, so you can see everything inside without digging. Real leather handles are riveted through the weave rather than stitched to it, which is why they stay put under weight.',
      descriptionBn:
        'পাখার আকৃতির কারণে উপরের দিক চওড়া, তাই ভিতরের সবকিছু হাতড়ানো ছাড়াই চোখে পড়ে। আসল চামড়ার হাতল বুননের ভিতর দিয়ে রিভেট করা — সেলাই করা নয় — তাই ভার নিলেও আলগা হয় না।',
      materialsEn: 'Palm-leaf weave, cotton embroidery, vegetable-tanned leather handles',
      materialsBn: 'তালপাতার বুনন, সুতির সূচিকর্ম, প্রাকৃতিকভাবে পাকা চামড়ার হাতল',
      careEn: 'Keep dry. Wipe the leather with a soft dry cloth.',
      careBn: 'শুকনো রাখুন। চামড়ার অংশ নরম শুকনো কাপড়ে মুছুন।',
      dimensionsEn: '42cm across the top × 28cm tall',
      dimensionsBn: 'উপরে ৪২ সেমি চওড়া × ২৮ সেমি উঁচু',
      weightGrams: 390,
      pricePoisha: taka(1150),
      discountPoisha: taka(150),
      stock: 12,
      lowStockThreshold: 4,
      isFeatured: true,
    },
    {
      slug: 'hibiscus-embroidered-shopper',
      sku: 'BF-BAG-005',
      category: 'bags',
      nameEn: 'Hibiscus Embroidered Shopper',
      nameBn: 'জবা ফুলের সূচিকর্মের শপিং ব্যাগ',
      shortDescEn: 'Flat-bottomed shopper with a bright lining.',
      shortDescBn: 'সমতল তলার শপিং ব্যাগ, ভিতরে উজ্জ্বল আস্তরণ।',
      descriptionEn:
        'The flat base means it stands up on its own on the floor of a rickshaw or beside the counter, instead of tipping and spilling. Lined throughout in cotton so nothing small slips through the weave.',
      descriptionBn:
        'সমতল তলার কারণে রিকশার মেঝেতে বা দোকানের পাশে নিজে নিজেই দাঁড়িয়ে থাকে, কাত হয়ে পড়ে যায় না। ভিতরটা পুরো সুতি কাপড়ে মোড়া, তাই ছোট জিনিস বুননের ফাঁক দিয়ে পড়ে না।',
      materialsEn: 'Seagrass weave, cotton lining, raffia embroidery',
      materialsBn: 'সিগ্রাসের বুনন, সুতির আস্তরণ, রাফিয়ার সূচিকর্ম',
      careEn: 'Wipe with a dry cloth. Air out after carrying anything damp.',
      careBn: 'শুকনো কাপড়ে মুছুন। ভেজা জিনিস বহনের পর বাতাসে শুকিয়ে নিন।',
      dimensionsEn: '40cm × 26cm × 14cm',
      dimensionsBn: '৪০ × ২৬ × ১৪ সেমি',
      weightGrams: 450,
      pricePoisha: taka(1380),
      discountPoisha: 0,
      stock: 15,
      lowStockThreshold: 5,
      isFeatured: false,
    },
    {
      slug: 'crescent-ring-handle-bag',
      sku: 'BF-BAG-006',
      category: 'bags',
      nameEn: 'Crescent Ring Handle Bag',
      nameBn: 'গোল হাতলের অর্ধচন্দ্র ব্যাগ',
      shortDescEn: 'Half-moon bag with round wooden handles.',
      shortDescBn: 'গোল কাঠের হাতলসহ অর্ধচন্দ্রাকৃতি ব্যাগ।',
      descriptionEn:
        'Small enough to carry to a wedding, deep enough for a phone, a purse and a folded shawl. The embroidered spray on the front is different on every bag; tell us in the order notes if you would like a particular colour and we will send the closest we have.',
      descriptionBn:
        'বিয়েবাড়িতে নেওয়ার মতো ছোট, আবার ফোন, মানিব্যাগ ও ভাঁজ করা ওড়না ধরার মতো গভীর। সামনের ফুলের সূচিকর্ম প্রতিটি ব্যাগে আলাদা; নির্দিষ্ট কোনো রঙ চাইলে অর্ডারের নোটে লিখে দিন, আমরা কাছাকাছিটাই পাঠাব।',
      materialsEn: 'Kaisa grass weave, cotton embroidery, polished wooden ring handles',
      materialsBn: 'কাইশা ঘাসের বুনন, সুতির সূচিকর্ম, মসৃণ কাঠের গোল হাতল',
      careEn: 'Wipe with a dry cloth. Store flat so the crescent keeps its shape.',
      careBn: 'শুকনো কাপড়ে মুছুন। আকৃতি ঠিক রাখতে সমতলভাবে রাখুন।',
      dimensionsEn: '30cm wide × 22cm tall',
      dimensionsBn: '৩০ সেমি চওড়া × ২২ সেমি উঁচু',
      weightGrams: 280,
      pricePoisha: taka(980),
      discountPoisha: 0,
      stock: 22,
      lowStockThreshold: 6,
      isFeatured: false,
    },
    {
      slug: 'blossom-bucket-basket-bag',
      sku: 'BF-BAG-007',
      category: 'bags',
      nameEn: 'Blossom Bucket Basket Bag',
      nameBn: 'ফুলেল বালতি ঝুড়ি-ব্যাগ',
      shortDescEn: 'Round lined bag with a braided pink handle.',
      shortDescBn: 'গোলাপি বিনুনি হাতলসহ গোল আস্তরণযুক্ত ব্যাগ।',
      descriptionEn:
        'A round bag that holds its shape whether it is full or empty. The printed cotton lining is stitched in, not glued, so it can be unpicked and washed if it ever needs to be.',
      descriptionBn:
        'ভরা হোক বা খালি, এই গোল ব্যাগটি নিজের আকৃতি ধরে রাখে। ছাপা সুতির আস্তরণ সেলাই করা, আঠা দিয়ে লাগানো নয় — তাই প্রয়োজনে খুলে ধুয়ে নেওয়া যায়।',
      materialsEn: 'Palm-leaf weave, printed cotton lining, braided handle',
      materialsBn: 'তালপাতার বুনন, ছাপা সুতির আস্তরণ, বিনুনি হাতল',
      careEn: 'Spot clean only. Do not machine wash.',
      careBn: 'শুধু দাগের জায়গা পরিষ্কার করুন। মেশিনে ধোবেন না।',
      dimensionsEn: '26cm diameter × 24cm tall',
      dimensionsBn: '২৬ সেমি ব্যাস × ২৪ সেমি উঁচু',
      weightGrams: 260,
      pricePoisha: taka(860),
      discountPoisha: 0,
      stock: 26,
      lowStockThreshold: 6,
      isFeatured: false,
    },
    {
      slug: 'pink-daisy-beach-tote',
      sku: 'BF-BAG-008',
      category: 'bags',
      nameEn: 'Pink Daisy Shoulder Tote',
      nameBn: 'গোলাপি ডেইজি কাঁধ-টোট',
      shortDescEn: 'Large shoulder tote for a full day out.',
      shortDescBn: 'সারাদিনের বাইরের জন্য বড় কাঁধ-ব্যাগ।',
      descriptionEn:
        'The handles are cut long on purpose, so the bag sits on the shoulder and leaves both hands free. It is the largest bag we make; a change of clothes, a water bottle and a towel all go in together.',
      descriptionBn:
        'হাতল ইচ্ছে করেই লম্বা রাখা, যাতে ব্যাগটি কাঁধে বসে এবং দুই হাত খালি থাকে। এটিই আমাদের সবচেয়ে বড় ব্যাগ; এক সেট কাপড়, পানির বোতল আর তোয়ালে একসাথে ধরে যায়।',
      materialsEn: 'Palm-leaf weave, cotton embroidery, leather shoulder straps',
      materialsBn: 'তালপাতার বুনন, সুতির সূচিকর্ম, চামড়ার কাঁধের ফিতা',
      careEn: 'Shake out sand and dust. Keep out of prolonged direct sun.',
      careBn: 'বালি ও ধুলো ঝেড়ে ফেলুন। দীর্ঘক্ষণ কড়া রোদে রাখবেন না।',
      dimensionsEn: '48cm wide × 34cm tall',
      dimensionsBn: '৪৮ সেমি চওড়া × ৩৪ সেমি উঁচু',
      weightGrams: 520,
      pricePoisha: taka(1320),
      discountPoisha: 0,
      stock: 9,
      lowStockThreshold: 4,
      isFeatured: false,
    },
    {
      slug: 'diamond-pattern-lidded-basket',
      sku: 'BF-STR-003',
      category: 'storage',
      nameEn: 'Diamond Pattern Lidded Basket',
      nameBn: 'হীরক নকশার ঢাকনাওয়ালা ঝুড়ি',
      shortDescEn: 'Coiled basket with a close-fitting lid.',
      shortDescBn: 'ঠিকঠাক বসে যাওয়া ঢাকনাসহ পাকানো ঝুড়ি।',
      descriptionEn:
        'The lid sits inside the rim rather than on top of it, so it does not slide off when the basket is carried. The diamond pattern is not printed — the dyed fiber is coiled in as the basket is built, which is why it runs right through the wall.',
      descriptionBn:
        'ঢাকনাটি কিনারার উপরে না বসে ভিতরে বসে, তাই ঝুড়ি বহন করার সময় সরে যায় না। হীরক নকশা ছাপানো নয় — ঝুড়ি বোনার সময়েই রঙ করা তন্তু পাকিয়ে ঢোকানো হয়, তাই নকশা দেয়ালের ভিতর পর্যন্ত যায়।',
      materialsEn: 'Coiled natural fiber, plant-dyed strands',
      materialsBn: 'পাকানো প্রাকৃতিক তন্তু, গাছ-গাছড়ায় রং করা সুতা',
      careEn: 'Wipe with a dry cloth. Keep away from prolonged damp.',
      careBn: 'শুকনো কাপড়ে মুছুন। বেশিক্ষণ ভেজা জায়গায় রাখবেন না।',
      dimensionsEn: '28cm diameter × 26cm tall',
      dimensionsBn: '২৮ সেমি ব্যাস × ২৬ সেমি উঁচু',
      weightGrams: 700,
      pricePoisha: taka(1050),
      discountPoisha: 0,
      stock: 13,
      lowStockThreshold: 5,
      isFeatured: false,
    },
    {
      slug: 'embroidered-round-serving-tray',
      sku: 'BF-DEC-003',
      category: 'home-decor',
      nameEn: 'Embroidered Round Serving Tray',
      nameBn: 'সূচিকর্মের গোল পরিবেশন ট্রে',
      shortDescEn: 'Raised-rim tray for tea and sweets.',
      shortDescBn: 'চা ও মিষ্টি পরিবেশনের উঁচু কিনারার ট্রে।',
      descriptionEn:
        'The rim is high enough that cups do not walk off the edge when the tray is carried, and there are two cut-out handles at the sides. Flat enough to hang on the wall between uses.',
      descriptionBn:
        'কিনারা যথেষ্ট উঁচু, তাই ট্রে বহনের সময় কাপ কিনারা পেরিয়ে যায় না; দুই পাশে কাটা হাতল আছে। যথেষ্ট সমতল, তাই ব্যবহার না থাকলে দেয়ালে ঝুলিয়েও রাখা যায়।',
      materialsEn: 'Water-hyacinth weave, cotton embroidery, bound rim',
      materialsBn: 'কচুরিপানার বুনন, সুতির সূচিকর্ম, বাঁধানো কিনারা',
      careEn: 'Wipe spills immediately. Do not use as a cutting surface.',
      careBn: 'কিছু পড়লে সাথে সাথে মুছুন। কাটাকাটির জন্য ব্যবহার করবেন না।',
      dimensionsEn: '34cm diameter × 6cm deep',
      dimensionsBn: '৩৪ সেমি ব্যাস × ৬ সেমি গভীর',
      weightGrams: 340,
      pricePoisha: taka(740),
      discountPoisha: 0,
      stock: 20,
      lowStockThreshold: 6,
      isFeatured: false,
    },
    {
      slug: 'woven-wall-plate-set',
      sku: 'BF-DEC-004',
      category: 'home-decor',
      nameEn: 'Woven Wall Plate Set of Five',
      nameBn: 'বোনা দেয়াল-থালার সেট (৫ টি)',
      shortDescEn: 'Five wall plates, each a different scene.',
      shortDescBn: 'পাঁচটি দেয়াল-থালা, প্রতিটিতে আলাদা দৃশ্য।',
      descriptionEn:
        'Five plates in three sizes, so they can be hung as one cluster rather than a straight row. Each has a loop stitched into the back — no extra fitting needed, a single nail takes each one.',
      descriptionBn:
        'তিন মাপের পাঁচটি থালা, তাই সোজা সারিতে না ঝুলিয়ে একসাথে গুচ্ছ করে সাজানো যায়। প্রতিটির পিছনে সেলাই করা আংটা আছে — আলাদা কিছু লাগে না, একটি করে পেরেকেই হয়ে যায়।',
      materialsEn: 'Jute cord coiled on a fiber base, cotton motif thread',
      materialsBn: 'তন্তুর ভিতের উপর পাকানো পাটের দড়ি, নকশার সুতির সুতা',
      careEn: 'Dust with a soft brush. Keep out of direct rain.',
      careBn: 'নরম ব্রাশে ধুলো ঝাড়ুন। সরাসরি বৃষ্টিতে রাখবেন না।',
      dimensionsEn: 'Largest 32cm, smallest 18cm diameter',
      dimensionsBn: 'সবচেয়ে বড় ৩২ সেমি, ছোট ১৮ সেমি ব্যাস',
      weightGrams: 880,
      pricePoisha: taka(1680),
      discountPoisha: taka(200),
      stock: 8,
      lowStockThreshold: 3,
      isFeatured: true,
    },
    {
      slug: 'embroidered-bread-basket',
      sku: 'BF-DEC-005',
      category: 'home-decor',
      nameEn: 'Embroidered Bread Basket',
      nameBn: 'সূচিকর্মের রুটির ঝুড়ি',
      shortDescEn: 'Lined basket that keeps roti warm at the table.',
      shortDescBn: 'টেবিলে রুটি গরম রাখার আস্তরণযুক্ত ঝুড়ি।',
      descriptionEn:
        'The cotton liner is what does the work: fold it over the top and the roti underneath stays warm through a whole meal. The liner lifts out and goes in the wash; the basket itself only ever needs wiping.',
      descriptionBn:
        'আসল কাজটা করে সুতির আস্তরণ: উপরে ভাঁজ করে ঢেকে দিলে নিচের রুটি পুরো খাওয়ার সময়টা গরম থাকে। আস্তরণ খুলে ধুয়ে ফেলা যায়; ঝুড়িটা শুধু মুছে নিলেই চলে।',
      materialsEn: 'Water-hyacinth weave, removable cotton liner, cotton embroidery',
      materialsBn: 'কচুরিপানার বুনন, খোলা যায় এমন সুতির আস্তরণ, সুতির সূচিকর্ম',
      careEn: 'Wash the liner separately. Wipe the basket with a dry cloth.',
      careBn: 'আস্তরণ আলাদা করে ধুয়ে নিন। ঝুড়ি শুকনো কাপড়ে মুছুন।',
      dimensionsEn: '26cm × 18cm × 8cm',
      dimensionsBn: '২৬ × ১৮ × ৮ সেমি',
      weightGrams: 230,
      pricePoisha: taka(590),
      discountPoisha: 0,
      stock: 31,
      lowStockThreshold: 8,
      isFeatured: false,
    },
    {
      slug: 'round-lidded-keepsake-box',
      sku: 'BF-GFT-003',
      category: 'gift-items',
      nameEn: 'Round Lidded Keepsake Box',
      nameBn: 'গোল ঢাকনাওয়ালা স্মৃতি-বাক্স',
      shortDescEn: 'A small box for jewellery or keepsakes.',
      shortDescBn: 'গয়না বা ছোট স্মৃতিচিহ্ন রাখার বাক্স।',
      descriptionEn:
        'Light enough to post, sturdy enough that the lid still fits years later. The starburst on the lid is worked from the centre outward in a single continuous strand, which is the part that takes the longest to make.',
      descriptionBn:
        'ডাকে পাঠানোর মতো হালকা, আবার এত মজবুত যে বছর পেরিয়েও ঢাকনা ঠিকঠাক বসে। ঢাকনার তারার নকশাটি কেন্দ্র থেকে বাইরের দিকে একটানা এক সুতায় বোনা — এই অংশটুকুতেই সবচেয়ে বেশি সময় লাগে।',
      materialsEn: 'Fine split cane over a fiber core, dyed accent strands',
      materialsBn: 'তন্তুর ভিতের উপর সরু বেত, রং করা নকশার সুতা',
      careEn: 'Keep dry. Dust with a soft brush.',
      careBn: 'শুকনো রাখুন। নরম ব্রাশে ধুলো ঝাড়ুন।',
      dimensionsEn: '18cm diameter × 8cm tall',
      dimensionsBn: '১৮ সেমি ব্যাস × ৮ সেমি উঁচু',
      weightGrams: 190,
      pricePoisha: taka(520),
      discountPoisha: 0,
      stock: 29,
      lowStockThreshold: 8,
      isFeatured: false,
    },
  ];

  let productCount = 0;
  let photographed = 0;
  for (const p of productData) {
    const { category, isActive, ...fields } = p;

    // Corrected copy has to reach a database that was seeded earlier — with
    // `update: {}` a fixed description stayed stale forever.
    //
    // Text only, and deliberately so: `stock` is decremented by real orders and
    // `pricePoisha` is what past orders were priced from, so neither is the
    // seed's to overwrite. Nor are `isActive`/`isFeatured`, which the admin
    // screens will own.
    const copy = {
      nameEn: fields.nameEn,
      nameBn: fields.nameBn,
      shortDescEn: fields.shortDescEn,
      shortDescBn: fields.shortDescBn,
      descriptionEn: fields.descriptionEn,
      descriptionBn: fields.descriptionBn,
      materialsEn: fields.materialsEn,
      materialsBn: fields.materialsBn,
      careEn: fields.careEn,
      careBn: fields.careBn,
      dimensionsEn: fields.dimensionsEn,
      dimensionsBn: fields.dimensionsBn,
    };

    const product = await db.product.upsert({
      where: { sku: p.sku },
      update: copy,
      create: {
        ...fields,
        isActive: isActive ?? true,
        categoryId: categories[category]!,
      },
    });

    // The product's gallery: its own photography where it exists, a single
    // placeholder illustration otherwise. Position 0 is the primary image —
    // the one the cards, the cart and the Open Graph tag use.
    //
    // Idempotent by rewriting the rows in place rather than inserting, so
    // re-running the seed can never double a product's gallery. An earlier
    // version skipped products that already had an image, which meant it could
    // create artwork but never correct it — real photography would never have
    // reached a database seeded before it arrived.
    const photographs = PHOTOGRAPHY_BY_SKU[product.sku];
    if (photographs) photographed++;
    const desired = photographs ?? [
      {
        url: placeholderFor(product.sku),
        altEn: product.nameEn,
        altBn: product.nameBn,
      },
    ];

    const existingImages = await db.productImage.findMany({
      where: { productId: product.id },
      orderBy: { sortOrder: 'asc' },
    });
    const managed = existingImages.filter((image) => isSeedManaged(image.url));

    // A row the seed does not recognise is someone else's — a Cloudinary
    // upload made through the admin. The seed stands down from the whole
    // gallery rather than interleaving its stand-ins with real photography.
    if (managed.length === existingImages.length) {
      for (const [sortOrder, image] of desired.entries()) {
        const row = managed[sortOrder];
        if (row) {
          await db.productImage.update({
            where: { id: row.id },
            data: { ...image, sortOrder },
          });
        } else {
          await db.productImage.create({
            data: { productId: product.id, ...image, sortOrder },
          });
        }
      }

      // Rows left over from a longer gallery in an earlier run. Only ever the
      // seed's own stand-ins — the branch above guarantees that.
      for (const stale of managed.slice(desired.length)) {
        await db.productImage.delete({ where: { id: stale.id } });
      }
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
    { key: 'shop.nameEn', value: 'EcoFiber' },
    { key: 'shop.nameBn', value: 'ইকোফাইবার' },
    { key: 'shop.phone', value: '01712345678' },
    { key: 'shop.email', value: 'hello@ecofiber.com.bd' },
    { key: 'shop.addressEn', value: 'Muktagacha, Mymensingh, Bangladesh' },
    { key: 'shop.addressBn', value: 'মুক্তাগাছা, ময়মনসিংহ, বাংলাদেশ' },
    { key: 'shop.facebook', value: 'https://facebook.com/' },
    { key: 'shop.instagram', value: 'https://instagram.com/' },
    { key: 'order.lowStockAlertEnabled', value: true },
  ];

  // Written on every run, not just the first: with `update: {}` a corrected
  // default — the shop's name, address or email — would never reach a database
  // that had already been seeded once.
  //
  // Safe while the seed is the only writer. When the admin settings screen
  // lands (Sprint 11) it becomes the owner of these rows, and this must go back
  // to leaving an edited value alone.
  for (const s of settings) {
    await db.setting.upsert({
      where: { key: s.key },
      update: { value: s.value as never },
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
