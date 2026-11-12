'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, UserCheck, Clock, Users } from 'lucide-react';
import { useTranslation } from '@/lib/useTranslation';

interface ClassJoinProps {
  userId: string;
  onJoinSuccess?: (classId: string) => void;
}

interface Class {
  id: string;
  name: string;
  description: string;
  subject: string;
  teacherName: string;
  memberCount: number;
  isPublic: boolean;
  requiresApproval: boolean;
  joinCode?: string;
}

export function ClassJoin({ onJoinSuccess }: ClassJoinProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('code');
  const [joinCode, setJoinCode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [error, setError] = useState('');

  const handleJoinByCode = async () => {
    if (!joinCode.trim()) {
      setError(t('shell_enter_class_code'));
      return;
    }

    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/classes/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ joinCode: joinCode.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        onJoinSuccess?.(data.class.id);
      } else {
        setError(data.error || 'Kon niet deelnemen aan de klas');
      }
    } catch (error) {
      console.error('Failed to join class:', error);
      setError(t('shell_generic_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSearchClasses = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/classes/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setClasses(data.classes || []);
      }
    } catch (error) {
      console.error('Failed to search classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClass = async (classId: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/classes/${classId}/join`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        onJoinSuccess?.(classId);
      } else {
        setError(data.error || 'Kon niet deelnemen aan de klas');
      }
    } catch (error) {
      console.error('Failed to join class:', error);
      setError(t('shell_generic_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{t('shell_join_class')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="code">{t('shell_class_code')}</TabsTrigger>
            <TabsTrigger value="search">{t('shell_search')}</TabsTrigger>
          </TabsList>

          <TabsContent value="code" className="space-y-4">
            <div>
              <Label htmlFor="joinCode">{t('shell_class_code')}</Label>
              <Input
                id="joinCode"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder={t('shell_class_code_placeholder')}
                className="mt-2"
              />
            </div>

            {error && <div className="text-sm text-red-500">{error}</div>}

            <Button onClick={handleJoinByCode} disabled={loading} className="w-full">
              {loading ? t('loading') : t('shell_join')}
            </Button>

            <div className="text-sm text-muted-foreground">
              Vraag je docent om de klascode als je deze niet hebt.
            </div>
          </TabsContent>

          <TabsContent value="search" className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('shell_search_classes_placeholder')}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchClasses()}
              />
              <Button onClick={handleSearchClasses} disabled={loading}>
                <Search className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-3">
              {classes.length === 0 && searchQuery && !loading && (
                <div className="text-center text-muted-foreground py-8">{t('shell_no_classes')}</div>
              )}

              {classes.map((cls) => (
                <div key={cls.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{cls.name}</h3>
                      <p className="text-sm text-muted-foreground">{cls.description}</p>
                    </div>
                    <Badge variant="secondary">{cls.subject}</Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{cls.memberCount} leden</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <UserCheck className="w-4 h-4" />
                      <span>{cls.teacherName}</span>
                    </div>
                    {cls.requiresApproval && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{t('shell_approval_required')}</span>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => handleJoinClass(cls.id)}
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    {cls.requiresApproval ? t('shell_send_request') : t('shell_join')}
                  </Button>
                </div>
              ))}
            </div>

            {error && <div className="text-sm text-red-500">{error}</div>}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
