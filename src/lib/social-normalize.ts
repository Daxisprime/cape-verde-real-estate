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

const KNOWN_COUNTRY_CODES = [
  '1',    // US/Canada
  '7',    // Russia
  '20',   // Egypt
  '27',   // South Africa
  '30',   // Greece
  '31',   // Netherlands
  '33',   // France
  '34',   // Spain
  '39',   // Italy
  '44',   // UK
  '45',   // Denmark
  '46',   // Sweden
  '47',   // Norway
  '48',   // Poland
  '49',   // Germany
  '55',   // Brazil
  '86',   // China
  '90',   // Turkey
  '91',   // India
  '212',  // Morocco
  '213',  // Algeria
  '234',  // Nigeria
  '238',  // Cape Verde
  '239',  // Sao Tome
  '240',  // Equatorial Guinea
  '241',  // Gabon
  '242',  // Congo
  '243',  // DR Congo
  '244',  // Angola
  '245',  // Guinea-Bissau
  '246',  // Diego Garcia
  '247',  // Ascension
  '248',  // Seychelles
  '249',  // Sudan
  '250',  // Rwanda
  '251',  // Ethiopia
  '252',  // Somalia
  '253',  // Djibouti
  '254',  // Kenya
  '255',  // Tanzania
  '256',  // Uganda
  '258',  // Mozambique
  '260',  // Zambia
  '261',  // Madagascar
  '263',  // Zimbabwe
  '265',  // Malawi
  '267',  // Botswana
  '351',  // Portugal
  '352',  // Luxembourg
  '353',  // Ireland
  '358',  // Finland
  '375',  // Belarus
  '380',  // Ukraine
  '420',  // Czech Republic
  '421',  // Slovakia
  '852',  // Hong Kong
  '886',  // Taiwan
  '966',  // Saudi Arabia
  '971',  // UAE
];

function hasInternationalPrefix(digits: string): boolean {
  for (const code of KNOWN_COUNTRY_CODES) {
    if (digits.startsWith(code) && digits.length >= code.length + 5) {
      return true;
    }
  }
  return false;
}

export function normalizeWhatsAppUrl(input: string): string {
  if (!input.trim()) return '';
  const trimmed = input.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;

  const hadPlus = trimmed.startsWith('+');
  let digits = trimmed.replace(/[\s\-\+\(\)]/g, '');
  digits = digits.replace(/[^\d]/g, '');

  if (!digits) return '';

  if (digits.startsWith('00')) {
    digits = digits.slice(2);
  }

  if (hadPlus || hasInternationalPrefix(digits)) {
    return `https://wa.me/${digits}`;
  }

  if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  if (digits.length <= 7) {
    return `https://wa.me/238${digits}`;
  }

  return `https://wa.me/${digits}`;
}

export function normalizeWebsiteUrl(input: string): string {
  if (!input.trim()) return '';
  const trimmed = input.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  return `https://${trimmed}`;
}
