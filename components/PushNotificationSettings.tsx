'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Bell, BellOff, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useTranslation } from '@/lib/useTranslation';

interface PushNotificationSettingsProps {
  userId: string;
}

export function PushNotificationSettings({ userId: _userId }: PushNotificationSettingsProps) {
  const { t } = useTranslation();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [studyReminders, setStudyReminders] = useState(true);
  const [achievementAlerts, setAchievementAlerts] = useState(true);
  const [homeworkAlerts, setHomeworkAlerts] = useState(true);
  const [classUpdates, setClassUpdates] = useState(true);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      setNotificationsEnabled(result === 'granted');
    }
  };

  const sendTestNotification = () => {
    if (notificationsEnabled) {
      new Notification(t('notif_test'), {
        body: t('shell_test_notification'),
        icon: '/icon-192.png',
      });
    }
  };

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            {t('notif_enabled')}
          </Badge>
        );
      case 'denied':
        return (
          <Badge variant="destructive">
            <BellOff className="w-3 h-3 mr-1" />
            {t('notif_blocked')}
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <AlertTriangle className="w-3 h-3 mr-1" />
            {t('notif_not_set')}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t('shell_push_notifications')}</h2>
        {getPermissionStatus()}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            {t('notif_permission')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {permission === 'default' && (
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div>
                <p className="font-medium">{t('shell_enable_notifications')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('notif_enable_desc')}
                </p>
              </div>
              <Button onClick={requestPermission}>
                <Bell className="w-4 h-4 mr-2" />
                {t('notif_enable_btn')}
              </Button>
            </div>
          )}

          {permission === 'granted' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-medium">{t('shell_notifications_enabled')}</p>
                    <p className="text-sm text-muted-foreground">
                      {t('notif_receiving')}
                    </p>
                  </div>
                </div>
                <Button variant="outline" onClick={sendTestNotification}>
                  {t('notif_test')}
                </Button>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">{t('shell_notification_types')}</h3>

                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">{t('shell_study_reminders')}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('notif_session_reminders')}
                    </p>
                  </div>
                  <Switch checked={studyReminders} onCheckedChange={setStudyReminders} />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">{t('shell_achievement_alerts')}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('notif_achievement_desc')}
                    </p>
                  </div>
                  <Switch checked={achievementAlerts} onCheckedChange={setAchievementAlerts} />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">{t('shell_homework_alerts')}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('notif_homework_reminders')}
                    </p>
                  </div>
                  <Switch checked={homeworkAlerts} onCheckedChange={setHomeworkAlerts} />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">{t('shell_class_updates')}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('notif_class_desc')}
                    </p>
                  </div>
                  <Switch checked={classUpdates} onCheckedChange={setClassUpdates} />
                </div>
              </div>
            </div>
          )}

          {permission === 'denied' && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
              <div className="flex items-start gap-3">
                <BellOff className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <p className="font-medium">{t('shell_notifications_blocked')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('notif_blocked_desc')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Bell className="w-8 h-8 text-blue-500 mt-1" />
            <div>
              <h3 className="font-semibold mb-2">{t('shell_about_push')}</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• {t('shell_tip_push_study')}</li>
                <li>• {t('shell_tip_push_achievement')}</li>
                <li>• {t('shell_tip_push_class')}</li>
                <li>• {t('shell_tip_push_customize')}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
