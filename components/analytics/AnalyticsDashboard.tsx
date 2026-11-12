'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2, Clock, Target } from 'lucide-react';
import { useTranslation } from '@/lib/useTranslation';

interface AnalyticsDashboardProps {
  mastery: {
    percentage: number;
    status: 'beheerst' | 'redelijk' | 'let_op' | 'gevaar';
    trend: 'up' | 'stable' | 'down';
    predictedScore: number;
    riskLevel: 'low' | 'medium' | 'high';
  };
  insights: string[];
  performance: {
    averageTimePerQuestion: number;
    averageConfidence: number;
    hintUsageRate: number;
  };
}

export function AnalyticsDashboard({ mastery, insights, performance }: AnalyticsDashboardProps) {
  const { t } = useTranslation();
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'beheerst': return 'text-green-500 bg-green-500/10';
      case 'redelijk': return 'text-yellow-500 bg-yellow-500/10';
      case 'let op': return 'text-orange-500 bg-orange-500/10';
      case 'gevaar': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'stable': return <Minus className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-red-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Mastery Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {t('comp_mastery_overview')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">Percentage</p>
              <p className="text-2xl font-semibold">{mastery.percentage}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-medium ${getStatusColor(mastery.status)}`}>
                {mastery.status.charAt(0).toUpperCase() + mastery.status.slice(1)}
              </span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Trend</p>
              <div className="flex items-center gap-1">
                {getTrendIcon(mastery.trend)}
                <span className="text-sm font-medium capitalize">{mastery.trend}</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('comp_risk')}</p>
              <p className={`text-sm font-medium ${getRiskColor(mastery.riskLevel)}`}>
                {mastery.riskLevel.charAt(0).toUpperCase() + mastery.riskLevel.slice(1)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Predicted Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            {t('comp_predicted_score')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold">{mastery.predictedScore}/10</div>
            <div className="text-sm text-muted-foreground">
              {t('comp_predicted_score_desc')}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t('comp_performance_metrics')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">{t('comp_avg_time_per_question')}</p>
              <p className="text-2xl font-semibold">{Math.round(performance.averageTimePerQuestion / 1000)}s</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('comp_avg_confidence')}</p>
              <p className="text-2xl font-semibold">{performance.averageConfidence.toFixed(1)}/5</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('comp_hint_usage')}</p>
              <p className="text-2xl font-semibold">{Math.round(performance.hintUsageRate * 100)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              {t('comp_performance_insights')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {insights.map((insight, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-primary mt-0.5">•</span>
                  <span className="text-muted-foreground">{insight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
