'use client';

import { useState, useEffect } from 'react';
import { AppShell, PageHeader } from '@/components/AppShell';
import { Button } from '@/components/ui/button';
import {
  CheckCircle,
  XCircle,
  Brain,
  Target,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { supabase as browserClient } from '@/lib/supabase/client';
import { useTranslation } from '@/lib/useTranslation';

const supabase = browserClient as any;

type QuizQuestion = {
  id: string;
  vak: string;
  onderwerp: string;
  type: 'multiple-choice' | 'open' | 'cloze' | 'true-false' | 'matching' | 'ordering' | 'numeric' | 'essay';
  vraag: string;
  opties?: string[];
  correct_antwoord: string | string[] | number[];
  uitleg?: string;
  moeilijkheid: 'makkelijk' | 'gemiddeld' | 'moeilijk';
  matching_pairs?: { left: string; right: string }[];
  order_items?: string[];
};

type QuizSession = {
  vragen: QuizQuestion[];
  currentIndex: number;
  antwoorden: Map<string, string>;
  scores: Map<string, boolean>;
  startTime: Date;
  endTime?: Date;
  granularScores?: Map<string, 'good' | 'partial' | 'wrong' | 'not_done'>;
  confidenceScores?: Map<string, number>;
  hintUsage?: Map<string, boolean>;
  questionTimes?: Map<string, number>;
};

export default function DailyQuizPage() {
  const { t } = useTranslation();
  const [session, setSession] = useState<QuizSession | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [previousSessions, setPreviousSessions] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [examMode, setExamMode] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [confidenceLevel, setConfidenceLevel] = useState<number>(3);
  const [usedHint, setUsedHint] = useState(false);

  useEffect(() => {
    fetchQuestions();
    fetchPreviousSessions();
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      finishQuiz();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timeLeft]);

  const fetchQuestions = async () => {
    const { data, error } = await supabase.from('daily_quiz_questions').select('*');

    if (error) {
      console.error('Failed to fetch questions:', error);
    } else if (data) {
      setQuestions(data);
    }
    setLoading(false);
  };

  const fetchPreviousSessions = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('daily_quiz_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('quiz_date', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Failed to fetch previous sessions:', error);
    } else if (data) {
      setPreviousSessions(data);
    }
  };

  const startQuiz = async (durationMinutes?: number, isExam = false) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Shuffle questions and pick 10
    const shuffledQuestions = [...questions].sort(() => Math.random() - 0.5).slice(0, 10);

    setSession({
      vragen: shuffledQuestions,
      currentIndex: 0,
      antwoorden: new Map(),
      scores: new Map(),
      startTime: new Date(),
      granularScores: new Map(),
      confidenceScores: new Map(),
      hintUsage: new Map(),
      questionTimes: new Map(),
    });
    setUserAnswer('');
    setShowAnswer(false);
    setCompleted(false);
    setExamMode(isExam);
    setQuestionStartTime(Date.now());
    setConfidenceLevel(3);
    setUsedHint(false);

    // Start timer if duration is specified
    if (durationMinutes && durationMinutes > 0) {
      setTimeLeft(durationMinutes * 60);
      setIsTimerRunning(true);
    }
  };

  const checkAnswer = () => {
    if (!session) return;

    const currentQuestion = session.vragen[session.currentIndex];
    let isCorrect = false;
    let granularScore: 'good' | 'partial' | 'wrong' | 'not_done' = 'wrong';

    if (currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'true-false') {
      isCorrect = userAnswer === currentQuestion.correct_antwoord;
      granularScore = isCorrect ? 'good' : 'wrong';
    } else if (currentQuestion.type === 'numeric') {
      isCorrect = parseFloat(userAnswer) === parseFloat(currentQuestion.correct_antwoord as string);
      granularScore = isCorrect ? 'good' : 'wrong';
    } else if (currentQuestion.type === 'essay') {
      // Essay questions are manually graded - mark as pending
      isCorrect = false;
      granularScore = 'not_done';
    } else if (currentQuestion.type === 'matching' || currentQuestion.type === 'ordering') {
      // These types need special handling - mark as pending
      isCorrect = false;
      granularScore = 'not_done';
    } else {
      const correctAnswer = currentQuestion.correct_antwoord;
      if (typeof correctAnswer === 'string') {
        const similarity = userAnswer.toLowerCase().includes(correctAnswer.toLowerCase());
        isCorrect = similarity;
        if (similarity) {
          granularScore = userAnswer.toLowerCase() === correctAnswer.toLowerCase() ? 'good' : 'partial';
        }
      }
    }

    // Calculate time spent on this question
    const timeSpent = Date.now() - questionStartTime;

    const newScores = new Map(session.scores);
    newScores.set(currentQuestion.id, isCorrect);

    const newAntwoorden = new Map(session.antwoorden);
    newAntwoorden.set(currentQuestion.id, userAnswer);

    const newGranularScores = new Map(session.granularScores);
    newGranularScores.set(currentQuestion.id, granularScore);

    const newConfidenceScores = new Map(session.confidenceScores);
    newConfidenceScores.set(currentQuestion.id, confidenceLevel);

    const newHintUsage = new Map(session.hintUsage);
    newHintUsage.set(currentQuestion.id, usedHint);

    const newQuestionTimes = new Map(session.questionTimes);
    newQuestionTimes.set(currentQuestion.id, timeSpent);

    setSession({
      ...session,
      scores: newScores,
      antwoorden: newAntwoorden,
      granularScores: newGranularScores,
      confidenceScores: newConfidenceScores,
      hintUsage: newHintUsage,
      questionTimes: newQuestionTimes,
    });
    setShowAnswer(true);
  };

  const nextQuestion = () => {
    if (!session) return;

    if (session.currentIndex < session.vragen.length - 1) {
      setSession({
        ...session,
        currentIndex: session.currentIndex + 1,
      });
      setUserAnswer('');
      setShowAnswer(false);
      setQuestionStartTime(Date.now());
      setConfidenceLevel(3);
      setUsedHint(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    if (!session) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const endTime = new Date();
    const durationSeconds = Math.round((endTime.getTime() - session.startTime.getTime()) / 1000);
    const correctCount = Array.from(session.scores.values()).filter(Boolean).length;

    const { error } = await supabase.from('daily_quiz_sessions').insert({
      user_id: user.id,
      quiz_date: new Date().toISOString().split('T')[0],
      questions: session.vragen,
      answers: Object.fromEntries(session.antwoorden),
      scores: Object.fromEntries(session.scores),
      correct_count: correctCount,
      total_questions: session.vragen.length,
      started_at: session.startTime,
      ended_at: endTime,
      duration_seconds: durationSeconds,
      exam_mode: examMode,
    });

    if (error) {
      console.error('Failed to save session:', error);
    }

    // Automatically log errors from quizzes
    session.vragen.forEach((vraag, index) => {
      const isCorrect = session.scores.get(vraag.id);
      if (!isCorrect) {
        const userAnswer = session.antwoorden.get(vraag.id) || '';
        logError(vraag, userAnswer);
      }
    });

    setSession({
      ...session,
      endTime,
    });
    setCompleted(true);
    setIsTimerRunning(false);
    await fetchPreviousSessions();
  };

  const logError = async (question: QuizQuestion, userAnswer: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    try {
      await supabase.from('foutenlogboek').insert({
        user_id: user.id,
        vraag: question.vraag,
        onderwerp: question.onderwerp,
        vak: question.vak,
        status: 'nieuw',
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to log error:', error);
    }
  };

  const resetQuiz = () => {
    setSession(null);
    setUserAnswer('');
    setShowAnswer(false);
    setCompleted(false);
    setQuestionStartTime(Date.now());
    setConfidenceLevel(3);
    setUsedHint(false);
  };

  const getDifficultyColor = (moeilijkheid: string) => {
    switch (moeilijkheid) {
      case 'makkelijk':
        return 'bg-green-500/10 text-green-600';
      case 'gemiddeld':
        return 'bg-yellow-500/10 text-yellow-600';
      case 'moeilijk':
        return 'bg-red-500/10 text-red-600';
      default:
        return 'bg-gray-500/10 text-gray-600';
    }
  };

  if (!session) {
    return (
      <AppShell>
        <PageHeader
          title="Daily Quiz"
          description={t('quiz_description')}
        />

        <div className="mt-10">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 rounded-lg border border-border bg-card" />
              ))}
            </div>
          ) : questions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-10 text-center">
              <Brain className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="font-display text-xl font-semibold mb-2">{t('quiz_no_questions')}</h2>
              <p className="text-sm text-muted-foreground mb-4">
                {t('quiz_no_questions_desc')}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-xl border border-border bg-card p-8 text-center">
                <Target className="mx-auto h-16 w-16 text-primary mb-4" />
                <h2 className="font-display text-2xl font-semibold mb-2">{t('quiz_ready_title')}</h2>
                <p className="text-muted-foreground mb-6">
                  {t('quiz_ready_desc', undefined, { n: Math.min(10, questions.length) })}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
                  <Button onClick={() => startQuiz()} size="lg">
                    <Brain className="mr-2 h-5 w-5" />
                    {t('quiz_start')}
                  </Button>
                  <Button onClick={() => startQuiz(10, true)} variant="outline" size="lg">
                    <Brain className="mr-2 h-5 w-5" />
                    {t('quiz_exam_mode')}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('quiz_exam_mode_desc')}
                </p>
              </div>

              {/* Previous Sessions */}
              {previousSessions.length > 0 && (
                <div className="mt-10">
                  <h2 className="font-display text-xl font-semibold mb-4">
                    {t('quiz_previous_results')}
                  </h2>
                  <div className="space-y-3">
                    {previousSessions.map((session) => (
                      <div key={session.id} className="rounded-xl border border-border bg-card p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{session.quiz_date}</p>
                            <p className="text-sm text-muted-foreground">
                              {session.correct_count}/{session.total_questions} correct (
                              {Math.round((session.correct_count / session.total_questions) * 100)}
                              %)
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              {Math.floor(session.duration_seconds / 60)}m{' '}
                              {session.duration_seconds % 60}s
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </AppShell>
    );
  }

  if (completed) {
    const correctCount = Array.from(session.scores.values()).filter((value) => value === true).length;
    const totalTime = session.endTime
      ? Math.round((session.endTime.getTime() - session.startTime.getTime()) / 60000)
      : 0;

    return (
      <AppShell>
        <PageHeader
          title={t('quiz_completed_title')}
          description={t('quiz_completed_desc')}
          action={
            <Button variant="outline" onClick={resetQuiz}>
              <RotateCcw className="mr-2 h-4 w-4" />
              {t('quiz_new_quiz')}
            </Button>
          }
        />

        <div className="mt-10">
          <div className="rounded-xl border border-border bg-card p-8 text-center mb-6">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-6">
              {correctCount >= 8 ? (
                <CheckCircle className="h-12 w-12 text-green-500" />
              ) : correctCount >= 5 ? (
                <Brain className="h-12 w-12 text-yellow-500" />
              ) : (
                <AlertTriangle className="h-12 w-12 text-red-500" />
              )}
            </div>
            <h2 className="font-display text-3xl font-semibold mb-2">{correctCount}/10</h2>
            <p className="text-xl text-muted-foreground mb-6">{correctCount * 10}% correct</p>
            <div className="flex justify-center gap-8 mb-6">
              <div>
                <p className="text-sm text-muted-foreground">{t('quiz_time')}</p>
                <p className="font-display text-2xl font-semibold">{totalTime} min</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('quiz_avg_per_question')}</p>
                <p className="font-display text-2xl font-semibold">
                  {Math.round(totalTime / 10)} sec
                </p>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary">
              {correctCount >= 8 ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">{t('quiz_excellent')}</span>
                </>
              ) : correctCount >= 5 ? (
                <>
                  <Brain className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">{t('quiz_well_done')}</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">{t('quiz_practice_more')}</span>
                </>
              )}
            </div>
          </div>

          {/* Detailed Results */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-display text-lg font-semibold mb-4">
              {t('quiz_detailed_results')}
            </h3>
            <div className="space-y-3">
              {session.vragen.map((vraag, index) => {
                const isCorrect = session.scores.get(vraag.id);
                const userAnswer = session.antwoorden.get(vraag.id) || t('study_no_answer');
                const granularScore = session.granularScores?.get(vraag.id);
                const confidence = session.confidenceScores?.get(vraag.id);
                const hintUsed = session.hintUsage?.get(vraag.id);
                const timeSpent = session.questionTimes?.get(vraag.id);
                return (
                  <div key={vraag.id} className="p-4 rounded-lg border border-border">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {t('quiz_question_number', undefined, { n: index + 1 })}
                        </span>
                        <span className="text-xs text-muted-foreground">{vraag.vak}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs ${getDifficultyColor(vraag.moeilijkheid)}`}
                        >
                          {vraag.moeilijkheid}
                        </span>
                        {granularScore && (
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            granularScore === 'good' ? 'bg-green-500/10 text-green-600' :
                            granularScore === 'partial' ? 'bg-yellow-500/10 text-yellow-600' :
                            granularScore === 'wrong' ? 'bg-red-500/10 text-red-600' :
                            'bg-gray-500/10 text-gray-600'
                          }`}>
                            {granularScore}
                          </span>
                        )}
                      </div>
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <p className="text-sm mb-3">{vraag.vraag}</p>
                    <div className="grid gap-2 sm:grid-cols-2 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">{t('study_your_answer_label')}</p>
                        <p className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                          {userAnswer}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">
                          {t('study_correct_answer_label')}
                        </p>
                        <p className="text-green-600">
                          {typeof vraag.correct_antwoord === 'string'
                            ? vraag.correct_antwoord
                            : JSON.stringify(vraag.correct_antwoord)}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-3 text-xs text-muted-foreground">
                      {confidence !== undefined && (
                        <div>
                          <p className="font-medium">{t('quiz_confidence')}</p>
                          <p>{confidence}/5</p>
                        </div>
                      )}
                      {timeSpent !== undefined && (
                        <div>
                          <p className="font-medium">{t('quiz_time')}:</p>
                          <p>{Math.round(timeSpent / 1000)}s</p>
                        </div>
                      )}
                      {hintUsed !== undefined && (
                        <div>
                          <p className="font-medium">Hint:</p>
                          <p className="font-medium">{hintUsed ? t('quiz_yes') : t('quiz_no')}</p>
                        </div>
                      )}
                    </div>
                    {vraag.uitleg && (
                      <div className="mt-3 p-3 rounded bg-secondary/50 text-sm">
                        <p className="font-medium mb-1">{t('quiz_explanation')}</p>
                        <p className="text-muted-foreground">{vraag.uitleg}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  const currentQuestion = session.vragen[session.currentIndex];
  const progress = ((session.currentIndex + 1) / session.vragen.length) * 100;

  return (
    <AppShell>
      <PageHeader
        title={t('quiz_question_progress', undefined, {
          n: session.currentIndex + 1,
          total: session.vragen.length,
        })}
        description={`${currentQuestion.vak} • ${currentQuestion.onderwerp}`}
      />

      <div className="mt-10">
        {/* Timer Display */}
        {isTimerRunning && (
          <div className="mb-6 p-4 rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                {t('quiz_time_left')}
              </span>
              <span className={`font-mono text-2xl font-semibold ${timeLeft < 60 ? 'text-red-500' : 'text-foreground'}`}>
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">{t('quiz_progress')}</span>
            <span className="text-sm font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="rounded-xl border border-border bg-card p-8">
          <div className="mb-4 flex items-center gap-2">
            <span
              className={`px-2 py-1 rounded text-xs ${getDifficultyColor(currentQuestion.moeilijkheid)}`}
            >
              {currentQuestion.moeilijkheid}
            </span>
            <span className="text-sm text-muted-foreground">{currentQuestion.type}</span>
          </div>

          <h2 className="text-xl font-semibold mb-6">{currentQuestion.vraag}</h2>

          {/* Confidence Rating */}
          {!showAnswer && !examMode && (
            <div className="mb-6 p-4 rounded-lg border border-border bg-secondary/30">
              <p className="text-sm font-medium mb-3">{t('quiz_confidence_question')}</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setConfidenceLevel(level)}
                    className={`flex-1 py-2 rounded-lg border transition-colors ${
                      confidenceLevel === level
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-foreground/30'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>{t('quiz_not_sure')}</span>
                <span>{t('quiz_very_sure')}</span>
              </div>
            </div>
          )}

          {/* Hint Button */}
          {!showAnswer && !examMode && (
            <button
              type="button"
              onClick={() => setUsedHint(true)}
              disabled={usedHint}
              className="mb-6 text-sm text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
            >
              {usedHint ? t('quiz_hint_used') : t('quiz_show_hint')}
            </button>
          )}

          {(currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'true-false') &&
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
          ) : currentQuestion.type === 'matching' && currentQuestion.matching_pairs ? (
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-4">{t('quiz_match_instructions')}</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  {currentQuestion.matching_pairs.map((pair, index) => (
                    <div key={index} className="p-3 rounded-lg border border-border bg-secondary/50">
                      {pair.left}
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {currentQuestion.matching_pairs.map((pair, index) => (
                    <div key={index} className="p-3 rounded-lg border border-border bg-secondary/50">
                      {pair.right}
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">{t('quiz_match_tip')}</p>
            </div>
          ) : currentQuestion.type === 'numeric' ? (
            <div className="mb-6">
              <input
                type="number"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder={t('quiz_number_placeholder')}
                className="w-full rounded-lg border border-border bg-background p-4 text-sm focus:border-foreground/40 outline-none"
                disabled={showAnswer}
              />
            </div>
          ) : currentQuestion.type === 'essay' ? (
            <div className="mb-6">
              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder={t('quiz_essay_placeholder')}
                className="w-full h-48 rounded-lg border border-border bg-background p-4 text-sm resize-none focus:border-foreground/40 outline-none"
                disabled={showAnswer}
              />
              <p className="text-xs text-muted-foreground mt-2">{t('quiz_essay_note')}</p>
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
                  (() => {
                    const correctAnswer = currentQuestion.correct_antwoord;
                    if (typeof correctAnswer === 'string') {
                      return userAnswer.toLowerCase().includes(correctAnswer.toLowerCase())
                        ? 'bg-green-500/10 border border-green-500/30'
                        : 'bg-red-500/10 border border-red-500/30';
                    }
                    return 'bg-yellow-500/10 border border-yellow-500/30';
                  })()
                }`}
              >
                <p className="font-medium mb-2">
                  {(() => {
                    const correctAnswer = currentQuestion.correct_antwoord;
                    if (typeof correctAnswer === 'string') {
                      return userAnswer.toLowerCase().includes(correctAnswer.toLowerCase())
                        ? `✓ ${t('study_answer_correct')}`
                        : `✗ ${t('quiz_not_quite_correct')}`;
                    }
                    return t('quiz_answer_checked');
                  })()}
                </p>
                <p className="text-sm">
                  <span className="font-medium">{t('study_your_answer_label')}</span>{' '}
                  {userAnswer || t('study_no_answer')}
                </p>
                <p className="text-sm">
                  <span className="font-medium">{t('study_correct_answer_label')}</span>{' '}
                  {typeof currentQuestion.correct_antwoord === 'string'
                    ? currentQuestion.correct_antwoord
                    : JSON.stringify(currentQuestion.correct_antwoord)}
                </p>
              </div>

              {currentQuestion.uitleg && (
                <div className="p-4 rounded-lg bg-secondary/50">
                  <p className="font-medium mb-2">{t('quiz_explanation')}</p>
                  <p className="text-sm text-muted-foreground">{currentQuestion.uitleg}</p>
                </div>
              )}

              <Button onClick={nextQuestion} className="w-full">
                {session.currentIndex < session.vragen.length - 1
                  ? t('next_question')
                  : t('quiz_view_results')}
                <Target className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button onClick={checkAnswer} className="w-full" disabled={!userAnswer.trim()}>
              {t('advanced_check_answer')}
            </Button>
          )}
        </div>
      </div>
    </AppShell>
  );
}
