// Phone number validation utilities with country code support

export interface CountryCode {
  code: string;           // e.g., '+238'
  country: string;        // e.g., 'Cape Verde'
  iso: string;            // e.g., 'CV'
  flag: string;           // e.g., '🇨🇻'
  minLength: number;      // Digits after country code
  maxLength: number;
  example: string;        // e.g., '+238 999 1234'
}

// Common country codes (focus on Cape Verde and diaspora countries)
export const COUNTRY_CODES: CountryCode[] = [
  // Cape Verde (default)
  { code: '+238', country: 'Cape Verde', iso: 'CV', flag: '🇨🇻', minLength: 7, maxLength: 7, example: '+238 999 1234' },

  // Portugal (large diaspora)
  { code: '+351', country: 'Portugal', iso: 'PT', flag: '🇵🇹', minLength: 9, maxLength: 9, example: '+351 912 345 678' },

  // USA/Canada
  { code: '+1', country: 'USA/Canada', iso: 'US', flag: '🇺🇸', minLength: 10, maxLength: 10, example: '+1 234 567 8900' },

  // France
  { code: '+33', country: 'France', iso: 'FR', flag: '🇫🇷', minLength: 9, maxLength: 9, example: '+33 6 12 34 56 78' },

  // Netherlands
  { code: '+31', country: 'Netherlands', iso: 'NL', flag: '🇳🇱', minLength: 9, maxLength: 9, example: '+31 6 12345678' },

  // UK
  { code: '+44', country: 'United Kingdom', iso: 'GB', flag: '🇬🇧', minLength: 10, maxLength: 10, example: '+44 7911 123456' },

  // Germany
  { code: '+49', country: 'Germany', iso: 'DE', flag: '🇩🇪', minLength: 10, maxLength: 11, example: '+49 151 12345678' },

  // Spain
  { code: '+34', country: 'Spain', iso: 'ES', flag: '🇪🇸', minLength: 9, maxLength: 9, example: '+34 612 345 678' },

  // Italy
  { code: '+39', country: 'Italy', iso: 'IT', flag: '🇮🇹', minLength: 9, maxLength: 10, example: '+39 312 345 6789' },

  // Switzerland
  { code: '+41', country: 'Switzerland', iso: 'CH', flag: '🇨🇭', minLength: 9, maxLength: 9, example: '+41 78 123 45 67' },

  // Belgium
  { code: '+32', country: 'Belgium', iso: 'BE', flag: '🇧🇪', minLength: 8, maxLength: 9, example: '+32 470 12 34 56' },

  // Luxembourg
  { code: '+352', country: 'Luxembourg', iso: 'LU', flag: '🇱🇺', minLength: 6, maxLength: 9, example: '+352 621 123 456' },

  // Brazil
  { code: '+55', country: 'Brazil', iso: 'BR', flag: '🇧🇷', minLength: 10, maxLength: 11, example: '+55 11 91234 5678' },

  // Angola
  { code: '+244', country: 'Angola', iso: 'AO', flag: '🇦🇴', minLength: 9, maxLength: 9, example: '+244 923 456 789' },

  // Guinea-Bissau
  { code: '+245', country: 'Guinea-Bissau', iso: 'GW', flag: '🇬🇼', minLength: 7, maxLength: 7, example: '+245 955 1234' },

  // São Tomé
  { code: '+239', country: 'São Tomé and Príncipe', iso: 'ST', flag: '🇸🇹', minLength: 7, maxLength: 7, example: '+239 990 1234' },

  // Mozambique
  { code: '+258', country: 'Mozambique', iso: 'MZ', flag: '🇲🇿', minLength: 9, maxLength: 9, example: '+258 84 123 4567' },

  // South Africa
  { code: '+27', country: 'South Africa', iso: 'ZA', flag: '🇿🇦', minLength: 9, maxLength: 9, example: '+27 71 123 4567' },
];

// Sort by code length descending for matching
const SORTED_CODES = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length);

export interface PhoneValidationResult {
  isValid: boolean;
  cleanedNumber: string;         // Without +, ready for wa.me
  formattedNumber: string;       // With + for display
  countryCode: string | null;
  country: CountryCode | null;
  errorMessage: string | null;
  warningMessage: string | null;
}

/**
 * Validate and parse a phone number
 */
export function validatePhoneNumber(input: string): PhoneValidationResult {
  const result: PhoneValidationResult = {
    isValid: false,
    cleanedNumber: '',
    formattedNumber: '',
    countryCode: null,
    country: null,
    errorMessage: null,
    warningMessage: null,
  };

  // Trim and handle empty
  let cleaned = (input || '').trim();

  if (!cleaned) {
    result.errorMessage = 'Phone number is required';
    return result;
  }

  // Remove all non-digit characters except leading +
  cleaned = cleaned.replace(/[^0-9+]/g, '');

  // Handle 00 prefix (international format)
  if (cleaned.startsWith('00')) {
    cleaned = '+' + cleaned.substring(2);
  }

  // If no +, try to detect or add default
  if (!cleaned.startsWith('+')) {
    // Check if it starts with a known country code
    const matchedCountry = SORTED_CODES.find(c =>
      cleaned.startsWith(c.code.replace('+', ''))
    );

    if (matchedCountry) {
      cleaned = '+' + cleaned;
    } else {
      // Default to Cape Verde
      cleaned = '+238' + cleaned;
      result.warningMessage = 'Assuming Cape Verde (+238) country code';
    }
  }

  // Find matching country
  const matchedCountry = SORTED_CODES.find(c => cleaned.startsWith(c.code));

  if (matchedCountry) {
    result.country = matchedCountry;
    result.countryCode = matchedCountry.code;

    // Get digits after country code
    const remainingDigits = cleaned.substring(matchedCountry.code.length);

    // Validate length
    if (remainingDigits.length < matchedCountry.minLength) {
      result.errorMessage = `Phone number too short for ${matchedCountry.country}. Need ${matchedCountry.minLength} digits after ${matchedCountry.code}`;
      return result;
    }

    if (remainingDigits.length > matchedCountry.maxLength) {
      result.errorMessage = `Phone number too long for ${matchedCountry.country}. Maximum ${matchedCountry.maxLength} digits after ${matchedCountry.code}`;
      return result;
    }

    // Valid!
    result.isValid = true;
    result.cleanedNumber = cleaned.replace('+', '');
    result.formattedNumber = cleaned;

  } else {
    // Unknown country code, validate by general length
    const digits = cleaned.replace('+', '');

    if (digits.length < 7) {
      result.errorMessage = 'Phone number too short (minimum 7 digits)';
      return result;
    }

    if (digits.length > 15) {
      result.errorMessage = 'Phone number too long (maximum 15 digits)';
      return result;
    }

    // Accept but warn
    result.isValid = true;
    result.cleanedNumber = digits;
    result.formattedNumber = '+' + digits;
    result.warningMessage = 'Country code not recognized';
  }

  return result;
}

/**
 * Format a phone number for display
 */
export function formatPhoneDisplay(input: string): string {
  const result = validatePhoneNumber(input);

  if (!result.isValid || !result.country) {
    return result.formattedNumber || input;
  }

  // Format based on country
  const code = result.country.code;
  const digits = result.cleanedNumber.substring(code.length - 1); // Remove +

  // Simple grouping for display
  switch (result.country.iso) {
    case 'CV': // Cape Verde: +238 999 1234
      return `${code} ${digits.substring(0, 3)} ${digits.substring(3)}`;

    case 'PT': // Portugal: +351 912 345 678
      return `${code} ${digits.substring(0, 3)} ${digits.substring(3, 6)} ${digits.substring(6)}`;

    case 'US': // USA: +1 (234) 567-8900
      return `${code} (${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6)}`;

    case 'FR': // France: +33 6 12 34 56 78
      return `${code} ${digits.substring(0, 1)} ${digits.substring(1, 3)} ${digits.substring(3, 5)} ${digits.substring(5, 7)} ${digits.substring(7)}`;

    default:
      // Generic: space every 3-4 digits
      const parts = [];
      for (let i = 0; i < digits.length; i += 3) {
        parts.push(digits.substring(i, i + 3));
      }
      return `${code} ${parts.join(' ')}`;
  }
}

/**
 * Generate WhatsApp URL from phone number
 */
export function formatWhatsAppUrl(input: string): string | null {
  const result = validatePhoneNumber(input);

  if (!result.isValid) {
    return null;
  }

  return `https://wa.me/${result.cleanedNumber}`;
}

/**
 * Get country code selector options
 */
export function getCountryCodeOptions(): { value: string; label: string; flag: string }[] {
  return COUNTRY_CODES.map(c => ({
    value: c.code,
    label: `${c.flag} ${c.country} (${c.code})`,
    flag: c.flag,
  }));
}

/**
 * Detect country from phone number
 */
export function detectCountry(input: string): CountryCode | null {
  const result = validatePhoneNumber(input);
  return result.country;
}

/**
 * Check if a string looks like a phone number
 */
export function looksLikePhoneNumber(input: string): boolean {
  const cleaned = (input || '').replace(/[^0-9+]/g, '');
  return cleaned.length >= 7 && /^[+]?[0-9]+$/.test(cleaned);
}
