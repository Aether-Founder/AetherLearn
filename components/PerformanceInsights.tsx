'use client';

import { useState, useEffect } from 'react';
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
import { Brain, TrendingDown, AlertTriangle, CheckCircle2, Target } from 'lucide-react';
import { useTranslation } from '@/lib/useTranslation';

interface Insight {
  id: string;
  type: 'strength' | 'weakness' | 'opportunity' | 'warning';
  title: string;
  description: string;
  subject: string;
  confidence: number;
  actionable: boolean;
}

interface PerformanceInsightsProps {
  userId: string;
}

export function PerformanceInsights({ userId }: PerformanceInsightsProps) {
  const { t } = useTranslation();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'strength' | 'weakness' | 'opportunity' | 'warning'>(
    'all'
  );

  useEffect(() => {
    fetchInsights();
  }, [userId]);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/analytics/insights', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setInsights(data.insights || []);
      }
    } catch (error) {
      console.error('Failed to fetch insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'strength':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'weakness':
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      case 'opportunity':
        return <Target className="w-5 h-5 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Brain className="w-5 h-5" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'strength':
        return 'border-green-500/50 bg-green-500/10';
      case 'weakness':
        return 'border-red-500/50 bg-red-500/10';
      case 'opportunity':
        return 'border-blue-500/50 bg-blue-500/10';
      case 'warning':
        return 'border-yellow-500/50 bg-yellow-500/10';
      default:
        return 'border-border';
    }
  };

  const getInsightBadge = (type: string) => {
    switch (type) {
      case 'strength':
        return (
          <Badge variant="default" className="bg-green-500">
            Sterkte
          </Badge>
        );
      case 'weakness':
        return <Badge variant="destructive">{t('shell_weakness')}</Badge>;
      case 'opportunity':
        return (
          <Badge variant="secondary" className="bg-blue-500 text-white">
            Kans
          </Badge>
        );
      case 'warning':
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-500">
            {t('perf_warning')}
          </Badge>
        );
      default:
        return <Badge variant="secondary">{t('perf_info')}</Badge>;
    }
  };

  const filteredInsights = filter === 'all' ? insights : insights.filter((i) => i.type === filter);

  const strengthCount = insights.filter((i) => i.type === 'strength').length;
  const weaknessCount = insights.filter((i) => i.type === 'weakness').length;
  const opportunityCount = insights.filter((i) => i.type === 'opportunity').length;
  const warningCount = insights.filter((i) => i.type === 'warning').length;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('shell_performance_insights')}</CardTitle>
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
        <h2 className="text-2xl font-bold">{t('shell_performance_insights')}</h2>
        <Select
          value={filter}
          onValueChange={(value: 'all' | 'strength' | 'weakness' | 'opportunity' | 'warning') =>
            setFilter(value)
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('shell_all')}</SelectItem>
            <SelectItem value="strength">{t('shell_strengths')}</SelectItem>
            <SelectItem value="weakness">{t('shell_weaknesses')}</SelectItem>
            <SelectItem value="opportunity">{t('shell_opportunities')}</SelectItem>
            <SelectItem value="warning">{t('shell_warnings')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t('shell_strengths')}</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{strengthCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t('shell_weaknesses')}</CardTitle>
            <TrendingDown className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weaknessCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t('shell_opportunities')}</CardTitle>
            <Target className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{opportunityCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t('shell_warnings')}</CardTitle>
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{warningCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {filteredInsights.map((insight) => (
          <Card key={insight.id} className={`border ${getInsightColor(insight.type)}`}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="mt-1">{getInsightIcon(insight.type)}</div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{insight.title}</h3>
                        {getInsightBadge(insight.type)}
                      </div>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <Badge variant="outline">{insight.subject}</Badge>
                    {insight.confidence && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{t('shell_confidence_colon')}</span>
                        <Progress value={insight.confidence} className="w-24 h-2" />
                        <span className="font-medium">{insight.confidence}%</span>
                      </div>
                    )}
                  </div>

                  {insight.actionable && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Target className="w-3 h-3" />
                      <span>{t('shell_action_recommended')}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredInsights.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">{t('shell_no_insights')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('insights_need_sessions')}
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Brain className="w-8 h-8 text-purple-500 mt-1" />
            <div>
              <h3 className="font-semibold mb-2">{t('shell_how_insights_work')}</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Sterktes: Onderwerpen waar je goed in presteert</li>
                <li>• {t('shell_tip_weaknesses')}</li>
                <li>• Kansen: Gebieden waar je snel vooruitgang kunt maken</li>
                <li>• {t('shell_tip_warnings')}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
