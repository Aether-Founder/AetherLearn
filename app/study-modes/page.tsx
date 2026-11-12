'use client';

import { useState, useEffect } from 'react';
import { AppShell, PageHeader } from '@/components/AppShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Clock, AlertTriangle, Briefcase, Heart, Zap, Plane, Settings } from 'lucide-react';
import { StudyLoadManager } from '@/lib/study-load-manager';
import { useTranslation } from '@/lib/useTranslation';

type StudyMode = 'normal' | 'sick' | 'mvd' | 'catchup' | 'exam' | 'vacation' | 'custom';

interface StudyModeConfig {
  mode: StudyMode;
  name: string;
  description: string;
  icon: any;
  dailyLimitMinutes: number;
  priorityFilter: 'all' | 'urgent' | 'important' | 'normal';
  allowOverride: boolean;
}

interface StudyStats {
  todayMinutes: number;
  todayItems: number;
  streakDays: number;
  burnoutRisk: 'low' | 'medium' | 'high';
}

export default function StudyModesPage() {
  const { t } = useTranslation();
  const [currentMode, setCurrentMode] = useState<StudyMode>('normal');
  const [dailyLimit, setDailyLimit] = useState(60);
  const [stats, setStats] = useState<StudyStats>({
    todayMinutes: 0,
    todayItems: 0,
    streakDays: 0,
    burnoutRisk: 'low',
  });
  const [overrideWarning, setOverrideWarning] = useState(false);
  const [loadManager] = useState(() => new StudyLoadManager());

  const modeConfigs: Record<StudyMode, StudyModeConfig> = {
    normal: {
      mode: 'normal',
      name: t('mode_normal_name'),
      description: t('mode_normal_desc'),
      icon: Settings,
      dailyLimitMinutes: 60,
      priorityFilter: 'all',
      allowOverride: true,
    },
    sick: {
      mode: 'sick',
      name: t('mode_sick_name'),
      description: t('mode_sick_desc'),
      icon: Heart,
      dailyLimitMinutes: 15,
      priorityFilter: 'urgent',
      allowOverride: false,
    },
    mvd: {
      mode: 'mvd',
      name: 'Minimum Viable Day',
      description: t('mode_mvd_desc'),
      icon: Zap,
      dailyLimitMinutes: 30,
      priorityFilter: 'urgent',
      allowOverride: true,
    },
    catchup: {
      mode: 'catchup',
      name: t('mode_catchup_name'),
      description: t('mode_catchup_desc'),
      icon: Briefcase,
      dailyLimitMinutes: 120,
      priorityFilter: 'important',
      allowOverride: true,
    },
    exam: {
      mode: 'exam',
      name: t('mode_exam_name'),
      description: t('mode_exam_desc'),
      icon: AlertTriangle,
      dailyLimitMinutes: 90,
      priorityFilter: 'important',
      allowOverride: true,
    },
    vacation: {
      mode: 'vacation',
      name: t('mode_vacation_name'),
      description: t('mode_vacation_desc'),
      icon: Plane,
      dailyLimitMinutes: 20,
      priorityFilter: 'normal',
      allowOverride: true,
    },
    custom: {
      mode: 'custom',
      name: t('mode_custom_name'),
      description: t('mode_custom_desc'),
      icon: Settings,
      dailyLimitMinutes: dailyLimit,
      priorityFilter: 'all',
      allowOverride: true,
    },
  };

  useEffect(() => {
    loadSettings();
    loadStats();
  }, []);

  const loadSettings = () => {
    try {
      const stored = localStorage.getItem('aether_study_mode');
      if (stored) {
        const settings = JSON.parse(stored);
        setCurrentMode(settings.mode || 'normal');
        setDailyLimit(settings.dailyLimit || 60);
      }
    } catch {
      setCurrentMode('normal');
      setDailyLimit(60);
    }
  };

  const loadStats = () => {
    const currentStats = loadManager.getStats(dailyLimit);
    setStats({
      todayMinutes: currentStats.todayMinutes,
      todayItems: currentStats.todayItems,
      streakDays: currentStats.streakDays,
      burnoutRisk: currentStats.burnoutRisk,
    });
    setOverrideWarning(currentStats.overloadWarning);
  };

  const saveSettings = (mode: StudyMode, limit: number) => {
    try {
      localStorage.setItem('aether_study_mode', JSON.stringify({ mode, dailyLimit: limit }));
    } catch {
      console.error('Failed to save study mode settings');
    }
  };

  const selectMode = (mode: StudyMode) => {
    const config = modeConfigs[mode];
    setCurrentMode(mode);
    setDailyLimit(config.dailyLimitMinutes);
    saveSettings(mode, config.dailyLimitMinutes);
  };

  const updateDailyLimit = (limit: number) => {
    setDailyLimit(limit);
    saveSettings(currentMode, limit);
  };

  const recordStudySession = (minutes: number, items: number) => {
    loadManager.recordSession(minutes, items, currentMode);
    loadStats();
  };

  const getLoadPercentage = () => {
    return Math.min(100, (stats.todayMinutes / dailyLimit) * 100);
  };

  const getLoadColor = () => {
    const percentage = getLoadPercentage();
    if (percentage >= 90) return 'text-red-500 bg-red-500/10';
    if (percentage >= 70) return 'text-yellow-500 bg-yellow-500/10';
    return 'text-green-500 bg-green-500/10';
  };

  const getBurnoutColor = () => {
    switch (stats.burnoutRisk) {
      case 'high': return 'text-red-500 bg-red-500/10';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10';
      case 'low': return 'text-green-500 bg-green-500/10';
    }
  };

  const getBurnoutLabel = () => {
    switch (stats.burnoutRisk) {
      case 'high': return t('mode_burnout_high');
      case 'medium': return t('mode_burnout_medium');
      case 'low': return t('mode_burnout_low');
    }
  };

  const getLoadLabel = () => {
    const percentage = getLoadPercentage();
    if (percentage >= 90) return t('mode_load_overload');
    if (percentage >= 70) return t('mode_load_almost_full');
    if (percentage >= 50) return t('mode_load_normal');
    return t('mode_load_light');
  };

  return (
    <AppShell>
      <PageHeader
        title={t('mode_title')}
        description={t('mode_description')}
      />

      <div className="mt-10 space-y-6">
        {/* Current Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {t('mode_current_status')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">{t('mode_today_studied')}</p>
                <p className="text-2xl font-semibold">{stats.todayMinutes} min</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('mode_daily_limit')}</p>
                <p className="text-2xl font-semibold">{dailyLimit} min</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('mode_load_label')}</p>
                <span className={`inline-flex items-center px-2 py-1 rounded text-sm font-medium ${getLoadColor()}`}>
                  {getLoadLabel()}
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('mode_burnout_risk')}</p>
                <span className={`inline-flex items-center px-2 py-1 rounded text-sm font-medium ${getBurnoutColor()}`}>
                  {getBurnoutLabel()}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{t('mode_daily_progress')}</span>
                <span className="text-sm font-medium">{Math.round(getLoadPercentage())}%</span>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${getLoadPercentage() >= 90 ? 'bg-red-500' : getLoadPercentage() >= 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${getLoadPercentage()}%` }}
                />
              </div>
            </div>

            {/* Override Warning */}
            {getLoadPercentage() >= 90 && modeConfigs[currentMode].allowOverride && (
              <div className="mt-4 p-3 rounded bg-red-500/10 border border-red-500/30">
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="font-medium text-red-500">{t('mode_limit_warning')}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('mode_limit_warning_desc')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Study Mode Selection */}
        <Card>
          <CardHeader>
            <CardTitle>{t('mode_select_title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Object.values(modeConfigs).map((config) => {
                const Icon = config.icon;
                const isActive = currentMode === config.mode;
                return (
                  <button
                    key={config.mode}
                    type="button"
                    onClick={() => selectMode(config.mode)}
                    className={`p-4 rounded-lg border text-left transition-colors ${
                      isActive
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-foreground/30 hover:bg-secondary/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className="font-medium">{config.name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{config.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>
                        {t('mode_minutes_per_day', undefined, { n: config.dailyLimitMinutes })}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Custom Configuration */}
        {currentMode === 'custom' && (
          <Card>
            <CardHeader>
              <CardTitle>{t('mode_custom_config')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="customLimit">{t('mode_custom_limit_label')}</Label>
                  <Input
                    id="customLimit"
                    type="number"
                    min="5"
                    max="300"
                    value={dailyLimit}
                    onChange={(e) => updateDailyLimit(parseInt(e.target.value) || 60)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Load Recommendations */}
        {stats.burnoutRisk === 'high' && (
          <Card className="border-red-500 bg-red-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-500">
                <AlertTriangle className="h-5 w-5" />
                {t('mode_burnout_warning')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-3">
                {t('mode_burnout_warning_desc')}
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• {t('mode_tip1')}</li>
                <li>• {t('mode_tip2')}</li>
                <li>• {t('mode_tip3')}</li>
                <li>• {t('mode_tip4')}</li>
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Manual Session Recording */}
        <Card>
          <CardHeader>
            <CardTitle>{t('mode_record_session')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <Label htmlFor="sessionMinutes">{t('mode_minutes_label')}</Label>
                <Input
                  id="sessionMinutes"
                  type="number"
                  min="1"
                  max="300"
                  placeholder="30"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="sessionItems">{t('mode_items_done')}</Label>
                <Input
                  id="sessionItems"
                  type="number"
                  min="0"
                  placeholder="5"
                />
              </div>
              <Button
                onClick={() => {
                  const minutes = parseInt((document.getElementById('sessionMinutes') as HTMLInputElement)?.value || '0');
                  const items = parseInt((document.getElementById('sessionItems') as HTMLInputElement)?.value || '0');
                  if (minutes > 0) {
                    recordStudySession(minutes, items);
                    (document.getElementById('sessionMinutes') as HTMLInputElement).value = '';
                    (document.getElementById('sessionItems') as HTMLInputElement).value = '';
                  }
                }}
              >
                {t('mode_record')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
