/**
 * Cambodian Phone Number Utility
 * Country Code: +855 (Cambodia)
 *
 * Cambodian mobile numbers are typically 8 or 9 digits long:
 * - Local format: 012 345 678 or 097 123 4567
 * - International format: +855 12 345 678 or +855 97 123 4567
 */

export function normalizeCambodianPhone(input: string): string {
  if (!input) return '';

  // Remove spaces, hyphens, dots, parentheses
  let cleaned = input.trim().replace(/[\s\-\.\(\)]/g, '');

  // Handle international prefixes
  if (cleaned.startsWith('00855')) {
    cleaned = '+855' + cleaned.slice(5);
  } else if (cleaned.startsWith('855')) {
    cleaned = '+855' + cleaned.slice(3);
  }

  // Handle +855 with leading 0 (e.g. +855012345678 -> +85512345678)
  if (cleaned.startsWith('+8550')) {
    cleaned = '+855' + cleaned.slice(5);
  } else if (cleaned.startsWith('0')) {
    // Local Cambodian format starting with 0 (e.g. 012345678 -> +85512345678)
    cleaned = '+855' + cleaned.slice(1);
  } else if (/^\d{8,9}$/.test(cleaned)) {
    // Just the 8 or 9 digits without country code or leading 0
    cleaned = '+855' + cleaned;
  } else if (!cleaned.startsWith('+')) {
    cleaned = '+855' + cleaned;
  }

  return cleaned;
}

export function isValidCambodianPhone(phone: string): boolean {
  const normalized = normalizeCambodianPhone(phone);
  // Cambodian phone numbers with +855 must have 8 or 9 digits following +855
  return /^\+855\d{8,9}$/.test(normalized);
}

export function formatCambodianPhone(phone: string): string {
  const normalized = normalizeCambodianPhone(phone);
  if (!normalized.startsWith('+855')) return normalized;

  const digits = normalized.slice(4);
  if (digits.length === 8) {
    // e.g. +855 12 345 678
    return `+855 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
  } else if (digits.length === 9) {
    // e.g. +855 97 123 4567
    return `+855 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
  }
  return normalized;
}
