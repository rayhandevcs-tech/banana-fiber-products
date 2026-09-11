import type { Testimonial } from '@/types/content';

/**
 * TEMPORARY — placeholder testimonials.
 *
 * Written to be plausible rather than promotional; none of these are real
 * customers. Replace the array contents with genuine, permitted quotes before
 * launch — the shape stays the same, so no component needs to change.
 *
 * When real testimonials are collected, this file is the only thing to edit.
 * (If they eventually need admin management, they move to a database table
 * with these same fields.)
 */
export const testimonials: Testimonial[] = [
  {
    id: 'placeholder-1',
    quote: {
      en: 'I ordered two storage baskets for my bedroom. They arrived in four days and the weaving is much tighter than I expected from the photos.',
      bn: 'শোবার ঘরের জন্য দুইটা স্টোরেজ ঝুড়ি অর্ডার করেছিলাম। চার দিনেই পেয়ে গেছি, আর বুনন ছবিতে যেমন দেখেছিলাম তার চেয়ে অনেক শক্ত।',
    },
    authorName: { en: 'Nusrat J.', bn: 'নুসরাত জে.' },
    authorLocation: { en: 'Dhanmondi, Dhaka', bn: 'ধানমন্ডি, ঢাকা' },
    rating: 5,
  },
  {
    id: 'placeholder-2',
    quote: {
      en: 'The market bag has held a full week of vegetables every week for three months. The handles have not loosened at all.',
      bn: 'বাজারের ব্যাগটায় তিন মাস ধরে প্রতি সপ্তাহে পুরো সপ্তাহের সবজি এনেছি। হাতল একটুও ঢিলে হয়নি।',
    },
    authorName: { en: 'Rafiqul I.', bn: 'রফিকুল আই.' },
    authorLocation: { en: 'Khulna', bn: 'খুলনা' },
    rating: 5,
  },
  {
    id: 'placeholder-3',
    quote: {
      en: 'Bought the floor mat as a gift. The colour was slightly different from the picture, but they had said that on the page, and it looks good in the room.',
      bn: 'উপহার হিসেবে মাদুরটা কিনেছিলাম। রঙ ছবির থেকে একটু আলাদা, তবে পাতাতেই সেটা লেখা ছিল, আর ঘরে বেশ মানিয়েছে।',
    },
    authorName: { en: 'Shirin A.', bn: 'শিরিন এ.' },
    authorLocation: { en: 'Sylhet', bn: 'সিলেট' },
    rating: 4,
  },
];
