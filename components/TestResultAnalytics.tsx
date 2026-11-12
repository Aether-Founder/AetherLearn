'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Clock, Target, BookOpen, Award, Download } from 'lucide-react';
import { useTranslation } from '@/lib/useTranslation';

interface TestResult {
  id: string;
  studySetId: string;
  studySetName: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  date: string;
  mode: 'test' | 'learn' | 'match';
}

interface TestAnalytics {
  totalTests: number;
  averageScore: number;
  bestScore: number;
  worstScore: number;
  averageTime: number;
  totalQuestions: number;
  totalCorrect: number;
  modeBreakdown: Array<{
    mode: string;
    count: number;
    averageScore: number;
  }>;
  subjectBreakdown: Array<{
    subject: string;
    averageScore: number;
    totalTests: number;
  }>;
  weeklyProgress: Array<{
    week: string;
    averageScore: number;
    testsTaken: number;
  }>;
  recentResults: TestResult[];
}

interface TestResultAnalyticsProps {
  userId: string;
}

export function TestResultAnalytics({ userId: _userId }: TestResultAnalyticsProps) {
  const { t } = useTranslation();
  const [analytics, setAnalytics] = useState<TestAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('all');

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/analytics/test-results?timeRange=${timeRange}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Failed to fetch test analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleExportResults = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/analytics/test-results/export?timeRange=${timeRange}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `test-results-${timeRange}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to export results:', error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('shell_test_results_analysis')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">{t('loading')}</div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('shell_test_results_analysis')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">{t('shell_no_results')}</div>
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (current < previous) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return null;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'test':
        return 'Test';
      case 'learn':
        return 'Leren';
      case 'match':
        return 'Match';
      default:
        return mode;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t('shell_test_results_analysis')}</h2>
        <div className="flex items-center gap-2">
          <Select
            value={timeRange}
            onValueChange={(value: 'week' | 'month' | 'all') => setTimeRange(value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">{t('shell_this_week')}</SelectItem>
              <SelectItem value="month">{t('shell_this_month')}</SelectItem>
              <SelectItem value="all">{t('shell_all')}</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExportResults} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exporteer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t('shell_total_tests')}</CardTitle>
            <BookOpen className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalTests}</div>
            <p className="text-xs text-muted-foreground">{t('shell_taken')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t('shell_avg_score')}</CardTitle>
            <Target className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(analytics.averageScore)}%</div>
            <p className="text-xs text-muted-foreground">{t('shell_class_average')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t('shell_best_score')}</CardTitle>
            <Award className="w-4 h-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {Math.round(analytics.bestScore)}%
            </div>
            <p className="text-xs text-muted-foreground">{t('shell_personal_record')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t('shell_avg_time')}</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(analytics.averageTime)}</div>
            <p className="text-xs text-muted-foreground">{t('shell_per_test')}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('shell_mode_overview')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.modeBreakdown.map((mode) => (
              <div key={mode.mode}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{getModeLabel(mode.mode)}</span>
                  <span className="text-sm font-bold">{Math.round(mode.averageScore)}%</span>
                </div>
                <Progress value={mode.averageScore} className="h-2" />
                <div className="text-xs text-muted-foreground mt-1">
                  {mode.count} tests afgenomen
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('shell_general_stats')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">{t('shell_total_questions')}</span>
              <Badge variant="secondary">{analytics.totalQuestions}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">{t('shell_correct_answers')}</span>
              <Badge variant="default">{analytics.totalCorrect}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">{t('shell_correctness')}</span>
              <Badge variant="outline">
                {Math.round((analytics.totalCorrect / analytics.totalQuestions) * 100)}%
              </Badge>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{t('shell_completion_rate')}</span>
                <span className="text-sm font-bold">{Math.round(analytics.averageScore)}%</span>
              </div>
              <Progress value={analytics.averageScore} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('shell_weekly_progress')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.weeklyProgress.map((week, index) => {
              const prevWeek = analytics.weeklyProgress[index - 1];
              const scoreTrend = prevWeek
                ? getTrendIcon(week.averageScore, prevWeek.averageScore)
                : null;

              return (
                <div
                  key={week.week}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium w-20">{week.week}</span>
                    <div className="flex items-center gap-2">
                      {scoreTrend}
                      <span className="text-sm">{Math.round(week.averageScore)}% score</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{week.testsTaken} tests</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('shell_recent_results')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.recentResults.map((result) => (
              <div
                key={result.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium truncate">{result.studySetName}</span>
                    <Badge variant="secondary">{getModeLabel(result.mode)}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(result.timeSpent)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      <span>
                        {result.correctAnswers}/{result.totalQuestions}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge
                    variant={
                      result.score >= 80
                        ? 'default'
                        : result.score >= 60
                          ? 'secondary'
                          : 'destructive'
                    }
                    className="text-lg px-3 py-1"
                  >
                    {Math.round(result.score)}%
                  </Badge>
                  <span className="text-xs text-muted-foreground">{formatDate(result.date)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
