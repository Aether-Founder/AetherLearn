import type { Language } from './i18n-config';

const DUTCH_TIMEZONES: readonly string[] = ['Europe/Amsterdam', 'Europe/Brussels'];
const DUTCH_REGIONS: readonly string[] = ['NL', 'BE'];

/**
 * Detect the visitor's language from browser signals.
 * Only two languages are supported: Dutch for the Netherlands/Belgium,
 * English everywhere else.
 */
export function detectLanguageFromLocation(): Language {
  try {
    if (typeof window === 'undefined') {
      return 'en';
    }

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timeZone && DUTCH_TIMEZONES.includes(timeZone)) {
      return 'nl';
    }

    const languages = navigator.languages?.length ? navigator.languages : [navigator.language];
    for (const locale of languages || []) {
      if (!locale) continue;
      const [base, region] = locale.split(/[-_]/);
      if (base?.toLowerCase() === 'nl') return 'nl';
      if (region && DUTCH_REGIONS.includes(region.toUpperCase())) return 'nl';
    }

    return 'en';
  } catch {
    return 'en';
  }
}
