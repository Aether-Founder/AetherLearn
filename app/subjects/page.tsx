'use client';

import Link from 'next/link';
import { AppShell, PageHeader, Meter } from '@/components/AppShell';
import { useUser, useUserProfile } from '@/hooks/useAuth';
import { useTranslation } from '@/lib/useTranslation';
import { useEffect, useMemo, useState } from 'react';
import { GradeOnboardingModal } from '@/components/GradeOnboardingModal';
import { Plus, BookOpen, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase/client';
import ButtonSection from '@/components/ButtonSection';
import { useFilesystem } from '@/hooks/useFilesystem';

type Subject = {
  id: string;
  name: string;
  code?: string;
  color: string;
  icon: string;
  description?: string;
  teacher?: string;
  exam_relevance: string;
  mastery_percentage?: number;
  status?: string;
  upcoming_tests?: number;
  average_grade?: number;
  chapter_count?: number;
  set_count?: number;
  topics_done?: number;
  topics_total?: number;
  due_cards?: number;
};

type SubjectForm = {
  name: string;
  color: string;
  description: string;
  teacher: string;
};

const DEFAULT_SUBJECTS = [
  'Aardrijkskunde',
  'Bewegen, Sport en Maatschappij',
  'Biologie',
  'Culturele en Kunstzinnige Vorming',
  'Decanaat',
  'Duits',
  'Economie',
  'Engels',
  'Frans',
  'Geschiedenis',
  'Informatica',
  'Kunst Muziek',
  'Kunst Beeldende Vorming',
  'Lichamelijke Opvoeding',
  'Levensbeschouwing',
  'Mentoraat',
  'Natuurkunde',
  'Nederlands',
  'Scheikunde',
  'Wiskunde A',
  'Wiskunde B',
  'Wiskunde D',
];
const REQUIRED_SUBJECTS = ['Nederlands', 'Levensbeschouwing', 'Maatschappijleer', 'Engels'];
const PROFILE_SUBJECTS: Record<string, string[]> = {
  'Natuur & Techniek': ['Natuurkunde', 'Scheikunde', 'Wiskunde B', 'Wiskunde D', 'Informatica'],
  'Natuur & Gezondheid': ['Biologie', 'Scheikunde', 'Wiskunde A', 'Natuurkunde'],
  'Economie & Maatschappij': ['Economie', 'Wiskunde A', 'Geschiedenis', 'Aardrijkskunde'],
  'Cultuur & Maatschappij': [
    'Geschiedenis',
    'Aardrijkskunde',
    'Frans',
    'Duits algemeen',
    'Kunst BV',
  ],
};

function SubjectSkeleton() {
  return (
    <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 9 }, (_, index) => (
        <div key={index} className="bg-background p-6">
          <div className="skeleton-line h-3 w-20 rounded"></div>
          <div className="skeleton-line mt-2 h-7 w-3/4 rounded"></div>
          <div className="skeleton-line mt-1 h-3 w-1/2 rounded"></div>
          <div className="skeleton-line mt-5 h-2 w-full rounded"></div>
          <div className="skeleton-line mt-4 h-3 w-2/3 rounded"></div>
        </div>
      ))}
    </div>
  );
}

function SubjectTile({
  subject,
  onHide,
  onPrioritize,
}: {
  subject: Subject;
  onHide: () => void;
  onPrioritize: () => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const mastery = subject.mastery_percentage || 0;
  const topicsDone = subject.topics_done || 0;
  const topicsTotal = subject.topics_total || 0;
  const chapterCount = subject.chapter_count || 0;
  const setCount = subject.set_count || 0;
  const dueCards = subject.due_cards || 0;

  return (
    <div
      className="relative bg-background transition-colors hover:bg-secondary/50"
      onContextMenu={(event) => {
        event.preventDefault();
        setOpen(true);
      }}
    >
      <Link
        href={`/subjects/${subject.id}`}
        className="flex h-full flex-col p-6"
      >
        <h2 className="font-display text-2xl font-semibold">{subject.name}</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {t('subject_chapters_sets', undefined, { chapters: chapterCount, sets: setCount })}{subject.teacher ? ` · ${subject.teacher}` : ''}
        </p>

        <div className="mt-5">
          <div className="mb-1.5 flex items-baseline justify-between text-xs text-muted-foreground">
            <span>
              {t('subject_topics_progress', undefined, { done: topicsDone, total: topicsTotal })}
            </span>
            <span className="tabular-nums">{mastery}%</span>
          </div>
          <Meter value={mastery} />
        </div>

        {dueCards > 0 && (
          <p className="mt-4 text-xs text-muted-foreground">
            {t('subject_due', undefined, { due: dueCards })}
          </p>
        )}
      </Link>

      {open && (
        <div
          className="absolute right-4 top-4 z-20 w-36 rounded-md border border-border bg-background p-1 text-xs shadow-lg"
          onMouseLeave={() => setOpen(false)}
        >
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onPrioritize();
              setOpen(false);
            }}
            className="w-full rounded px-2 py-1.5 text-left hover:bg-secondary"
          >
            {t('subject_show_on_top')}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onHide();
              setOpen(false);
            }}
            className="w-full rounded px-2 py-1.5 text-left hover:bg-secondary"
          >
            {t('subject_hide')}
          </button>
        </div>
      )}
    </div>
  );
}

export default function VakkenIndex() {
  const { t } = useTranslation();
  const { user, loading: userLoading } = useUser();
  const { profile, loading: profileLoading } = useUserProfile();
  const { createNode } = useFilesystem();
  const [ready, setReady] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const [showAll, setShowAll] = useState(true);
  const [hidden, setHidden] = useState<string[]>([]);
  const [prioritized, setPrioritized] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<SubjectForm>({
    name: '',
    color: '#3b82f6',
    description: '',
    teacher: '',
  });
  const [saving, setSaving] = useState(false);
  const [secretSubjects, setSecretSubjects] = useState<Subject[]>([]);
  const [verifiedCodes, setVerifiedCodes] = useState<Set<string>>(new Set());
  const [verifyingCode, setVerifyingCode] = useState(false);

  const preferenceKey = user
    ? `aether-subject-preferences:${user.id}`
    : 'aether-subject-preferences:guest';

  useEffect(() => {
    if (userLoading || profileLoading) return;
    try {
      const stored = JSON.parse(localStorage.getItem(preferenceKey) || '{}');
      setHidden(Array.isArray(stored.hidden) ? stored.hidden : []);
      setPrioritized(Array.isArray(stored.prioritized) ? stored.prioritized : []);
    } catch {
      /* Use default catalog. */
    }
    setSetupOpen(
      Boolean(
        user &&
        localStorage.getItem(`aether-grade-setup-complete:${user.id}`) !== 'true' &&
        !profile?.grade_level
      )
    );
    setReady(true);
  }, [user, userLoading, profile?.grade_level, profileLoading, preferenceKey]);

  // Load verified codes from localStorage
  useEffect(() => {
    if (!user) return;
    try {
      const stored = localStorage.getItem(`aether-verified-codes:${user.id}`);
      if (stored) {
        setVerifiedCodes(new Set(JSON.parse(stored)));
      }
    } catch {
      setVerifiedCodes(new Set());
    }
  }, [user]);

  // Load secret subjects from JSON
  useEffect(() => {
    const loadSecretSubjects = async () => {
      try {
        const response = await fetch('/api/admin/secret-subjects');
        const data = await response.json();
        const secretSubjectsList = data.secretSubjects || [];

        // Check user's approval status for each secret subject
        if (user) {
          const { data: accessData, error } = await (supabase as any)
            .from('secret_subject_access')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'approved');

          if (!error && accessData) {
            const approvedSubjectIds = new Set(accessData.map((a: any) => a.secret_subject_id));
            const approvedSubjects = secretSubjectsList.filter((s: any) =>
              approvedSubjectIds.has(s.id) && verifiedCodes.has(s.code)
            );
            setSecretSubjects(approvedSubjects);
          }
        }
      } catch (error) {
        console.error('Error loading secret subjects:', error);
      }
    };

    if (user && verifiedCodes.size > 0) {
      loadSecretSubjects();
    }
  }, [user, verifiedCodes]);

  useEffect(() => {
    if (ready) localStorage.setItem(preferenceKey, JSON.stringify({ hidden, prioritized }));
  }, [hidden, prioritized, ready, preferenceKey]);

  const loadSubjects = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('subjects')
        .select(
          `
          id,
          name,
          slug,
          code,
          color,
          icon,
          description,
          teacher,
          exam_relevance,
          subject_chapters (
            id,
            subject_topics (
              id,
              mastery_tracking (
                mastery_percentage,
                status
              )
            )
          ),
          study_sets (
            id
          ),
          subject_tests (
            test_date
          ),
          subject_grades (
            grade
          )
        `
        )
        .eq('user_id', user.id);

      if (error) throw error;

      if (data && data.length > 0) {
        const processedSubjects = data.map((subject: any) => {
          // Calculate average mastery
          let totalMastery = 0;
          let masteryCount = 0;
          let topicsDone = 0;
          let topicsTotal = 0;
          
          subject.subject_chapters?.forEach((chapter: any) => {
            chapter.subject_topics?.forEach((topic: any) => {
              topicsTotal++;
              if (topic.mastery_tracking) {
                totalMastery += topic.mastery_tracking.mastery_percentage || 0;
                masteryCount++;
                if (topic.mastery_tracking.mastery_percentage >= 80) {
                  topicsDone++;
                }
              }
            });
          });
          
          const avgMastery = masteryCount > 0 ? Math.round(totalMastery / masteryCount) : 0;
          const chapterCount = subject.subject_chapters?.length || 0;
          const setCount = subject.study_sets?.length || 0;

          // Count upcoming tests
          const now = new Date();
          const upcomingTests =
            subject.subject_tests?.filter((test: any) => new Date(test.test_date) >= now).length ||
            0;

          // Calculate average grade
          const grades = subject.subject_grades?.map((g: any) => g.grade) || [];
          const avgGrade =
            grades.length > 0
              ? (grades.reduce((a: number, b: number) => a + b, 0) / grades.length).toFixed(1)
              : undefined;

          // Estimate due cards (placeholder logic)
          const dueCards = Math.max(0, Math.floor((100 - avgMastery) / 10));

          return {
            ...subject,
            mastery_percentage: avgMastery,
            upcoming_tests: upcomingTests,
            average_grade: avgGrade,
            chapter_count: chapterCount,
            set_count: setCount,
            topics_done: topicsDone,
            topics_total: topicsTotal,
            due_cards: dueCards,
          };
        });
        setSubjects(processedSubjects);
      } else {
        // No subjects in DB, use defaults
        const defaultSubjects = DEFAULT_SUBJECTS.map((name) => ({
          id: name,
          name,
          color: '#3b82f6',
          icon: 'BookOpen',
          exam_relevance: 'normaal',
          mastery_percentage: 0,
          chapter_count: 0,
          set_count: 0,
          topics_done: 0,
          topics_total: 0,
          due_cards: 0,
        }));
        setSubjects(defaultSubjects);
      }
    } catch (error) {
      console.error('Error loading subjects:', error);
      // Fallback to defaults
      const defaultSubjects = DEFAULT_SUBJECTS.map((name) => ({
        id: name,
        name,
        color: '#3b82f6',
        icon: 'BookOpen',
        exam_relevance: 'normaal',
        mastery_percentage: 0,
        chapter_count: 0,
        set_count: 0,
        topics_done: 0,
        topics_total: 0,
        due_cards: 0,
      }));
      setSubjects(defaultSubjects);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, [user]);

  const prioritizedByProfile = profile?.track ? PROFILE_SUBJECTS[profile.track] || [] : [];
  const visible = useMemo(
    () => subjects.filter((subject) => !hidden.includes(subject.name)),
    [subjects, hidden]
  );
  const selected = visible.filter(
    (subject) =>
      prioritized.includes(subject.name) ||
      prioritizedByProfile.includes(subject.name) ||
      REQUIRED_SUBJECTS.includes(subject.name)
  );
  const display = showAll ? visible : selected;
  const complete = async (grade: string, track: string | null, subjects: string[]) => {
    if (user) {
      localStorage.setItem(`aether-grade-setup-complete:${user.id}`, 'true');
      localStorage.setItem('user_selected_subjects', JSON.stringify(subjects));

      // Create selected subjects in the database
      for (const subjectName of subjects) {
        try {
          await supabase.from('subjects').insert({
            user_id: user.id,
            name: subjectName,
            slug: subjectName.toLowerCase().replace(/\s+/g, '-'),
            color: '#3b82f6',
          });
        } catch (error) {
          console.error('Error creating subject:', subjectName, error);
        }
      }
    }
    setSetupOpen(false);
    // Reload subjects to show newly created ones
    if (user) {
      loadSubjects();
    }
  };

  const createSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.name.trim()) return;

    const inputName = form.name.trim();

    // Check if input is a secret code
    setVerifyingCode(true);
    setSaving(true);

    try {
      // Add delay for security
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Load secret subjects to check for code match
      const response = await fetch('/api/admin/secret-subjects');
      const data = await response.json();
      const secretSubjectsList = data.secretSubjects || [];

      const matchingSecret = secretSubjectsList.find((s: any) => s.code === inputName);

      if (matchingSecret) {
        // Code matches - save to localStorage and request access
        const newVerifiedCodes = new Set(verifiedCodes);
        newVerifiedCodes.add(matchingSecret.code);
        setVerifiedCodes(newVerifiedCodes);
        localStorage.setItem(`aether-verified-codes:${user.id}`, JSON.stringify([...newVerifiedCodes]));

        // Create access request in Supabase
        const { error: accessError } = await (supabase as any)
          .from('secret_subject_access')
          .insert({
            user_id: user.id,
            secret_subject_id: matchingSecret.id,
            access_code: matchingSecret.code,
            status: 'pending',
          });

        if (accessError) {
          console.error('Error creating access request:', accessError);
        }

        alert(t('subject_secret_code_verified'));
        setCreateOpen(false);
        setForm({
          name: '',
          color: '#3b82f6',
          description: '',
          teacher: '',
        });
        return;
      }

      // Normal subject creation
      const { data: subjectData, error } = await supabase.from('subjects').insert({
        user_id: user.id,
        name: inputName,
        slug: inputName.toLowerCase().replace(/\s+/g, '-'),
        color: form.color,
        icon: 'BookOpen',
      }).select().single();

      if (error) throw error;

      // Sync to filesystem
      if (subjectData) {
        await createNode('subject', subjectData.name, 'root', {
          subject: {
            id: subjectData.id,
            name: subjectData.name,
            slug: subjectData.slug,
            color: subjectData.color,
            icon: subjectData.icon,
            description: form.description,
          },
        });
      }

      // Reload subjects
      loadSubjects();

      setCreateOpen(false);
      setForm({
        name: '',
        color: '#3b82f6',
        description: '',
        teacher: '',
      });
    } catch (error) {
      console.error('Error creating subject:', error);
    } finally {
      setSaving(false);
      setVerifyingCode(false);
    }
  };

  return (
    <AppShell>
      <PageHeader
        title={t('subject_index_title')}
        description={t('subject_index_desc')}
        action={
          user && (
            <div className="flex gap-2">
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t('subject_new')}
              </Button>
              <Button onClick={() => setSetupOpen(true)} variant="outline">
                <BookOpen className="mr-2 h-4 w-4" />
                {t('subject_select_subjects')}
              </Button>
            </div>
          )
        }
        actionPosition="right"
      />

      {/* Render root-level buttons */}
      <ButtonSection placement="root" className="mt-4" />
      {loading ? (
        <SubjectSkeleton />
      ) : (
        <>
          {display.length === 0 ? (
            <div className="mt-10 rounded-xl border border-dashed border-border p-10 text-center">
              <BookOpen className="mx-auto h-9 w-9 text-muted-foreground" />
              <h2 className="mt-4 font-display text-2xl font-semibold">{t('subject_none')}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {t('subject_empty_hint')}
              </p>
              <Button className="mt-6" onClick={() => setCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t('subject_new')}
              </Button>
            </div>
          ) : (
            <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5" style={{ gridAutoRows: '1fr' }}>
              {display.map((subject) => (
                <SubjectTile
                  key={subject.id}
                  subject={subject}
                  onHide={() => setHidden((current) => [...new Set([...current, subject.name])])}
                  onPrioritize={() =>
                    setPrioritized((current) => [...new Set([...current, subject.name])])
                  }
                />
              ))}
            </div>
          )}
          {!showAll && selected.length > 0 && selected.length < visible.length && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="mt-8 w-full rounded-lg border border-border px-5 py-3 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              {t('subject_show_all')}
            </button>
          )}
          {hidden.length > 0 && (
            <div className="mt-12 border-t border-border pt-8">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4">{t('subject_hidden')}</h3>
              <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3" style={{ gridAutoRows: '1fr' }}>
                {subjects.filter((subject) => hidden.includes(subject.name)).map((subject) => (
                  <SubjectTile
                    key={subject.id}
                    subject={subject}
                    onHide={() => setHidden((current) => current.filter((name) => name !== subject.name))}
                    onPrioritize={() =>
                      setPrioritized((current) => [...new Set([...current, subject.name])])
                    }
                  />
                ))}
              </div>
              {hidden.length > 0 && (
                <button
                  type="button"
                  onClick={() => setHidden([])}
                  className="mt-4 text-sm text-muted-foreground hover:text-foreground"
                >
                  {t('subject_unhide_all')}
                </button>
              )}
            </div>
          )}

          {/* Secret Subjects Section */}
          {secretSubjects.length > 0 && (
            <div className="mt-12 border-t border-border pt-8">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-muted-foreground">{t('subject_special')}</h3>
              </div>
              <div className="grid gap-px overflow-hidden rounded-lg border border-border/50 bg-border/50 sm:grid-cols-2 lg:grid-cols-3" style={{ gridAutoRows: '1fr' }}>
                {secretSubjects.map((subject) => (
                  <Link
                    key={subject.id}
                    href={`/subjects/${subject.id}`}
                    className="relative bg-background transition-colors hover:bg-secondary/50 p-6 border-l-2 border-l-muted-foreground/30"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      <h2 className="font-display text-lg font-semibold">{subject.name}</h2>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {subject.description || t('subject_special_default_desc')}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      {setupOpen && (
        <GradeOnboardingModal
          currentGrade={profile?.grade_level}
          currentTrack={profile?.track}
          confirmedYear={profile?.grade_confirmed_year}
          onComplete={complete}
          onSkip={() => {
            complete('', '', []);
            setShowAll(true);
          }}
        />
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{t('subject_add_title')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={createSubject} className="space-y-4">
            <div>
              <Label htmlFor="subject-name">{t('subject_name_or_code')} *</Label>
              <Input
                id="subject-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder={t('subject_name_placeholder')}
                disabled={verifyingCode}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {t('subject_name_or_code_hint')}
              </p>
            </div>
            <div>
              <Label htmlFor="subject-teacher">{t('subject_teacher_label')}</Label>
              <Input
                id="subject-teacher"
                value={form.teacher}
                onChange={(e) => setForm({ ...form, teacher: e.target.value })}
                placeholder={t('subject_teacher_placeholder')}
              />
            </div>
            <div>
              <Label htmlFor="subject-description">{t('subject_desc_label')}</Label>
              <Input
                id="subject-description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder={t('subject_desc_placeholder')}
              />
            </div>
            <Button type="submit" disabled={saving || verifyingCode} className="w-full">
              {verifyingCode ? t('subject_verifying') : saving ? t('subject_saving') : t('subject_add_submit')}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
