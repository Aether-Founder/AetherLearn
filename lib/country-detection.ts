/**
 * Country Detection Utilities
 * 
 * Provides methods to detect the user's country from:
 * - Browser Accept-Language header
 * - IP geolocation API (optional)
 * - User manual selection
 */

import { REGIONAL_DEFAULTS, type Language } from './i18n-config';

export interface CountryDetectionResult {
  countryCode: string;
  confidence: 'high' | 'medium' | 'low';
  source: 'browser' | 'ip' | 'manual';
}

/**
 * Detect country from browser's Accept-Language header.
 * This is the most reliable client-side method without external API calls.
 */
export function detectCountryFromBrowser(): CountryDetectionResult | null {
  if (typeof window === 'undefined') return null;

  const acceptLanguage = navigator.language || navigator.languages?.[0];
  if (!acceptLanguage) return null;

  // Parse language code (e.g., "en-US" -> "US", "nl" -> "NL")
  const parts = acceptLanguage.split('-');
  if (parts.length === 2) {
    const countryCode = parts[1].toUpperCase();
    return {
      countryCode,
      confidence: 'high',
      source: 'browser',
    };
  }

  // If no country code, try to infer from language code
  const languageCode = parts[0].toLowerCase();
  const countryMappings: Record<string, string> = {
    nl: 'NL',
    en: 'GB', // Default to UK for English
    de: 'DE',
    fr: 'FR',
    es: 'ES',
    it: 'IT',
    pt: 'PT',
    ru: 'RU',
    zh: 'CN',
    ja: 'JP',
    ko: 'KR',
    ar: 'SA', // Default to Saudi Arabia for Arabic
    hi: 'IN',
    tr: 'TR',
    id: 'ID',
    vi: 'VN',
    th: 'TH',
    pl: 'PL',
    uk: 'UA',
  };

  const inferredCountry = countryMappings[languageCode];
  if (inferredCountry) {
    return {
      countryCode: inferredCountry,
      confidence: 'medium',
      source: 'browser',
    };
  }

  return null;
}

/**
 * Detect country from IP using a free geolocation API.
 * This is optional and may fail if the API is unavailable.
 */
export async function detectCountryFromIP(): Promise<CountryDetectionResult | null> {
  try {
    // Using ipapi.co (free, no API key required)
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) return null;

    const data = await response.json();
    if (data?.country_code) {
      return {
        countryCode: data.country_code.toUpperCase(),
        confidence: 'high',
        source: 'ip',
      };
    }
  } catch (error) {
    console.warn('IP geolocation failed:', error);
  }

  return null;
}

/**
 * Get the best available country detection.
 * Tries IP first, falls back to browser detection.
 */
export async function detectCountry(): Promise<CountryDetectionResult | null> {
  // Try IP detection first (more accurate)
  const ipResult = await detectCountryFromIP();
  if (ipResult) return ipResult;

  // Fall back to browser detection
  const browserResult = detectCountryFromBrowser();
  return browserResult;
}

/**
 * Get the recommended language for a country.
 * Returns the regional default or falls back to Dutch.
 */
export function getLanguageForCountry(countryCode: string): Language {
  return REGIONAL_DEFAULTS[countryCode.toLowerCase()] || 'nl';
}

/**
 * Get both country and language detection together.
 * Useful for onboarding to suggest defaults.
 */
export async function detectLocationAndLanguage(): Promise<{
  country: CountryDetectionResult | null;
  suggestedLanguage: Language;
}> {
  const country = await detectCountry();
  const suggestedLanguage = country
    ? getLanguageForCountry(country.countryCode)
    : 'nl';

  return {
    country,
    suggestedLanguage,
  };
}

/**
 * Infer country from language code (for manual selection fallback).
 */
export function inferCountryFromLanguage(languageCode: Language): string | null {
  const mappings: Record<string, string> = {
    nl: 'NL',
    en: 'GB',
    de: 'DE',
    fr: 'FR',
    es: 'ES',
    it: 'IT',
    pt: 'PT',
    ru: 'RU',
    zh: 'CN',
    ja: 'JP',
    ko: 'KR',
    ar: 'SA',
    hi: 'IN',
    tr: 'TR',
    id: 'ID',
    vi: 'VN',
    th: 'TH',
    pl: 'PL',
    uk: 'UA',
  };

  return mappings[languageCode] || null;
}
