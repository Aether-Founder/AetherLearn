import type { Language } from './i18n-config';

/**
 * Dutch display names for catalog subjects.
 * The canonical `name` field is English; in Dutch mode we show the Dutch
 * equivalent for known catalog slugs. User-created subjects keep their name.
 */
const SUBJECT_NAMES_NL: Record<string, string> = {
  // Dutch curriculum slugs
  'natuurkunde': 'Natuurkunde',
  'scheikunde': 'Scheikunde',
  'biologie': 'Biologie',
  'wiskunde': 'Wiskunde',
  'wiskunde-a': 'Wiskunde A',
  'wiskunde-b': 'Wiskunde B',
  'wiskunde-c': 'Wiskunde C',
  'wiskunde-d': 'Wiskunde D',
  'aardrijkskunde': 'Aardrijkskunde',
  'geschiedenis': 'Geschiedenis',
  'economie': 'Economie',
  'nederlands': 'Nederlands',
  'engels': 'Engels',
  'frans': 'Frans',
  'duits': 'Duits',
  'spaans': 'Spaans',
  'informatica': 'Informatica',
  'bewegen-sport-en-maatschappij': 'Bewegen, Sport & Maatschappij',
  'culturele-en-kunstzinnige-vorming': 'Culturele & Kunstzinnige Vorming',
  'kunst-beeldende-vorming': 'Kunst (Beeldende Vorming)',
  'kunst-muziek': 'Kunst (Muziek)',
  'levensbeschouwing': 'Levensbeschouwing',
  'lichamelijke-opvoeding': 'Lichamelijke Opvoeding',
  'mentoraat': 'Mentoraat',
  'decanaat': 'Decanaat',
  // International curriculum slugs
  'physics': 'Natuurkunde',
  'mathematics': 'Wiskunde',
  'chemistry': 'Scheikunde',
  'biology': 'Biologie',
  'history': 'Geschiedenis',
  'geography': 'Aardrijkskunde',
  'english': 'Engels',
  'economics': 'Economie',
  'data-science': 'Data Science',
  'programming': 'Programmeren',
  'business': 'Bedrijfskunde',
  'psychology': 'Psychologie',
};

/** Canonical English names for catalog subjects (keyed by slug/id). */
const SUBJECT_NAMES_EN: Record<string, string> = {
  'natuurkunde': 'Physics',
  'scheikunde': 'Chemistry',
  'biologie': 'Biology',
  'wiskunde': 'Mathematics',
  'wiskunde-a': 'Mathematics A',
  'wiskunde-b': 'Mathematics B',
  'wiskunde-c': 'Mathematics C',
  'wiskunde-d': 'Mathematics D',
  'aardrijkskunde': 'Geography',
  'geschiedenis': 'History',
  'economie': 'Economics',
  'nederlands': 'Dutch',
  'engels': 'English',
  'frans': 'French',
  'duits': 'German',
  'spaans': 'Spanish',
  'informatica': 'Computer Science',
  'bewegen-sport-en-maatschappij': 'Physical Education',
  'culturele-en-kunstzinnige-vorming': 'Arts',
  'kunst-beeldende-vorming': 'Visual Arts',
  'kunst-muziek': 'Music',
  'levensbeschouwing': 'Philosophy',
  'lichamelijke-opvoeding': 'Physical Education',
  'mentoraat': 'Mentorship',
  'decanaat': 'Deanery',
  'physics': 'Physics',
  'mathematics': 'Mathematics',
  'chemistry': 'Chemistry',
  'biology': 'Biology',
  'history': 'History',
  'geography': 'Geography',
  'english': 'English',
  'economics': 'Economics',
  'data-science': 'Data Science',
  'programming': 'Computer Science',
  'business': 'Business',
  'psychology': 'Psychology',
};

// Reverse lookup: Dutch display name -> English canonical name
const DUTCH_NAME_TO_EN: Record<string, string> = {};
for (const [slug, nlName] of Object.entries(SUBJECT_NAMES_NL)) {
  const enName = SUBJECT_NAMES_EN[slug];
  if (enName && !DUTCH_NAME_TO_EN[nlName]) DUTCH_NAME_TO_EN[nlName] = enName;
}
// Also map the English slugs' own names (e.g. name "Physics" stays "Physics")

export function getSubjectDisplayName(
  subject: { name?: string | null; slug?: string | null; id?: string | null },
  language: Language | string
): string {
  const key = subject.slug || subject.id || '';
  if (language === 'nl') {
    if (SUBJECT_NAMES_NL[key]) return SUBJECT_NAMES_NL[key];
    // If the stored name is already English canonical, translate it
    const enCanonical = SUBJECT_NAMES_EN[key];
    if (enCanonical) {
      for (const [s, nl] of Object.entries(SUBJECT_NAMES_NL)) {
        if (SUBJECT_NAMES_EN[s] === enCanonical) return nl;
      }
    }
    return subject.name || '';
  }
  // English mode: always show the canonical English name for known subjects,
  // even when the stored name is Dutch (e.g. DB rows named 'Natuurkunde').
  if (SUBJECT_NAMES_EN[key]) return SUBJECT_NAMES_EN[key];
  if (subject.name && DUTCH_NAME_TO_EN[subject.name]) return DUTCH_NAME_TO_EN[subject.name];
  return subject.name || '';
}
