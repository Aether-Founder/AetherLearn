'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Clock, TrendingUp, Brain, Target, Zap } from 'lucide-react';
import { useTranslation } from '@/lib/useTranslation';

interface AdaptiveSchedule {
  id: string;
  subject: string;
  topic: string;
  recommendedTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  confidence: number;
  priority: number;
  scheduledDate: string;
}

interface AdaptiveSchedulingProps {
  userId: string;
  onScheduleSession?: (scheduleId: string) => void;
}

export function AdaptiveScheduling({
  userId: _userId,
  onScheduleSession,
}: AdaptiveSchedulingProps) {
  const { t } = useTranslation();
  const [schedules, setSchedules] = useState<AdaptiveSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
  const [sortBy, setSortBy] = useState<'priority' | 'difficulty' | 'confidence'>('priority');

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/studyplans/adaptive?timeRange=${timeRange}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSchedules(data.schedules || []);
      }
    } catch (error) {
      console.error('Failed to fetch adaptive schedules:', error);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'hard':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getSortedSchedules = () => {
    const sorted = [...schedules];
    switch (sortBy) {
      case 'priority':
        return sorted.sort((a, b) => b.priority - a.priority);
      case 'difficulty':
        const difficultyOrder = { hard: 3, medium: 2, easy: 1 };
        return sorted.sort((a, b) => difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty]);
      case 'confidence':
        return sorted.sort((a, b) => a.confidence - b.confidence);
      default:
        return sorted;
    }
  };

  const totalStudyTime = schedules.reduce((sum, s) => sum + s.recommendedTime, 0);
  const averageConfidence =
    schedules.length > 0
      ? Math.round(schedules.reduce((sum, s) => sum + s.confidence, 0) / schedules.length)
      : 0;
  const highPriorityCount = schedules.filter((s) => s.priority >= 8).length;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('shell_adaptive_scheduling')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">{t('loading')}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t('shell_adaptive_scheduling')}</h2>
        <div className="flex items-center gap-2">
          <Select
            value={timeRange}
            onValueChange={(value: 'week' | 'month') => setTimeRange(value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">{t('shell_this_week')}</SelectItem>
              <SelectItem value="month">{t('shell_this_month')}</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={sortBy}
            onValueChange={(value: 'priority' | 'difficulty' | 'confidence') => setSortBy(value)}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="priority">{t('shell_priority')}</SelectItem>
              <SelectItem value="difficulty">{t('shell_difficulty')}</SelectItem>
              <SelectItem value="confidence">{t('shell_confidence')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t('shell_total_study_time')}</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(totalStudyTime / 60)}u</div>
            <p className="text-xs text-muted-foreground">{totalStudyTime % 60}m aanbevolen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t('shell_avg_confidence')}</CardTitle>
            <Brain className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageConfidence}%</div>
            <p className="text-xs text-muted-foreground">{t('shell_progress_lower')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t('shell_high_priority')}</CardTitle>
            <Target className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highPriorityCount}</div>
            <p className="text-xs text-muted-foreground">{t('shell_subjects_lower')}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            AI-Aanbevelingen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {getSortedSchedules().map((schedule) => (
            <div
              key={schedule.id}
              className="p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => onScheduleSession?.(schedule.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{schedule.subject}</span>
                    <Badge variant="secondary">{schedule.topic}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(schedule.scheduledDate).toLocaleDateString('nl-NL')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{schedule.recommendedTime} min</span>
                    </div>
                  </div>
                </div>
                <div
                  className={`w-3 h-3 rounded-full ${getDifficultyColor(schedule.difficulty)}`}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('shell_confidence')}</span>
                  <span className="font-medium">{schedule.confidence}%</span>
                </div>
                <Progress value={schedule.confidence} className="h-2" />

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('shell_priority')}</span>
                  <span className="font-medium">{schedule.priority}/10</span>
                </div>
                <Progress value={schedule.priority * 10} className="h-2" />
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <TrendingUp className="w-3 h-3" />
                  <span>
                    {schedule.confidence < 50
                      ? t('shell_practice_recommended')
                      : schedule.confidence < 75
                        ? t('shell_strengthening_needed')
                        : t('shell_ready_for_test')}
                  </span>
                </div>
                <Badge variant={schedule.priority >= 8 ? 'default' : 'outline'}>
                  {schedule.priority >= 8 ? t('shell_priority_high') : schedule.priority >= 5 ? t('shell_priority_medium') : t('shell_priority_low')}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {schedules.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">{t('shell_no_recommendations')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('adaptive_need_sessions')}
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Zap className="w-8 h-8 text-blue-500 mt-1" />
            <div>
              <h3 className="font-semibold mb-2">{t('shell_how_adaptive_works')}</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• {t('shell_tip_ai_analysis')}</li>
                <li>• {t('tip_priority_hard')}</li>
                <li>• {t('tip_auto_adjust')}</li>
                <li>• {t('tip_time_optimize')}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
