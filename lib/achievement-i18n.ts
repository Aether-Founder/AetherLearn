import type { Language } from './i18n-config';

/**
 * Localized achievement names/descriptions keyed by definition id.
 * Definitions in lib/achievements.ts store canonical English text; these
 * maps provide the Dutch equivalents for display.
 */
const ACHIEVEMENTS_NL: Record<string, { name: string; description: string }> = {
  first_study: { name: 'Eerste Stap', description: 'Voltooi je eerste studie sessie' },
  streak_3: { name: 'Op Dreef', description: 'Behaal een streak van 3 dagen' },
  streak_7: { name: 'Week Warrior', description: 'Behaal een streak van 7 dagen' },
  streak_30: { name: 'Maand Meester', description: 'Behaal een streak van 30 dagen' },
  cards_100: { name: 'Kaarten Verzamelaar', description: 'Studeer 100 kaarten' },
  cards_1000: { name: 'Kaarten Expert', description: 'Studeer 1000 kaarten' },
  perfect_test: { name: 'Perfecte Score', description: 'Haal 100% op een test' },
  test_10: { name: 'Test Kampioen', description: 'Voltooi 10 tests' },
  join_class: { name: 'Team Speler', description: 'Sluit je aan bij een klas' },
  create_set: { name: 'Content Creator', description: 'Maak je eerste studeerset' },
};

/** Map canonical English names back to definition ids (for rows lacking the id). */
const NAME_TO_ID: Record<string, string> = {
  'First Step': 'first_study',
  'On a Roll': 'streak_3',
  'Week Warrior': 'streak_7',
  'Month Master': 'streak_30',
  'Card Collector': 'cards_100',
  'Card Expert': 'cards_1000',
  'Perfect Score': 'perfect_test',
  'Test Champion': 'test_10',
  'Team Player': 'join_class',
  'Content Creator': 'create_set',
};

export const ACHIEVEMENT_CATEGORIES_NL: Record<string, string> = {
  streak: 'Reeks',
  study: 'Studie',
  social: 'Sociaal',
  mastery: 'Meesterschap',
};

function resolveId(key: string): string {
  return ACHIEVEMENTS_NL[key] ? key : NAME_TO_ID[key] ?? key;
}

export function getAchievementName(key: string, language: Language | string, fallback?: string): string {
  if (language === 'nl') {
    const entry = ACHIEVEMENTS_NL[resolveId(key)];
    if (entry) return entry.name;
  }
  return fallback ?? key;
}

export function getAchievementDescription(key: string, language: Language | string, fallback?: string): string {
  if (language === 'nl') {
    const entry = ACHIEVEMENTS_NL[resolveId(key)];
    if (entry) return entry.description;
  }
  return fallback ?? '';
}

export function getAchievementCategory(category: string, language: Language | string): string {
  if (language === 'nl' && ACHIEVEMENT_CATEGORIES_NL[category]) {
    return ACHIEVEMENT_CATEGORIES_NL[category];
  }
  return category.charAt(0).toUpperCase() + category.slice(1);
}
