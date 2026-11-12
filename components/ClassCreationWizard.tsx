'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronLeft, ChevronRight, Users, Settings, Check } from 'lucide-react';
import { useTranslation } from '@/lib/useTranslation';

interface ClassCreationWizardProps {
  userId: string;
  onComplete?: (classId: string) => void;
  onCancel?: () => void;
}

export function ClassCreationWizard({ onComplete, onCancel }: ClassCreationWizardProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [classData, setClassData] = useState({
    name: '',
    description: '',
    subject: '',
    grade: '',
    schoolYear: '',
    isPublic: false,
    allowStudentJoin: true,
    requireApproval: false,
  });

  const steps = [
    { number: 1, title: t('shell_step_basic_info'), icon: Users },
    { number: 2, title: t('nav_settings'), icon: Settings },
    { number: 3, title: t('shell_overview'), icon: Check },
  ];

  const handleNext = () => {
    if (step < steps.length) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: classData.name,
          description: classData.description,
          subject: classData.subject,
          grade: classData.grade,
          schoolYear: classData.schoolYear,
          isPublic: classData.isPublic,
          allowStudentJoin: classData.allowStudentJoin,
          requireApproval: classData.requireApproval,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        onComplete?.(data.class.id);
      }
    } catch (error) {
      console.error('Failed to create class:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="name">{t('shell_class_name')}</Label>
        <Input
          id="name"
          value={classData.name}
          onChange={(e) => setClassData({ ...classData, name: e.target.value })}
          placeholder={t('shell_class_name_placeholder')}
        />
      </div>

      <div>
        <Label htmlFor="description">{t('shell_description')}</Label>
        <Textarea
          id="description"
          value={classData.description}
          onChange={(e) => setClassData({ ...classData, description: e.target.value })}
          placeholder={t('shell_desc_class_placeholder')}
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="subject">{t('shell_subject_required')}</Label>
        <Select
          value={classData.subject}
          onValueChange={(value) => setClassData({ ...classData, subject: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('shell_select_subject')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="wiskunde">{t('shell_math')}</SelectItem>
            <SelectItem value="natuurkunde">{t('shell_physics')}</SelectItem>
            <SelectItem value="scheikunde">{t('shell_chemistry')}</SelectItem>
            <SelectItem value="biologie">{t('shell_biology')}</SelectItem>
            <SelectItem value="geschiedenis">{t('shell_history')}</SelectItem>
            <SelectItem value="aardrijkskunde">{t('shell_geography')}</SelectItem>
            <SelectItem value="nederlands">{t('shell_dutch_lang')}</SelectItem>
            <SelectItem value="engels">{t('shell_english')}</SelectItem>
            <SelectItem value="frans">{t('shell_french')}</SelectItem>
            <SelectItem value="duits">{t('shell_german')}</SelectItem>
            <SelectItem value="economie">{t('shell_economics')}</SelectItem>
            <SelectItem value="overig">{t('shell_other')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="grade">{t('shell_class')}</Label>
          <Select
            value={classData.grade}
            onValueChange={(value) => setClassData({ ...classData, grade: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('shell_select_class')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1e Jaar</SelectItem>
              <SelectItem value="2">2e Jaar</SelectItem>
              <SelectItem value="3">3e Jaar</SelectItem>
              <SelectItem value="4">4e Jaar</SelectItem>
              <SelectItem value="5">5e Jaar</SelectItem>
              <SelectItem value="6">6e Jaar</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="schoolYear">{t('shell_school_year')}</Label>
          <Select
            value={classData.schoolYear}
            onValueChange={(value) => setClassData({ ...classData, schoolYear: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('shell_school_year')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024-2025">2024-2025</SelectItem>
              <SelectItem value="2025-2026">2025-2026</SelectItem>
              <SelectItem value="2026-2027">2026-2027</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isPublic"
            checked={classData.isPublic}
            onCheckedChange={(checked: boolean) =>
              setClassData({ ...classData, isPublic: checked })
            }
          />
          <Label htmlFor="isPublic" className="cursor-pointer">
            Maak klas openbaar (zoekbaar voor anderen)
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="allowStudentJoin"
            checked={classData.allowStudentJoin}
            onCheckedChange={(checked: boolean) =>
              setClassData({ ...classData, allowStudentJoin: checked })
            }
          />
          <Label htmlFor="allowStudentJoin" className="cursor-pointer">
            Sta leerlingen toe om zich aan te melden
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="requireApproval"
            checked={classData.requireApproval}
            onCheckedChange={(checked: boolean) =>
              setClassData({ ...classData, requireApproval: checked })
            }
            disabled={!classData.allowStudentJoin}
          />
          <Label htmlFor="requireApproval" className="cursor-pointer">
            Vereist goedkeuring voor aanmeldingen
          </Label>
        </div>
      </div>

      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">{t('shell_settings_info')}</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• {t('shell_tip_public_classes')}</li>
          <li>• {t('shell_tip_students_join')}</li>
          <li>• {t('shell_tip_approval')}</li>
        </ul>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="bg-muted/50 p-4 rounded-lg">
        <h3 className="font-semibold mb-3">{t('shell_overview')}</h3>
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium">{t('shell_name_colon')}</span> {classData.name}
          </div>
          <div>
            <span className="font-medium">{t('shell_description_colon')}</span> {classData.description || t('shell_none')}
          </div>
          <div>
            <span className="font-medium">{t('shell_subject_colon')}</span> {classData.subject}
          </div>
          <div>
            <span className="font-medium">{t('shell_class_colon')}</span> {classData.grade || t('shell_not_selected')}
          </div>
          <div>
            <span className="font-medium">{t('shell_school_year_colon')}</span>{' '}
            {classData.schoolYear || t('shell_not_selected')}
          </div>
          <div>
            <span className="font-medium">{t('shell_public_colon')}</span> {classData.isPublic ? t('shell_yes') : t('shell_no')}
          </div>
          <div>
            <span className="font-medium">{t('shell_students_allowed_colon')}</span>{' '}
            {classData.allowStudentJoin ? t('shell_yes') : t('shell_no')}
          </div>
          <div>
            <span className="font-medium">{t('shell_approval_required_colon')}</span>{' '}
            {classData.requireApproval ? t('shell_yes') : t('shell_no')}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{t('shell_class_wizard')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((s) => (
              <div key={s.number} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    step >= s.number
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-muted'
                  }`}
                >
                  <s.icon className="w-5 h-5" />
                </div>
                {s.number < steps.length && (
                  <div
                    className={`w-16 h-0.5 mx-2 ${step > s.number ? 'bg-primary' : 'bg-muted'}`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            {steps.map((s) => (
              <span key={s.number} className={step >= s.number ? 'text-primary font-medium' : ''}>
                {s.title}
              </span>
            ))}
          </div>
        </div>

        <div className="min-h-[300px]">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        <div className="flex justify-between mt-8">
          <div className="flex gap-2">
            {step > 1 && (
              <Button variant="outline" onClick={handlePrevious}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Vorige
              </Button>
            )}
            {onCancel && (
              <Button variant="ghost" onClick={onCancel}>
                Annuleren
              </Button>
            )}
          </div>

          {step < steps.length ? (
            <Button onClick={handleNext} disabled={!classData.name || !classData.subject}>
              {t('next')}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? t('shell_creating') : t('shell_create_class')}
              <Check className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
