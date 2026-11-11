type GranularScore = 'good' | 'partial' | 'wrong' | 'not_done';

interface QuizPerformance {
  totalQuestions: number;
  correctCount: number;
  partialCount: number;
  wrongCount: number;
  notDoneCount: number;
  averageConfidence: number;
  averageTimePerQuestion: number;
  hintUsageRate: number;
}

interface MasteryResult {
  percentage: number;
  status: 'beheerst' | 'redelijk' | 'let_op' | 'gevaar';
  trend: 'up' | 'stable' | 'down';
  predictedScore: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export function calculateMastery(performance: QuizPerformance, previousMastery?: number): MasteryResult {
  // Calculate weighted score
  // Good = 100%, Partial = 50%, Wrong = 0%, Not done = 0%
  const weightedScore =
    (performance.correctCount * 1.0 +
     performance.partialCount * 0.5 +
     performance.wrongCount * 0.0 +
     performance.notDoneCount * 0.0) /
    performance.totalQuestions;

  // Adjust based on confidence (higher confidence = more reliable)
  const confidenceAdjustment = (performance.averageConfidence - 3) * 0.05; // -0.1 to +0.1
  const adjustedScore = Math.max(0, Math.min(1, weightedScore + confidenceAdjustment));

  // Adjust based on hint usage (using hints = lower mastery)
  const hintPenalty = performance.hintUsageRate * 0.1;
  const finalScore = Math.max(0, Math.min(1, adjustedScore - hintPenalty));

  const percentage = Math.round(finalScore * 100);

  // Determine status
  let status: 'beheerst' | 'redelijk' | 'let_op' | 'gevaar';
  if (percentage >= 85) status = 'beheerst';
  else if (percentage >= 65) status = 'redelijk';
  else if (percentage >= 40) status = 'let_op';
  else status = 'gevaar';

  // Determine trend
  let trend: 'up' | 'stable' | 'down';
  if (previousMastery === undefined) {
    trend = 'stable';
  } else if (percentage > previousMastery + 5) {
    trend = 'up';
  } else if (percentage < previousMastery - 5) {
    trend = 'down';
  } else {
    trend = 'stable';
  }

  // Predicted test score (similar to mastery but with time factor)
  const timeFactor = Math.min(1, 60 / performance.averageTimePerQuestion); // 60s is ideal
  const predictedScore = Math.round(finalScore * timeFactor * 100);

  // Risk level based on mastery and trend
  let riskLevel: 'low' | 'medium' | 'high';
  if (status === 'beheerst' && trend !== 'down') {
    riskLevel = 'low';
  } else if (status === 'gevaar' || trend === 'down') {
    riskLevel = 'high';
  } else {
    riskLevel = 'medium';
  }

  return {
    percentage,
    status,
    trend,
    predictedScore,
    riskLevel,
  };
}

export function generatePerformanceInsights(performance: QuizPerformance, mastery: MasteryResult): string[] {
  const insights: string[] = [];

  // Confidence insights
  if (performance.averageConfidence < 2) {
    insights.push('Je zekergheid is laag. Probeer om meer zeker te zijn van je antwoorden.');
  } else if (performance.averageConfidence > 4) {
    insights.push('Je hebt hoge zekergheid, maar let op: te zeker kunnen zijn overdreven.');
  }

  // Time insights
  if (performance.averageTimePerQuestion > 45) {
    insights.push('Je neemt meer tijd dan gemiddeld. Oefen met sneller beantwoorden.');
  } else if (performance.averageTimePerQuestion < 15) {
    insights.push('Je antwoordt erg snel. Let op dat je niet overhaalt.');
  }

  // Hint usage insights
  if (performance.hintUsageRate > 0.5) {
    insights.push('Je gebruikt vaak hints. Probeer vragen eerst zelf op te lossen.');
  }

  // Mastery-specific insights
  if (mastery.status === 'gevaar') {
    insights.push('Je meesterschap is laag. Overweeg om dit onderwerp opnieuw te bestuderen.');
  } else if (mastery.status === 'beheerst' && mastery.trend === 'up') {
    insights.push('Uitstekend! Je maakt snelle vooruitgang in dit onderwerp.');
  }

  // Risk insights
  if (mastery.riskLevel === 'high') {
    insights.push('Waarschuwing: Het risico op een laag toetscijfer is hoog.');
  }

  return insights;
}

export function calculatePredictedTestScore(
  subjectMastery: number,
  recentQuizScores: number[],
  testDifficulty: 'easy' | 'medium' | 'hard' = 'medium'
): number {
  // Weight recent quiz scores more heavily
  const weightedQuizScores = recentQuizScores.map((score, index) => {
    const weight = 1 + (index / recentQuizScores.length); // Later quizzes get higher weight
    return score * weight;
  });

  const averageQuizScore =
    weightedQuizScores.reduce((a, b) => a + b, 0) /
    weightedQuizScores.reduce((a, b) => a + 1, 0);

  // Adjust based on test difficulty
  const difficultyAdjustment: Record<string, number> = {
    easy: 0.1,
    medium: 0,
    hard: -0.1,
  };

  // Combine subject mastery with quiz performance
  const predictedScore = (subjectMastery * 0.4 + averageQuizScore * 0.6) +
    difficultyAdjustment[testDifficulty];

  return Math.round(Math.max(1, Math.min(10, predictedScore)));
}
