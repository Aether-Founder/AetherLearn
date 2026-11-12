'use client';

import { useState, useEffect } from 'react';
import { AppShell, PageHeader } from '@/components/AppShell';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Brain,
  MessageSquare,
  CheckCircle,
  XCircle,
  ArrowRight,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { supabase as browserClient } from '@/lib/supabase/client';
import { useTranslation } from '@/lib/useTranslation';

const supabase = browserClient as any;

type QuestionType =
  | 'open'
  | 'multiple-choice'
  | 'cloze'
  | 'flashcard'
  | 'step-by-step'
  | 'diagram'
  | 'translate'
  | 'code'
  | 'error-detection'
  | 'method-choice';

type Question = {
  id: string;
  type: QuestionType;
  vak: string;
  onderwerp: string;
  vraag: string;
  opties?: string[];
  correct_antwoord: string;
  uitleg?: string;
};

const QUESTION_TYPES: { id: QuestionType; label: string; labelKey?: string; icon: any }[] = [
  { id: 'open', label: 'Open question', labelKey: 'quiz_type_open', icon: MessageSquare },
  { id: 'multiple-choice', label: 'Multiple choice', icon: CheckCircle },
  { id: 'cloze', label: 'Fill-in-the-blank', labelKey: 'quiz_type_cloze', icon: MessageSquare },
  { id: 'flashcard', label: 'Flashcard', icon: Brain },
  { id: 'step-by-step', label: 'Step-by-step', labelKey: 'quiz_type_step', icon: ArrowRight },
  { id: 'diagram', label: 'Diagram question', labelKey: 'quiz_type_diagram', icon: Brain },
  { id: 'translate', label: 'Translation question', labelKey: 'quiz_type_translate', icon: MessageSquare },
  { id: 'code', label: 'Code question', labelKey: 'quiz_type_code', icon: Brain },
  { id: 'error-detection', label: 'Error detection', labelKey: 'quiz_type_error', icon: XCircle },
  { id: 'method-choice', label: 'Method choice', labelKey: 'quiz_type_method', icon: CheckCircle },
];

export default function ActiveRecallPage() {
  const { t } = useTranslation();
  const [selectedType, setSelectedType] = useState<QuestionType | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    vak: '',
    onderwerp: '',
    type: 'open' as QuestionType,
    vraag: '',
    opties: '',
    correct_antwoord: '',
    uitleg: '',
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('active_recall_questions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch questions:', error);
    } else if (data) {
      setQuestions(data);
    }
    setLoading(false);
  };

  const handleAddQuestion = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const optiesArray = formData.opties
      ? formData.opties.split(',').map((o) => o.trim())
      : undefined;

    const { data, error } = await supabase
      .from('active_recall_questions')
      .insert({
        user_id: user.id,
        vak: formData.vak,
        onderwerp: formData.onderwerp,
        type: formData.type,
        vraag: formData.vraag,
        opties: optiesArray,
        correct_antwoord: formData.correct_antwoord,
        uitleg: formData.uitleg,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to add question:', error);
    } else if (data) {
      setQuestions([data, ...questions]);
      setShowAddDialog(false);
      setFormData({
        vak: '',
        onderwerp: '',
        type: 'open',
        vraag: '',
        opties: '',
        correct_antwoord: '',
        uitleg: '',
      });
    }
  };

  const startQuestion = (type: QuestionType) => {
    setSelectedType(type);
    const filteredQuestions = questions.filter((q) => q.type === type);
    const question = filteredQuestions.length > 0 ? filteredQuestions[0] : questions[0];
    setCurrentQuestion(question || null);
    setUserAnswer('');
    setShowAnswer(false);
  };

  const checkAnswer = () => {
    if (!currentQuestion) return;

    let isCorrect = false;
    if (currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'method-choice') {
      isCorrect = userAnswer === currentQuestion.correct_antwoord;
    } else {
      isCorrect = userAnswer.toLowerCase().includes(currentQuestion.correct_antwoord.toLowerCase());
    }

    setShowAnswer(true);
    setTotalAnswered((prev) => prev + 1);
    if (isCorrect) setScore((prev) => prev + 1);
  };

  const nextQuestion = () => {
    const typeQuestions = questions.filter((q) => q.type === selectedType);
    const nextIndex =
      (typeQuestions.findIndex((q) => q.id === currentQuestion?.id) + 1) % typeQuestions.length;
    setCurrentQuestion(typeQuestions[nextIndex] || null);
    setUserAnswer('');
    setShowAnswer(false);
  };

  const resetSession = () => {
    setSelectedType(null);
    setCurrentQuestion(null);
    setUserAnswer('');
    setShowAnswer(false);
    setScore(0);
    setTotalAnswered(0);
  };

  if (!selectedType) {
    return (
      <AppShell>
        <PageHeader
          title="Active Recall Engine"
          description={t('quiz_pick_type')}
          action={
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t('quiz_new_question')}
            </Button>
          }
        />

        <div className="mt-10">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-24 rounded-lg border border-border bg-card" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {QUESTION_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => startQuestion(type.id)}
                      className="flex items-center gap-4 p-6 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-secondary/50 transition-all text-left"
                    >
                      <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary shrink-0">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">
                          {type.labelKey ? t(type.labelKey) : type.label}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {t('quiz_question_count', undefined, {
                            n: questions.filter((q) => q.type === type.id).length,
                          })}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </button>
                  );
                })}
              </div>

              {questions.length === 0 && (
                <div className="mt-8 rounded-xl border border-dashed border-border p-10 text-center">
                  <Brain className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h2 className="font-display text-xl font-semibold mb-2">{t('quiz_none_found')}</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t('quiz_empty_desc')}
                  </p>
                  <Button onClick={() => setShowAddDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t('quiz_add_first')}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-10 rounded-xl border border-border bg-card p-6">
          <h2 className="font-display text-xl font-semibold mb-4">{t('quiz_about_title')}</h2>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>{t('quiz_about_text')}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="p-4 rounded-lg bg-secondary/50">
                <h3 className="font-medium text-foreground mb-2">{t('quiz_why_title')}</h3>
                <ul className="space-y-1">
                  <li>• {t('quiz_why_1')}</li>
                  <li>• {t('quiz_why_2')}</li>
                  <li>• {t('quiz_why_3')}</li>
                  <li>• {t('quiz_why_4')}</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50">
                <h3 className="font-medium text-foreground mb-2">{t('quiz_tips_title')}</h3>
                <ul className="space-y-1">
                  <li>• {t('quiz_tip_1')}</li>
                  <li>• {t('quiz_tip_2')}</li>
                  <li>• {t('quiz_tip_3')}</li>
                  <li>• {t('quiz_tip_4')}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Add Question Dialog */}
        <AddQuestionDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          onAdd={handleAddQuestion}
          formData={formData}
          setFormData={setFormData}
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="Active Recall"
        description={t('quiz_question_type', undefined, {
          type: (() => {
            const found = QUESTION_TYPES.find((qt) => qt.id === selectedType);
            return found?.labelKey ? t(found.labelKey) : found?.label;
          })(),
        })}
        action={
          <Button variant="outline" onClick={resetSession}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {t('quiz_new_session')}
          </Button>
        }
      />

      <div className="mt-10">
        {/* Progress */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Score: {score}/{totalAnswered}
            </span>
            <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: totalAnswered > 0 ? `${(score / totalAnswered) * 100}%` : '0%' }}
              />
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setSelectedType(null)}>
            {t('quiz_back_overview')}
          </Button>
        </div>

        {/* Question Card */}
        {currentQuestion ? (
          <div className="rounded-xl border border-border bg-card p-8">
            <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium">{currentQuestion.vak}</span>
              <span>•</span>
              <span>{currentQuestion.onderwerp}</span>
            </div>

            <h2 className="text-xl font-semibold mb-6">{currentQuestion.vraag}</h2>

            {(currentQuestion.type === 'multiple-choice' ||
              currentQuestion.type === 'method-choice') &&
            currentQuestion.opties ? (
              <div className="space-y-3 mb-6">
                {currentQuestion.opties.map((optie, index) => (
                  <button
                    key={index}
                    onClick={() => setUserAnswer(optie)}
                    className={`w-full text-left p-4 rounded-lg border transition-colors ${
                      userAnswer === optie
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-foreground/30 hover:bg-secondary/50'
                    } ${showAnswer && optie === currentQuestion.correct_antwoord ? 'border-green-500 bg-green-500/10' : ''}`}
                    disabled={showAnswer}
                  >
                    <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                    {optie}
                  </button>
                ))}
              </div>
            ) : (
              <div className="mb-6">
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder={t('study_answer_placeholder')}
                  className="w-full h-32 rounded-lg border border-border bg-background p-4 text-sm resize-none focus:border-foreground/40 outline-none"
                  disabled={showAnswer}
                />
              </div>
            )}

            {showAnswer ? (
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-lg ${
                    userAnswer
                      .toLowerCase()
                      .includes(currentQuestion.correct_antwoord.toLowerCase())
                      ? 'bg-green-500/10 border border-green-500/30'
                      : 'bg-red-500/10 border border-red-500/30'
                  }`}
                >
                  <p className="font-medium mb-2">
                    {userAnswer
                      .toLowerCase()
                      .includes(currentQuestion.correct_antwoord.toLowerCase())
                      ? `✓ ${t('study_answer_correct')}`
                      : `✗ ${t('quiz_not_quite_correct')}`}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">{t('study_your_answer_label')}</span>{' '}
                    {userAnswer || t('study_no_answer')}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">{t('study_correct_answer_label')}</span>{' '}
                    {currentQuestion.correct_antwoord}
                  </p>
                </div>

                {currentQuestion.uitleg && (
                  <div className="p-4 rounded-lg bg-secondary/50">
                    <p className="font-medium mb-2">{t('quiz_explanation')}</p>
                    <p className="text-sm text-muted-foreground">{currentQuestion.uitleg}</p>
                  </div>
                )}

                <Button onClick={nextQuestion} className="w-full">
                  {t('next_question')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button onClick={checkAnswer} className="w-full" disabled={!userAnswer.trim()}>
                {t('advanced_check_answer')}
              </Button>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-10 text-center">
            <Brain className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="font-display text-xl font-semibold mb-2">{t('quiz_no_questions')}</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {t('quiz_no_questions_type')}
            </p>
            <Button onClick={() => setSelectedType(null)}>{t('quiz_back_overview')}</Button>
          </div>
        )}
      </div>

      {/* Add Question Dialog */}
      <AddQuestionDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={handleAddQuestion}
        formData={formData}
        setFormData={setFormData}
      />
    </AppShell>
  );
}

// Add Question Dialog
function AddQuestionDialog({
  open,
  onOpenChange,
  onAdd,
  formData,
  setFormData,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: () => void;
  formData: any;
  setFormData: (data: any) => void;
}) {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('quiz_add_question_title')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="vak">{t('srs_subject_label')}</Label>
              <Input
                id="vak"
                value={formData.vak}
                onChange={(e) => setFormData({ ...formData, vak: e.target.value })}
                placeholder={t('srs_subject_placeholder')}
              />
            </div>
            <div>
              <Label htmlFor="onderwerp">{t('srs_topic_label')}</Label>
              <Input
                id="onderwerp"
                value={formData.onderwerp}
                onChange={(e) => setFormData({ ...formData, onderwerp: e.target.value })}
                placeholder={t('quiz_topic_placeholder')}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="type">{t('quiz_question_type_label')}</Label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="open">{t('quiz_type_open')}</option>
              <option value="multiple-choice">Multiple choice</option>
              <option value="cloze">{t('quiz_type_cloze')}</option>
              <option value="method-choice">{t('quiz_type_method')}</option>
            </select>
          </div>
          <div>
            <Label htmlFor="vraag">{t('question')}</Label>
            <Textarea
              id="vraag"
              value={formData.vraag}
              onChange={(e) => setFormData({ ...formData, vraag: e.target.value })}
              placeholder={t('srs_question_placeholder')}
              rows={3}
            />
          </div>
          {(formData.type === 'multiple-choice' || formData.type === 'method-choice') && (
            <div>
              <Label htmlFor="opties">{t('quiz_options_label')}</Label>
              <Input
                id="opties"
                value={formData.opties}
                onChange={(e) => setFormData({ ...formData, opties: e.target.value })}
                placeholder={t('quiz_options_placeholder')}
              />
            </div>
          )}
          <div>
            <Label htmlFor="correct_antwoord">{t('quiz_correct_answer_field')}</Label>
            <Textarea
              id="correct_antwoord"
              value={formData.correct_antwoord}
              onChange={(e) => setFormData({ ...formData, correct_antwoord: e.target.value })}
              placeholder={t('quiz_correct_placeholder')}
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="uitleg">{t('quiz_explanation_optional')}</Label>
            <Textarea
              id="uitleg"
              value={formData.uitleg}
              onChange={(e) => setFormData({ ...formData, uitleg: e.target.value })}
              placeholder={t('quiz_explanation_placeholder')}
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('cancel')}
          </Button>
          <Button onClick={onAdd}>{t('quiz_add_question')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
