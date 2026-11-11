/**
 * Educational level definitions.
 * This enables support for multiple learning audiences while preserving
 * the existing Dutch middle school functionality.
 */

export type EducationalLevel = 'middle-school' | 'high-school' | 'university' | 'professional';

export interface EducationalLevelMeta {
  value: EducationalLevel;
  label: string;
  description: string;
  ageRange: string;
  icon: string;
  features: string[];
}

/**
 * Educational level registry with metadata for UI display and logic.
 */
export const EDUCATIONAL_LEVELS: readonly EducationalLevelMeta[] = [
  {
    value: 'middle-school',
    label: 'Middle School',
    description: 'Ages 12-15. Foundational concepts with visual learning and gamification.',
    ageRange: '12-15',
    icon: '🎒',
    features: [
      'Visual-heavy content',
      'Simple language',
      'Gamification emphasis',
      'Exam preparation',
      'Basic problem-solving',
    ],
  },
  {
    value: 'high-school',
    label: 'High School',
    description: 'Ages 15-18. Advanced concepts, subject specialization, and exam preparation.',
    ageRange: '15-18',
    icon: '📚',
    features: [
      'Abstract concepts',
      'Subject specialization',
      'Exam preparation',
      'Advanced problem-solving',
      'Curriculum alignment',
    ],
  },
  {
    value: 'university',
    label: 'University',
    description: 'Higher education. Theoretical depth, research-based learning, and interdisciplinary connections.',
    ageRange: '18+',
    icon: '🎓',
    features: [
      'Theoretical depth',
      'Research-based learning',
      'Interdisciplinary connections',
      'Self-directed study',
      'Academic writing support',
    ],
  },
  {
    value: 'professional',
    label: 'Professional',
    description: 'Career development. Practical skills, industry-specific terminology, and certifications.',
    ageRange: 'Any',
    icon: '💼',
    features: [
      'Practical application',
      'Industry-specific content',
      'Skill certifications',
      'Just-in-time learning',
      'Mobile-first microlearning',
    ],
  },
] as const;

/**
 * Default educational level for new users.
 * Keeping 'middle-school' as default preserves existing behavior.
 */
export const DEFAULT_EDUCATIONAL_LEVEL: EducationalLevel = 'middle-school';

/**
 * Check if a value is a valid educational level.
 */
export function isValidEducationalLevel(value: string): value is EducationalLevel {
  return EDUCATIONAL_LEVELS.some(level => level.value === value);
}

/**
 * Get metadata for an educational level.
 */
export function getEducationalLevelMeta(level: EducationalLevel): EducationalLevelMeta | undefined {
  return EDUCATIONAL_LEVELS.find(l => l.value === level);
}

/**
 * Get educational level from age (helper function).
 */
export function getLevelFromAge(age: number): EducationalLevel {
  if (age < 12) return 'middle-school';
  if (age < 15) return 'middle-school';
  if (age < 18) return 'high-school';
  if (age < 22) return 'university';
  return 'professional';
}
