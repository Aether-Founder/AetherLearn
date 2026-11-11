import { type EducationalLevel } from './education-levels';

export interface Subject {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
}

export interface CurriculumSubject {
  subject: Subject;
  levels: EducationalLevel[];
  curriculum?: string; // e.g., 'nl-vwo', 'us-ap', etc.
}

export interface CountryCurriculum {
  countryCode: string;
  countryName: string;
  subjects: CurriculumSubject[];
}

// Dutch curriculum (VWO/HAVO/VMBO levels)
const DUTCH_SUBJECTS: CurriculumSubject[] = [
  {
    subject: {
      id: 'natuurkunde',
      name: 'Natuurkunde',
      slug: 'natuurkunde',
      description: 'De studie van materie, energie en hun interacties',
      color: '#3b82f6',
      icon: 'atom',
    },
    levels: ['middle-school', 'high-school', 'university'],
    curriculum: 'nl-vwo',
  },
  {
    subject: {
      id: 'wiskunde',
      name: 'Wiskunde',
      slug: 'wiskunde',
      description: 'Wiskunde en rekenvaardigheid',
      color: '#8b5cf6',
      icon: 'calculator',
    },
    levels: ['middle-school', 'high-school', 'university'],
    curriculum: 'nl-vwo',
  },
  {
    subject: {
      id: 'scheikunde',
      name: 'Scheikunde',
      slug: 'scheikunde',
      description: 'De studie van stoffen en chemische reacties',
      color: '#10b981',
      icon: 'flask',
    },
    levels: ['middle-school', 'high-school', 'university'],
    curriculum: 'nl-vwo',
  },
  {
    subject: {
      id: 'biologie',
      name: 'Biologie',
      slug: 'biologie',
      description: 'De studie van levende organismen',
      color: '#22c55e',
      icon: 'leaf',
    },
    levels: ['middle-school', 'high-school', 'university'],
    curriculum: 'nl-vwo',
  },
  {
    subject: {
      id: 'geschiedenis',
      name: 'Geschiedenis',
      slug: 'geschiedenis',
      description: 'De studie van het verleden',
      color: '#f59e0b',
      icon: 'scroll',
    },
    levels: ['middle-school', 'high-school', 'university'],
    curriculum: 'nl-vwo',
  },
  {
    subject: {
      id: 'aardrijkskunde',
      name: 'Aardrijkskunde',
      slug: 'aardrijkskunde',
      description: 'De studie van de aarde en haar inwoners',
      color: '#06b6d4',
      icon: 'globe',
    },
    levels: ['middle-school', 'high-school'],
    curriculum: 'nl-vwo',
  },
  {
    subject: {
      id: 'nederlands',
      name: 'Nederlands',
      slug: 'nederlands',
      description: 'Nederlandse taal en literatuur',
      color: '#ec4899',
      icon: 'book',
    },
    levels: ['middle-school', 'high-school'],
    curriculum: 'nl-vwo',
  },
  {
    subject: {
      id: 'engels',
      name: 'Engels',
      slug: 'engels',
      description: 'Engelse taal en literatuur',
      color: '#6366f1',
      icon: 'language',
    },
    levels: ['middle-school', 'high-school', 'university'],
    curriculum: 'nl-vwo',
  },
  {
    subject: {
      id: 'economie',
      name: 'Economie',
      slug: 'economie',
      description: 'De studie van economische systemen',
      color: '#84cc16',
      icon: 'trending-up',
    },
    levels: ['high-school', 'university'],
    curriculum: 'nl-vwo',
  },
];

// US/International curriculum
const US_SUBJECTS: CurriculumSubject[] = [
  {
    subject: {
      id: 'physics',
      name: 'Physics',
      slug: 'physics',
      description: 'The study of matter, energy, and their interactions',
      color: '#3b82f6',
      icon: 'atom',
    },
    levels: ['middle-school', 'high-school', 'university'],
    curriculum: 'us-ap',
  },
  {
    subject: {
      id: 'mathematics',
      name: 'Mathematics',
      slug: 'mathematics',
      description: 'Mathematics and problem-solving',
      color: '#8b5cf6',
      icon: 'calculator',
    },
    levels: ['middle-school', 'high-school', 'university'],
    curriculum: 'us-ap',
  },
  {
    subject: {
      id: 'chemistry',
      name: 'Chemistry',
      slug: 'chemistry',
      description: 'The study of substances and chemical reactions',
      color: '#10b981',
      icon: 'flask',
    },
    levels: ['middle-school', 'high-school', 'university'],
    curriculum: 'us-ap',
  },
  {
    subject: {
      id: 'biology',
      name: 'Biology',
      slug: 'biology',
      description: 'The study of living organisms',
      color: '#22c55e',
      icon: 'leaf',
    },
    levels: ['middle-school', 'high-school', 'university'],
    curriculum: 'us-ap',
  },
  {
    subject: {
      id: 'history',
      name: 'History',
      slug: 'history',
      description: 'The study of the past',
      color: '#f59e0b',
      icon: 'scroll',
    },
    levels: ['middle-school', 'high-school', 'university'],
    curriculum: 'us-ap',
  },
  {
    subject: {
      id: 'geography',
      name: 'Geography',
      slug: 'geography',
      description: 'The study of the earth and its inhabitants',
      color: '#06b6d4',
      icon: 'globe',
    },
    levels: ['middle-school', 'high-school'],
    curriculum: 'us-ap',
  },
  {
    subject: {
      id: 'english',
      name: 'English',
      slug: 'english',
      description: 'English language and literature',
      color: '#ec4899',
      icon: 'book',
    },
    levels: ['middle-school', 'high-school', 'university'],
    curriculum: 'us-ap',
  },
  {
    subject: {
      id: 'economics',
      name: 'Economics',
      slug: 'economics',
      description: 'The study of economic systems',
      color: '#84cc16',
      icon: 'trending-up',
    },
    levels: ['high-school', 'university'],
    curriculum: 'us-ap',
  },
];

// Professional/University level subjects (additional)
const PROFESSIONAL_SUBJECTS: CurriculumSubject[] = [
  {
    subject: {
      id: 'data-science',
      name: 'Data Science',
      slug: 'data-science',
      description: 'Statistics, machine learning, and data analysis',
      color: '#6366f1',
      icon: 'database',
    },
    levels: ['university', 'professional'],
  },
  {
    subject: {
      id: 'programming',
      name: 'Programming',
      slug: 'programming',
      description: 'Software development and computer science',
      color: '#0ea5e9',
      icon: 'code',
    },
    levels: ['university', 'professional'],
  },
  {
    subject: {
      id: 'business',
      name: 'Business',
      slug: 'business',
      description: 'Business management and entrepreneurship',
      color: '#f97316',
      icon: 'briefcase',
    },
    levels: ['university', 'professional'],
  },
  {
    subject: {
      id: 'psychology',
      name: 'Psychology',
      slug: 'psychology',
      description: 'Human behavior and mental processes',
      color: '#a855f7',
      icon: 'brain',
    },
    levels: ['university', 'professional'],
  },
];

export const CURRICULUM_MAPPINGS: Record<string, CountryCurriculum> = {
  NL: {
    countryCode: 'NL',
    countryName: 'Netherlands',
    subjects: DUTCH_SUBJECTS,
  },
  BE: {
    countryCode: 'BE',
    countryName: 'Belgium',
    subjects: DUTCH_SUBJECTS,
  },
  DE: {
    countryCode: 'DE',
    countryName: 'Germany',
    subjects: US_SUBJECTS.map((s) => ({
      ...s,
      subject: { ...s.subject, id: `${s.subject.id}-de`, slug: `${s.subject.slug}-de` },
    })),
  },
  FR: {
    countryCode: 'FR',
    countryName: 'France',
    subjects: US_SUBJECTS.map((s) => ({
      ...s,
      subject: { ...s.subject, id: `${s.subject.id}-fr`, slug: `${s.subject.slug}-fr` },
    })),
  },
  ES: {
    countryCode: 'ES',
    countryName: 'Spain',
    subjects: US_SUBJECTS.map((s) => ({
      ...s,
      subject: { ...s.subject, id: `${s.subject.id}-es`, slug: `${s.subject.slug}-es` },
    })),
  },
  GB: {
    countryCode: 'GB',
    countryName: 'United Kingdom',
    subjects: US_SUBJECTS,
  },
  US: {
    countryCode: 'US',
    countryName: 'United States',
    subjects: US_SUBJECTS,
  },
  CA: {
    countryCode: 'CA',
    countryName: 'Canada',
    subjects: US_SUBJECTS,
  },
  AU: {
    countryCode: 'AU',
    countryName: 'Australia',
    subjects: US_SUBJECTS,
  },
  // Default to US subjects for other countries
  DEFAULT: {
    countryCode: 'DEFAULT',
    countryName: 'International',
    subjects: US_SUBJECTS,
  },
};

/**
 * Get available subjects for a country and educational level
 */
export function getSubjectsForCountryAndLevel(
  countryCode: string,
  level: EducationalLevel
): Subject[] {
  const curriculum = CURRICULUM_MAPPINGS[countryCode] || CURRICULUM_MAPPINGS.DEFAULT;
  
  return curriculum.subjects
    .filter((cs) => cs.levels.includes(level))
    .map((cs) => cs.subject);
}

/**
 * Get all available subjects for a country (all levels)
 */
export function getAllSubjectsForCountry(countryCode: string): Subject[] {
  const curriculum = CURRICULUM_MAPPINGS[countryCode] || CURRICULUM_MAPPINGS.DEFAULT;
  
  return curriculum.subjects.map((cs) => cs.subject);
}

/**
 * Get professional/university level subjects (country-agnostic)
 */
export function getProfessionalSubjects(): Subject[] {
  return PROFESSIONAL_SUBJECTS.map((cs) => cs.subject);
}
