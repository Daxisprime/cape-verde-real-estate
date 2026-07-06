export function normalizeFacebookUrl(input: string): string {
  if (!input.trim()) return '';
  const trimmed = input.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
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
  let number = trimmed.replace(/[^\d+]/g, '');
  if (number.startsWith('0')) {
    number = '+238' + number.slice(1);
  }
  if (!number.startsWith('+') && !number.startsWith('238')) {
    number = '238' + number;
  }
  number = number.replace(/^\+/, '');
  return `https://wa.me/${number}`;
}

export function normalizeWebsiteUrl(input: string): string {
  if (!input.trim()) return '';
  const trimmed = input.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  return `https://${trimmed}`;
}
