'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { useTranslation } from '@/lib/useTranslation';

interface TestWeekWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (testWeek: any) => void;
}

export function TestWeekWizard({ isOpen, onClose, onComplete }: TestWeekWizardProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  const availableSubjects = [
    { id: 'wiskunde', name: 'Wiskunde' },
    { id: 'scheikunde', name: 'Scheikunde' },
    { id: 'natuurkunde', name: 'Natuurkunde' },
    { id: 'biologie', name: 'Biologie' },
    { id: 'geschiedenis', name: 'Geschiedenis' },
    { id: 'aardrijkskunde', name: 'Aardrijkskunde' },
    { id: 'nederlands', name: 'Nederlands' },
    { id: 'engels', name: 'Engels' },
    { id: 'frans', name: 'Frans' },
    { id: 'duits', name: 'Duits' },
    { id: 'economie', name: 'Economie' },
    { id: 'maatschappijleer', name: 'Maatschappijleer' },
  ];

  const handleNext = () => {
    setError('');

    if (step === 1) {
      if (!name.trim()) {
        setError(t('shell_name_required'));
        return;
      }
      if (!startDate) {
        setError(t('shell_start_date_required'));
        return;
      }
      if (!endDate) {
        setError(t('shell_end_date_required'));
        return;
      }
      if (endDate < startDate) {
        setError(t('shell_end_after_start'));
        return;
      }
      setStep(2);
    } else if (step === 2) {
      handleCreate();
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleCreate = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error(t('shell_not_logged_in'));
      }

      const response = await fetch('/api/testweeks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          startDate: startDate!.toISOString().split('T')[0],
          endDate: endDate!.toISOString().split('T')[0],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('shell_create_failed'));
      }

      // Add selected subjects
      for (const subject of selectedSubjects) {
        await fetch(`/api/testweeks/${data.testWeek.id}/subjects`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            subjectId: subject,
            subjectName: availableSubjects.find((s) => s.id === subject)?.name,
          }),
        });
      }

      onComplete(data.testWeek);
      onClose();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('shell_generic_error'));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setName('');
    setStartDate(undefined);
    setEndDate(undefined);
    setSelectedSubjects([]);
    setError('');
  };

  const toggleSubject = (subjectId: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectId) ? prev.filter((id) => id !== subjectId) : [...prev, subjectId]
    );
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{step === 1 ? t('shell_new_testweek') : t('shell_select_subjects')}</DialogTitle>
          <DialogDescription>
            {step === 1
              ? t('shell_testweek_desc')
              : t('shell_select_subjects_testweek')}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">{t('shell_name')}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('shell_testweek_example')}
              />
            </div>

            <div>
              <Label>{t('shell_start_date')}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP', { locale: nl }) : t('shell_choose_date')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    locale={nl}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>{t('shell_end_date')}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'PPP', { locale: nl }) : t('shell_choose_date')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    locale={nl}
                    disabled={(date) => (startDate ? date < startDate : false)}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                {t('cancel')}
              </Button>
              <Button onClick={handleNext}>{t('next')}</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
              {availableSubjects.map((subject) => (
                <Button
                  key={subject.id}
                  variant={selectedSubjects.includes(subject.id) ? 'default' : 'outline'}
                  onClick={() => toggleSubject(subject.id)}
                  className="justify-start"
                >
                  {subject.name}
                </Button>
              ))}
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleBack} disabled={loading}>
                {t('previous')}
              </Button>
              <Button onClick={handleCreate} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('shell_creating')}
                  </>
                ) : (
                  t('shell_create')
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
