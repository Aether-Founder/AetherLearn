'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Settings, Calendar as CalendarIcon } from 'lucide-react';
import { useTranslation } from '@/lib/useTranslation';

type CalendarView = 'day' | 'week' | 'workweek' | 'month' | 'agenda';
type FirstDayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

interface CalendarSettingsProps {
  userId: string;
}

export function CalendarSettings({ userId }: CalendarSettingsProps) {
  const { t } = useTranslation();
  const [defaultView, setDefaultView] = useState<CalendarView>('month');
  const [firstDayOfWeek, setFirstDayOfWeek] = useState<FirstDayOfWeek>(1);
  const [showWeekends, setShowWeekends] = useState(true);
  const [showWeekNumbers, setShowWeekNumbers] = useState(true);
  const [startHour, setStartHour] = useState(8);
  const [endHour, setEndHour] = useState(20);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [userId]);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/calendar/settings', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDefaultView(data.defaultView || 'month');
        setFirstDayOfWeek(data.firstDayOfWeek || 1);
        setShowWeekends(data.showWeekends !== false);
        setShowWeekNumbers(data.showWeekNumbers !== false);
        setStartHour(data.startHour || 8);
        setEndHour(data.endHour || 20);
      }
    } catch (error) {
      console.error('Failed to fetch calendar settings:', error);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/calendar/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          defaultView,
          firstDayOfWeek,
          showWeekends,
          showWeekNumbers,
          startHour,
          endHour,
        }),
      });

      if (response.ok) {
        // Settings saved successfully
      }
    } catch (error) {
      console.error('Failed to save calendar settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const weekDays = [
    { value: 0, label: t('shell_day_sunday') },
    { value: 1, label: t('shell_day_monday') },
    { value: 2, label: t('shell_day_tuesday') },
    { value: 3, label: t('shell_day_wednesday') },
    { value: 4, label: t('shell_day_thursday') },
    { value: 5, label: t('shell_day_friday') },
    { value: 6, label: t('shell_day_saturday') },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t('shell_agenda_settings')}</h2>
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? t('shell_saving') : t('save')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            {t('cal_view_settings')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('shell_default_view')}</label>
            <Select
              value={defaultView}
              onValueChange={(value: CalendarView) => setDefaultView(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">{t('shell_day')}</SelectItem>
                <SelectItem value="week">{t('shell_week')}</SelectItem>
                <SelectItem value="workweek">{t('shell_workweek')}</SelectItem>
                <SelectItem value="month">{t('shell_month')}</SelectItem>
                <SelectItem value="agenda">Agenda</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {t('cal_view_desc')}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t('shell_first_day_week')}</label>
            <Select
              value={firstDayOfWeek.toString()}
              onValueChange={(value) => setFirstDayOfWeek(parseInt(value) as FirstDayOfWeek)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {weekDays.map((day) => (
                  <SelectItem key={day.value} value={day.value.toString()}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {t('cal_first_day_desc')}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">{t('shell_show_weekend')}</label>
              <p className="text-xs text-muted-foreground">
                {t('cal_show_weekend_desc')}
              </p>
            </div>
            <Switch checked={showWeekends} onCheckedChange={setShowWeekends} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">{t('shell_show_week_numbers')}</label>
              <p className="text-xs text-muted-foreground">{t('shell_week_numbers_desc')}</p>
            </div>
            <Switch checked={showWeekNumbers} onCheckedChange={setShowWeekNumbers} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            {t('cal_work_hours')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('shell_start_hour')}</label>
            <Select
              value={startHour.toString()}
              onValueChange={(value) => setStartHour(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => i + 6).map((hour) => (
                  <SelectItem key={hour} value={hour.toString()}>
                    {hour.toString().padStart(2, '0')}:00
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{t('shell_start_hour_desc')}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t('shell_end_hour')}</label>
            <Select
              value={endHour.toString()}
              onValueChange={(value) => setEndHour(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => i + 12).map((hour) => (
                  <SelectItem key={hour} value={hour.toString()}>
                    {hour.toString().padStart(2, '0')}:00
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{t('shell_end_hour_desc')}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Settings className="w-8 h-8 text-blue-500 mt-1" />
            <div>
              <h3 className="font-semibold mb-2">{t('shell_about_agenda_settings')}</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• {t('calendar_setting_default_view')}</li>
                <li>• {t('shell_tip_first_day')}</li>
                <li>• {t('shell_tip_weekend')}</li>
                <li>• {t('calendar_setting_workhours')}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
