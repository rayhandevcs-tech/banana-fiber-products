/**
 * Bangladeshi mobile numbers.
 *
 * Valid operator prefixes are 013–019 (Grameenphone, Robi, Banglalink, Teletalk,
 * Airtel, Citycell). Accepts the common ways people type them —
 * "01712345678", "+8801712345678", "8801712345678", with spaces or dashes —
 * and normalises to a single stored form: 01XXXXXXXXX (11 digits).
 */

const BD_MOBILE = /^01[3-9]\d{8}$/;

/** Strip formatting and the country code. Returns null if not a valid number. */
export function normalizePhone(input: string): string | null {
  const digits = input.replace(/[\s\-()+]/g, '');
  const local = digits.startsWith('88') ? digits.slice(2) : digits;
  return BD_MOBILE.test(local) ? local : null;
}

export function isValidBdPhone(input: string): boolean {
  return normalizePhone(input) !== null;
}

/** Display form: 01712-345678 */
export function formatPhone(input: string): string {
  const normalized = normalizePhone(input);
  if (!normalized) return input;
  return `${normalized.slice(0, 5)}-${normalized.slice(5)}`;
}
