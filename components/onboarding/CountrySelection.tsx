'use client';

import { type Language } from '@/lib/i18n-config';

export interface Country {
  code: string;
  name: string;
  flag: string;
  defaultLanguage: Language;
}

interface CountrySelectionProps {
  selectedCountry: string;
  onCountryChange: (countryCode: string) => void;
  className?: string;
}

const COUNTRIES: Country[] = [
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', defaultLanguage: 'nl' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪', defaultLanguage: 'nl' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', defaultLanguage: 'de' },
  { code: 'FR', name: 'France', flag: '🇫🇷', defaultLanguage: 'fr' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', defaultLanguage: 'es' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', defaultLanguage: 'it' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', defaultLanguage: 'pt' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', defaultLanguage: 'en' },
  { code: 'US', name: 'United States', flag: '🇺🇸', defaultLanguage: 'en' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', defaultLanguage: 'en' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', defaultLanguage: 'en' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', defaultLanguage: 'ja' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', defaultLanguage: 'ko' },
  { code: 'CN', name: 'China', flag: '🇨🇳', defaultLanguage: 'zh' },
  { code: 'IN', name: 'India', flag: '🇮🇳', defaultLanguage: 'hi' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', defaultLanguage: 'pt' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', defaultLanguage: 'es' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺', defaultLanguage: 'ru' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', defaultLanguage: 'ar' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', defaultLanguage: 'ar' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷', defaultLanguage: 'tr' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱', defaultLanguage: 'pl' },
  { code: 'UA', name: 'Ukraine', flag: '🇺🇦', defaultLanguage: 'uk' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', defaultLanguage: 'id' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', defaultLanguage: 'vi' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', defaultLanguage: 'th' },
];

export function CountrySelection({
  selectedCountry,
  onCountryChange,
  className = '',
}: CountrySelectionProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {COUNTRIES.map((country) => (
          <button
            key={country.code}
            type="button"
            onClick={() => onCountryChange(country.code)}
            className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-all ${
              selectedCountry === country.code
                ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                : 'border-border bg-background hover:bg-secondary/50'
            }`}
          >
            <span className="text-2xl">{country.flag}</span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium truncate">{country.name}</div>
              <div className="text-xs text-muted-foreground">{country.code}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
