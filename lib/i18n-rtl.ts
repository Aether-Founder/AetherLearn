import { type Language } from './i18n-config';

/**
 * Languages that use right-to-left (RTL) text direction.
 * Add more RTL languages here as needed.
 */
export const RTL_LANGUAGES: Language[] = ['ar', 'he', 'fa', 'ur', 'yi'];

/**
 * Check if a language uses right-to-left text direction.
 */
export function isRTL(language: Language): boolean {
  return RTL_LANGUAGES.includes(language);
}

/**
 * Get the text direction for a language ('ltr' or 'rtl').
 */
export function getDirection(language: Language): 'ltr' | 'rtl' {
  return isRTL(language) ? 'rtl' : 'ltr';
}

/**
 * Get the opposite direction (useful for UI elements that need to flip).
 */
export function getOppositeDirection(direction: 'ltr' | 'rtl'): 'ltr' | 'rtl' {
  return direction === 'ltr' ? 'rtl' : 'ltr';
}

/**
 * Get the appropriate text alignment based on direction.
 */
export function getTextAlign(direction: 'ltr' | 'rtl'): 'left' | 'right' {
  return direction === 'ltr' ? 'left' : 'right';
}

/**
 * Get CSS classes for RTL support.
 * Returns an object with direction-aware class names.
 */
export function getRTLClasses(language: Language) {
  const direction = getDirection(language);
  return {
    direction,
    textAlign: getTextAlign(direction),
    // Common RTL-aware CSS utility classes
    start: direction === 'rtl' ? 'right' : 'left',
    end: direction === 'rtl' ? 'left' : 'right',
    // Logical properties (modern CSS)
    paddingInlineStart: 'ps-4',
    paddingInlineEnd: 'pe-4',
    marginInlineStart: 'ms-4',
    marginInlineEnd: 'me-4',
  };
}
