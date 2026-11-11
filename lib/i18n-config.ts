/**
 * Language registry — single source of truth for supported languages.
 *
 * To add a new language:
 *   1. Drop a `{code}.json` translation file into `public/locales/`.
 *   2. Add its code + native name below.
 *   3. (Optional) Add a date-fns locale mapping in `lib/i18n-date.ts`.
 * That's it — no other code changes are required.
 */

export interface LanguageMeta {
  code: string;
  /** Name shown in the language switcher, written in that language itself. */
  nativeName: string;
}

export const LANGUAGE_REGISTRY: readonly LanguageMeta[] = [
  { code: 'nl', nativeName: 'Nederlands' },
  { code: 'en', nativeName: 'English' },
  { code: 'ru', nativeName: 'Русский' },
  { code: 'zh', nativeName: '中文' },
  { code: 'fr', nativeName: 'Français' },
  { code: 'es', nativeName: 'Español' },
  { code: 'ar', nativeName: 'العربية' },
  { code: 'de', nativeName: 'Deutsch' },
  { code: 'ja', nativeName: '日本語' },
  { code: 'ko', nativeName: '한국어' },
  { code: 'hi', nativeName: 'हिन्दी' },
  { code: 'pt', nativeName: 'Português' },
  { code: 'it', nativeName: 'Italiano' },
  { code: 'tr', nativeName: 'Türkçe' },
  { code: 'id', nativeName: 'Bahasa Indonesia' },
  { code: 'vi', nativeName: 'Tiếng Việt' },
  { code: 'th', nativeName: 'ไทย' },
  { code: 'pl', nativeName: 'Polski' },
  { code: 'uk', nativeName: 'Українська' },
];

export type Language = (typeof LANGUAGE_REGISTRY)[number]['code'];

/** Languages selectable in the UI (all registered languages are candidates). */
export const LANGUAGES: readonly Language[] = LANGUAGE_REGISTRY.map((lang) => lang.code);

export const DEFAULT_LANGUAGE: Language = 'nl';

/**
 * Regional language defaults for automatic language detection.
 * Maps country codes to their default language.
 * This preserves Dutch as default for NL/BE users while enabling
 * regional defaults for other countries.
 */
export const REGIONAL_DEFAULTS: Record<string, Language> = {
  'nl': 'nl', // Netherlands
  'be': 'nl', // Belgium (Dutch/French - Dutch as primary)
  'de': 'de', // Germany
  'at': 'de', // Austria
  'ch': 'de', // Switzerland (German as primary)
  'fr': 'fr', // France
  'es': 'es', // Spain
  'it': 'it', // Italy
  'pt': 'pt', // Portugal
  'br': 'pt', // Brazil
  'ru': 'ru', // Russia
  'ua': 'uk', // Ukraine
  'pl': 'pl', // Poland
  'tr': 'tr', // Turkey
  'sa': 'ar', // Saudi Arabia
  'ae': 'ar', // UAE
  'eg': 'ar', // Egypt
  'jp': 'ja', // Japan
  'kr': 'ko', // South Korea
  'cn': 'zh', // China
  'tw': 'zh', // Taiwan
  'in': 'hi', // India
  'id': 'id', // Indonesia
  'vn': 'vi', // Vietnam
  'th': 'th', // Thailand
  // English as fallback for many countries
  'us': 'en',
  'gb': 'en',
  'ca': 'en',
  'au': 'en',
  'nz': 'en',
  'ie': 'en',
  'za': 'en',
};

export const STORAGE_KEY = 'aether_language';
