'use client';

import { useState } from 'react';

const COUNTRY_CODES = [
  { code: '+238', label: 'CV', name: 'Cabo Verde' },
  { code: '+1', label: 'US', name: 'USA' },
  { code: '+351', label: 'PT', name: 'Portugal' },
  { code: '+33', label: 'FR', name: 'França' },
  { code: '+31', label: 'NL', name: 'Países Baixos' },
] as const;

interface InternationalPhoneInputProps {
  value: string;
  onChange: (fullNumber: string) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

export default function InternationalPhoneInput({
  value,
  onChange,
  required = false,
  placeholder = '9XX XXXX',
  className = '',
}: InternationalPhoneInputProps) {
  const parsed = parsePhoneValue(value);
  const [countryCode, setCountryCode] = useState(parsed.code);
  const [localNumber, setLocalNumber] = useState(parsed.local);

  function parsePhoneValue(val: string): { code: string; local: string } {
    if (!val) return { code: '+238', local: '' };
    for (const c of COUNTRY_CODES) {
      if (val.startsWith(c.code)) {
        return { code: c.code, local: val.slice(c.code.length).trim() };
      }
    }
    if (val.startsWith('+')) {
      const spaceIdx = val.indexOf(' ');
      if (spaceIdx > 0) {
        return { code: val.slice(0, spaceIdx), local: val.slice(spaceIdx + 1) };
      }
    }
    return { code: '+238', local: val };
  }

  function handleCodeChange(newCode: string) {
    setCountryCode(newCode);
    onChange(localNumber ? `${newCode}${localNumber.replace(/\s/g, '')}` : '');
  }

  function handleLocalChange(newLocal: string) {
    const cleaned = newLocal.replace(/[^\d\s]/g, '');
    setLocalNumber(cleaned);
    onChange(cleaned ? `${countryCode}${cleaned.replace(/\s/g, '')}` : '');
  }

  return (
    <div className={`flex items-stretch ${className}`}>
      <select
        value={countryCode}
        onChange={(e) => handleCodeChange(e.target.value)}
        className="px-2 py-2 text-sm font-medium border border-r-0 border-gray-200 rounded-l-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 appearance-none text-gray-700 min-w-[90px]"
      >
        {COUNTRY_CODES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.label} {c.code}
          </option>
        ))}
      </select>
      <input
        type="tel"
        value={localNumber}
        onChange={(e) => handleLocalChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        autoComplete="tel"
        className="flex-1 px-4 py-2 text-base border border-gray-200 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 bg-white"
      />
    </div>
  );
}

export { COUNTRY_CODES };
