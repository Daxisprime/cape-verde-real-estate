/**
 * Social media handle normalization utilities.
 * Accepts raw usernames/handles/phone numbers and returns proper URLs.
 */

export function normalizeFacebookUrl(input: string): string {
  if (!input.trim()) return '';
  const trimmed = input.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  // Remove leading @ or slash
  const cleaned = trimmed.replace(/^[@/]+/, '');
  return `https://facebook.com/${cleaned}`;
}

export function normalizeInstagramUrl(input: string): string {
  if (!input.trim()) return '';
  const trimmed = input.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  const cleaned = trimmed.replace(/^[@/]+/, '');
  return `https://instagram.com/${cleaned}`;
}

export function normalizeWhatsAppUrl(input: string): string {
  if (!input.trim()) return '';
  const trimmed = input.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  // Strip non-digits except leading +
  let number = trimmed.replace(/[^\d+]/g, '');
  // If starts with 0, assume Cape Verde (+238)
  if (number.startsWith('0')) {
    number = '+238' + number.slice(1);
  }
  // If no country code, assume Cape Verde
  if (!number.startsWith('+') && !number.startsWith('238')) {
    number = '238' + number;
  }
  // Remove the + for wa.me format
  number = number.replace(/^\+/, '');
  return `https://wa.me/${number}`;
}

export function normalizeWebsiteUrl(input: string): string {
  if (!input.trim()) return '';
  const trimmed = input.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  return `https://${trimmed}`;
}
