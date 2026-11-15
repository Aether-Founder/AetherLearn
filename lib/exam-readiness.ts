import { getI18n } from './i18n-client';
interface SubjectMastery {
  percentage: number;
  status: 'mastered' | 'fair' | 'attention' | 'danger';
  trend: 'up' | 'stable' | 'down';
}

interface StudyConsistency {
  daysStudied: number;
  averageDailyMinutes: number;
  streakDays: number;
}

interface TestInfo {
  date: Date;
  requiredGrade?: number;
  type: 'normal' | 'retake' | 'exam';
}

interface ReadinessResult {
  score: number;
  confidence: 'high' | 'medium' | 'low';
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

export function calculateExamReadiness(
  mastery: SubjectMastery,
  consistency: StudyConsistency,
  test: TestInfo
): ReadinessResult {
  const today = new Date();
  const daysUntilTest = Math.ceil((test.date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  // Factor 1: Mastery (40% weight)
  const masteryScore = mastery.percentage / 100;

  // Factor 2: Time remaining (30% weight)
  let timeScore = 1;
  if (daysUntilTest <= 0) {
    timeScore = 0;
  } else if (daysUntilTest < 7) {
    timeScore = 0.3;
  } else if (daysUntilTest < 14) {
    timeScore = 0.6;
  } else if (daysUntilTest < 30) {
    timeScore = 0.8;
  }

  // Factor 3: Study consistency (30% weight)
  const consistencyScore = Math.min(1, consistency.averageDailyMinutes / 60) * 0.5 +
                           Math.min(1, consistency.streakDays / 7) * 0.5;

  // Adjust for test type
  const typeMultiplier = test.type === 'exam' ? 0.9 : test.type === 'retake' ? 0.95 : 1;

  const readinessScore = (masteryScore * 0.4 + timeScore * 0.3 + consistencyScore * 0.3) * typeMultiplier;

  // Determine confidence level
  let confidence: 'high' | 'medium' | 'low';
  if (readinessScore >= 0.8) confidence = 'high';
  else if (readinessScore >= 0.5) confidence = 'medium';
  else confidence = 'low';

  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high';
  if (daysUntilTest < 7 && readinessScore < 0.5) {
    riskLevel = 'high';
  } else if (readinessScore < 0.3) {
    riskLevel = 'high';
  } else if (readinessScore < 0.6) {
    riskLevel = 'medium';
  } else {
    riskLevel = 'low';
  }

  // Generate recommendations
  const recommendations: string[] = [];

  if (mastery.status === 'danger') {
    recommendations.push(getI18n().t('er_low_mastery'));
  }

  if (consistency.averageDailyMinutes < 30) {
    recommendations.push(getI18n().t('er_increase_time'));
  }

  if (daysUntilTest < 7 && consistency.streakDays < 3) {
    recommendations.push(getI18n().t('er_build_streak'));
  }

  if (test.type === 'exam' && readinessScore < 0.7) {
    recommendations.push(getI18n().t('er_exam_prep'));
  }

  if (test.requiredGrade && mastery.percentage < test.requiredGrade * 10) {
    recommendations.push(getI18n().t('er_below_grade', undefined, { grade: test.requiredGrade }));
  }

  if (daysUntilTest > 14 && mastery.status === 'mastered') {
    recommendations.push(getI18n().t('er_well_prepared'));
  }

  return {
    score: Math.round(readinessScore * 100),
    confidence,
    riskLevel,
    recommendations,
  };
}

export function generateStudyPlan(
  testDate: Date,
  mastery: SubjectMastery,
  availableStudyTime: number // minutes per day
): {
  dailyStudyMinutes: number;
  prioritySubjects: string[];
  totalDays: number;
  recommendedSchedule: Array<{ date: string; subject: string; minutes: number }>;
} {
  const today = new Date();
  const totalDays = Math.ceil((testDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  // Calculate required daily study time based on mastery gap
  const masteryGap = 100 - mastery.percentage;
  const baseDailyMinutes = Math.max(30, Math.min(availableStudyTime, (masteryGap / 100) * 120));

  // Generate daily schedule
  const schedule: Array<{ date: string; subject: string; minutes: number }> = [];
  const subject = 'algemeen'; // Would be actual subject name in real implementation

  for (let i = 0; i < totalDays; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i + 1);
    schedule.push({
      date: date.toISOString().split('T')[0],
      subject,
      minutes: baseDailyMinutes,
    });
  }

  return {
    dailyStudyMinutes: baseDailyMinutes,
    prioritySubjects: [subject],
    totalDays,
    recommendedSchedule: schedule,
  };
}
