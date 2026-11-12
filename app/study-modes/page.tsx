'use client';

import { useState, useEffect } from 'react';
import { AppShell, PageHeader } from '@/components/AppShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Clock, AlertTriangle, Briefcase, Heart, Zap, Plane, Settings } from 'lucide-react';
import { StudyLoadManager } from '@/lib/study-load-manager';

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
      name: 'Normaal',
      description: 'Standaard studeermodus met normale activiteiten',
      icon: Settings,
      dailyLimitMinutes: 60,
      priorityFilter: 'all',
      allowOverride: true,
    },
    sick: {
      mode: 'sick',
      name: 'Ziekte Modus',
      description: 'Minimale activiteiten om niet achter te raken',
      icon: Heart,
      dailyLimitMinutes: 15,
      priorityFilter: 'urgent',
      allowOverride: false,
    },
    mvd: {
      mode: 'mvd',
      name: 'Minimum Viable Day',
      description: 'Essentiële taken alleen',
      icon: Zap,
      dailyLimitMinutes: 30,
      priorityFilter: 'urgent',
      allowOverride: true,
    },
    catchup: {
      mode: 'catchup',
      name: 'Inhaal Modus',
      description: 'Verhoogde activiteit om achterstand weg te werken',
      icon: Briefcase,
      dailyLimitMinutes: 120,
      priorityFilter: 'important',
      allowOverride: true,
    },
    exam: {
      mode: 'exam',
      name: 'Examen Modus',
      description: 'Focus op herhaling, minder nieuwe content',
      icon: AlertTriangle,
      dailyLimitMinutes: 90,
      priorityFilter: 'important',
      allowOverride: true,
    },
    vacation: {
      mode: 'vacation',
      name: 'Vakantie Modus',
      description: 'Lichte onderhoudsactiviteiten',
      icon: Plane,
      dailyLimitMinutes: 20,
      priorityFilter: 'normal',
      allowOverride: true,
    },
    custom: {
      mode: 'custom',
      name: 'Aangepast',
      description: 'Je eigen configuratie',
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
      case 'high': return 'Hoog risico';
      case 'medium': return 'Middelmatig risico';
      case 'low': return 'Laag risico';
    }
  };

  const getLoadLabel = () => {
    const percentage = getLoadPercentage();
    if (percentage >= 90) return 'Overbelasting';
    if (percentage >= 70) return 'Bijna vol';
    if (percentage >= 50) return 'Normaal';
    return 'Licht';
  };

  return (
    <AppShell>
      <PageHeader
        title="Studie Modi"
        description="Kies een studiemodus om overbelasting te voorkomen en je studie aan te passen aan je situatie"
      />

      <div className="mt-10 space-y-6">
        {/* Current Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Huidige Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">Vandaag gestudeerd</p>
                <p className="text-2xl font-semibold">{stats.todayMinutes} min</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Daglimiet</p>
                <p className="text-2xl font-semibold">{dailyLimit} min</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Belasting</p>
                <span className={`inline-flex items-center px-2 py-1 rounded text-sm font-medium ${getLoadColor()}`}>
                  {getLoadLabel()}
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Burnout risico</p>
                <span className={`inline-flex items-center px-2 py-1 rounded text-sm font-medium ${getBurnoutColor()}`}>
                  {getBurnoutLabel()}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Dagelijkse voortgang</span>
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
                  <span className="font-medium text-red-500">Waarschuwing: Je bent bijna op je daglimiet</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Overweeg om te stoppen of overschrijf limiet indien nodig.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Study Mode Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Kies een Studiemodus</CardTitle>
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
                      <span>{config.dailyLimitMinutes} min/dag</span>
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
              <CardTitle>Aangepaste Configuratie</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="customLimit">Daglimiet (minuten)</Label>
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
                Burnout Waarschuwing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-3">
                Je hebt een hoog burnout risico op basis van je recente activiteit.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Overweeg om over te schakelen naar Ziekte Modus of Vakantie Modus</li>
                <li>• Verminder je dagelijkse studeertijd</li>
                <li>• Neem een pauze en focus op herstel</li>
                <li>• Prioriteer alleen essentiële taken</li>
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Manual Session Recording */}
        <Card>
          <CardHeader>
            <CardTitle>Sessie Opnemen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <Label htmlFor="sessionMinutes">Minuten</Label>
                <Input
                  id="sessionMinutes"
                  type="number"
                  min="1"
                  max="300"
                  placeholder="30"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="sessionItems">Items voltooid</Label>
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
                Opnemen
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
