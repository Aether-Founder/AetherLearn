import { DEFAULT_LANGUAGE, REGIONAL_DEFAULTS, type Language, LANGUAGES } from './i18n-config';

/**
 * Detect the appropriate language for a user based on various signals.
 * Priority order:
 * 1. Explicit language parameter (URL param or query)
 * 2. Stored user preference (cookie/localStorage)
 * 3. Geographic location (country code)
 * 4. Accept-Language header
 * 5. Default language (Dutch)
 */
export function detectLanguage(options: {
  urlParam?: string;
  cookie?: string;
  countryCode?: string;
  acceptLanguage?: string;
}): Language {
  const { urlParam, cookie, countryCode, acceptLanguage } = options;

  // 1. Check explicit URL parameter
  if (urlParam && isValidLanguage(urlParam)) {
    return urlParam;
  }

  // 2. Check stored preference (cookie)
  if (cookie) {
    const match = cookie.match(/aether_language=([^;]+)/);
    if (match && isValidLanguage(match[1])) {
      return match[1];
    }
  }

  // 3. Check geographic location (country code)
  if (countryCode && REGIONAL_DEFAULTS[countryCode.toLowerCase()]) {
    return REGIONAL_DEFAULTS[countryCode.toLowerCase()];
  }

  // 4. Check Accept-Language header
  if (acceptLanguage) {
    const preferredLang = parseAcceptLanguage(acceptLanguage);
    if (preferredLang && isValidLanguage(preferredLang)) {
      return preferredLang;
    }
  }

  // 5. Fall back to default
  return DEFAULT_LANGUAGE;
}

/**
 * Parse Accept-Language header and return the best matching supported language.
 */
function parseAcceptLanguage(acceptLanguage: string): Language | null {
  const languages = acceptLanguage
    .split(',')
    .map(lang => {
      const [code, q] = lang.trim().split(';q=');
      const quality = q ? parseFloat(q) : 1;
      return { code: code.split('-')[0].toLowerCase(), quality };
    })
    .sort((a, b) => b.quality - a.quality);

  for (const { code } of languages) {
    if (isValidLanguage(code)) {
      return code;
    }
  }

  return null;
}

/**
 * Check if a language code is in our supported languages list.
 */
export function isValidLanguage(code: string): code is Language {
  return LANGUAGES.includes(code as Language);
}

/**
 * Get the appropriate language for a specific country.
 * Returns the regional default if available, otherwise the global default.
 */
export function getLanguageForCountry(countryCode: string): Language {
  return REGIONAL_DEFAULTS[countryCode.toLowerCase()] || DEFAULT_LANGUAGE;
}
