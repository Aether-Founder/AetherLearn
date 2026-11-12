'use client';

import { useState, useEffect } from 'react';
import { AppShell, PageHeader } from '@/components/AppShell';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Calendar, Clock, Target, AlertTriangle, CheckCircle2, Trash2, Edit } from 'lucide-react';
import { useTranslation } from '@/lib/useTranslation';

interface Test {
  id: string;
  subject: string;
  date: string;
  type: 'normal' | 'herkansing' | 'examen';
  requiredGrade?: number;
  completed: boolean;
  actualGrade?: number;
}

interface StudyPlan {
  testId: string;
  dailyMinutes: number;
  prioritySubjects: string[];
  completedDays: number;
  totalDays: number;
}

export default function TestPlanningPage() {
  const { t } = useTranslation();
  const [tests, setTests] = useState<Test[]>([]);
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    subject: '',
    date: '',
    type: 'normal' as 'normal' | 'herkansing' | 'examen',
    requiredGrade: '',
  });

  useEffect(() => {
    loadTests();
    loadStudyPlans();
  }, []);

  const loadTests = () => {
    try {
      const stored = localStorage.getItem('aether_tests');
      if (stored) {
        setTests(JSON.parse(stored));
      }
    } catch {
      setTests([]);
    }
  };

  const loadStudyPlans = () => {
    try {
      const stored = localStorage.getItem('aether_study_plans');
      if (stored) {
        setStudyPlans(JSON.parse(stored));
      }
    } catch {
      setStudyPlans([]);
    }
  };

  const saveTests = (data: Test[]) => {
    try {
      localStorage.setItem('aether_tests', JSON.stringify(data));
    } catch {
      console.error('Failed to save tests');
    }
  };

  const saveStudyPlans = (data: StudyPlan[]) => {
    try {
      localStorage.setItem('aether_study_plans', JSON.stringify(data));
    } catch {
      console.error('Failed to save study plans');
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({
      subject: '',
      date: '',
      type: 'normal',
      requiredGrade: '',
    });
    setModalOpen(true);
  };

  const openEdit = (test: Test) => {
    setEditingId(test.id);
    setForm({
      subject: test.subject,
      date: test.date,
      type: test.type,
      requiredGrade: test.requiredGrade?.toString() || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newTest: Test = {
      id: editingId || `test_${Date.now()}`,
      subject: form.subject,
      date: form.date,
      type: form.type,
      requiredGrade: form.requiredGrade ? parseFloat(form.requiredGrade) : undefined,
      completed: false,
    };

    const updatedTests = editingId
      ? tests.map((test) => (test.id === editingId ? newTest : test))
      : [...tests, newTest];

    setTests(updatedTests);
    saveTests(updatedTests);

    // Generate study plan for new test
    if (!editingId) {
      generateStudyPlan(newTest);
    }

    setModalOpen(false);
  };

  const deleteTest = (id: string) => {
    const updated = tests.filter((test) => test.id !== id);
    setTests(updated);
    saveTests(updated);
    
    // Remove associated study plan
    const updatedPlans = studyPlans.filter((plan) => plan.testId !== id);
    setStudyPlans(updatedPlans);
    saveStudyPlans(updatedPlans);
  };

  const toggleComplete = (id: string) => {
    const updated = tests.map((test) =>
      test.id === id ? { ...test, completed: !test.completed } : test
    );
    setTests(updated);
    saveTests(updated);
  };

  const generateStudyPlan = (test: Test) => {
    const today = new Date();
    const testDate = new Date(test.date);
    const daysUntilTest = Math.ceil((testDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilTest <= 0) return;

    // Calculate daily study requirement based on mastery and time
    const dailyMinutes = Math.max(30, Math.min(120, 60 + (daysUntilTest < 7 ? 30 : 0)));

    const plan: StudyPlan = {
      testId: test.id,
      dailyMinutes,
      prioritySubjects: [test.subject],
      completedDays: 0,
      totalDays: daysUntilTest,
    };

    setStudyPlans((prev) => [...prev, plan]);
    saveStudyPlans([...studyPlans, plan]);
  };

  const calculateReadiness = (test: Test, plan?: StudyPlan): number => {
    if (test.completed && test.actualGrade !== undefined) {
      return Math.min(100, (test.actualGrade / 10) * 100);
    }

    const today = new Date();
    const testDate = new Date(test.date);
    const daysUntilTest = Math.ceil((testDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilTest <= 0) return 0;

    const planProgress = plan ? plan.completedDays / plan.totalDays : 0;
    const timeFactor = Math.min(1, daysUntilTest / 30); // More time = better readiness

    return Math.round(planProgress * 50 + timeFactor * 50);
  };

  const getReadinessColor = (score: number) => {
    if (score >= 80) return 'text-green-500 bg-green-500/10';
    if (score >= 50) return 'text-yellow-500 bg-yellow-500/10';
    return 'text-red-500 bg-red-500/10';
  };

  const getReadinessLabel = (score: number) => {
    if (score >= 80) return t('exam_status_ready');
    if (score >= 50) return t('exam_status_progress');
    return t('exam_status_not_ready');
  };

  const getTestTypeColor = (type: string) => {
    switch (type) {
      case 'examen': return 'text-red-500 bg-red-500/10';
      case 'herkansing': return 'text-orange-500 bg-orange-500/10';
      default: return 'text-blue-500 bg-blue-500/10';
    }
  };

  const getDaysUntilTest = (date: string) => {
    const today = new Date();
    const testDate = new Date(date);
    const diff = Math.ceil((testDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getRiskLevel = (test: Test, readiness: number): 'low' | 'medium' | 'high' => {
    if (test.completed) return 'low';
    const daysUntil = getDaysUntilTest(test.date);
    if (daysUntil < 7 && readiness < 50) return 'high';
    if (daysUntil < 14 && readiness < 30) return 'high';
    if (readiness < 20) return 'high';
    if (readiness < 50) return 'medium';
    return 'low';
  };

  const sortedTests = [...tests].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <AppShell>
      <PageHeader
        title={t('exam_title')}
        description={t('exam_description')}
        action={
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            {t('exam_new')}
          </Button>
        }
        actionPosition="right"
      />

      <div className="mt-10">
        {sortedTests.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="font-display text-xl font-semibold mb-2">{t('exam_empty')}</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {t('exam_empty_desc')}
            </p>
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              {t('exam_new')}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedTests.map((test) => {
              const plan = studyPlans.find((p) => p.testId === test.id);
              const readiness = calculateReadiness(test, plan);
              const daysUntil = getDaysUntilTest(test.date);
              const riskLevel = getRiskLevel(test, readiness);

              return (
                <div
                  key={test.id}
                  className={`rounded-xl border p-5 transition-colors ${
                    test.completed
                      ? 'border-border bg-muted/30 opacity-60'
                      : daysUntil < 0
                      ? 'border-red-500 bg-red-500/5'
                      : 'border-border bg-card'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className={`font-semibold text-lg ${test.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {test.subject}
                        </h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTestTypeColor(test.type)}`}>
                          {test.type === 'herkansing'
                            ? t('exam_type_retake')
                            : test.type === 'examen'
                              ? t('exam_type_exam')
                              : t('exam_type_normal')}
                        </span>
                        {test.requiredGrade && (
                          <span className="text-xs text-muted-foreground">
                            {t('exam_target', undefined, { grade: test.requiredGrade })}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(test.date).toLocaleDateString('nl-NL')}
                        </div>
                        {daysUntil >= 0 && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {t('exam_days_until', undefined, { n: daysUntil })}
                          </div>
                        )}
                        {test.completed && test.actualGrade && (
                          <div className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {test.actualGrade}/10
                          </div>
                        )}
                      </div>

                      {/* Readiness Score */}
                      {!test.completed && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{t('exam_preparation')}</span>
                            <span className={`text-sm font-medium ${getReadinessColor(readiness)}`}>
                              {getReadinessLabel(readiness)}
                            </span>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${readiness >= 80 ? 'bg-green-500' : readiness >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${readiness}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Study Plan */}
                      {plan && !test.completed && (
                        <div className="mb-3 p-3 rounded bg-secondary/50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">{t('exam_study_plan')}</span>
                            <span className="text-xs text-muted-foreground">
                              {t('exam_days_count', undefined, {
                                completed: plan.completedDays,
                                total: plan.totalDays,
                              })}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {t('exam_minutes_per_day', undefined, { n: plan.dailyMinutes })} · {plan.prioritySubjects.join(', ')}
                          </div>
                        </div>
                      )}

                      {/* Risk Assessment */}
                      {!test.completed && (
                        <div className={`p-3 rounded ${
                          riskLevel === 'high' ? 'bg-red-500/10 border border-red-500/30' :
                          riskLevel === 'medium' ? 'bg-yellow-500/10 border border-yellow-500/30' :
                          'bg-green-500/10 border border-green-500/30'
                        }`}>
                          <div className="flex items-center gap-2 text-sm">
                            {riskLevel === 'high' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                            {riskLevel === 'medium' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                            {riskLevel === 'low' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                            <span className="font-medium">
                              {riskLevel === 'high' ? t('exam_risk_high') : riskLevel === 'medium' ? t('exam_risk_medium') : t('exam_risk_low')}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(test)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTest(test.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? t('exam_edit_title') : t('exam_new_title')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="subject">{t('exam_field_subject')}</Label>
              <Input
                id="subject"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="date">{t('exam_field_date')}</Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="type">{t('exam_field_type')}</Label>
              <select
                id="type"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as 'normal' | 'herkansing' | 'examen' })}
                className="w-full h-10 rounded-md border border-input bg-background px-3"
              >
                <option value="normal">{t('exam_type_normal')}</option>
                <option value="herkansing">{t('exam_type_retake')}</option>
                <option value="examen">{t('exam_type_exam')}</option>
              </select>
            </div>
            <div>
              <Label htmlFor="requiredGrade">{t('exam_field_target')}</Label>
              <Input
                id="requiredGrade"
                type="number"
                min="1"
                max="10"
                step="0.1"
                value={form.requiredGrade}
                onChange={(e) => setForm({ ...form, requiredGrade: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                {t('cancel')}
              </Button>
              <Button type="submit">{editingId ? t('save') : t('add')}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
