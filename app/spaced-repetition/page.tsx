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
  Clock,
  Calendar,
  TrendingUp,
  CheckCircle,
  XCircle,
  RotateCcw,
  Play,
  Plus,
} from 'lucide-react';
import { supabase as browserClient } from '@/lib/supabase/client';
import { useTranslation } from '@/lib/useTranslation';

const supabase = browserClient as any;

type ReviewItem = {
  id: string;
  vak: string;
  onderwerp: string;
  vraag: string;
  antwoord: string;
  interval: number;
  ease: number;
  next_review: string;
  last_review: string;
  times_reviewed: number;
  times_correct: number;
};

const STANDARD_INTERVALS = [0, 1, 3, 7, 14, 30];
const LANGUAGE_INTERVALS = [0, 1, 2, 4, 7, 14, 30];

export default function SpacedRepetitionPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentItem, setCurrentItem] = useState<ReviewItem | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [filter, setFilter] = useState<'today' | 'upcoming' | 'all'>('today');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    vak: '',
    onderwerp: '',
    vraag: '',
    antwoord: '',
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('spaced_repetition_items')
      .select('*')
      .eq('user_id', user.id)
      .order('next_review', { ascending: true });

    if (error) {
      console.error('Failed to fetch items:', error);
    } else if (data) {
      setItems(data);
    }
    setLoading(false);
  };

  const handleAddItem = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('spaced_repetition_items')
      .insert({
        user_id: user.id,
        vak: formData.vak,
        onderwerp: formData.onderwerp,
        vraag: formData.vraag,
        antwoord: formData.antwoord,
        interval: 0,
        ease: 2.5,
        next_review: new Date().toISOString().split('T')[0],
        last_review: null,
        times_reviewed: 0,
        times_correct: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to add item:', error);
    } else if (data) {
      setItems([data, ...items]);
      setShowAddDialog(false);
      setFormData({
        vak: '',
        onderwerp: '',
        vraag: '',
        antwoord: '',
      });
    }
  };

  const today = new Date().toISOString().split('T')[0];

  const filteredItems =
    filter === 'today'
      ? items.filter((item) => item.next_review === today)
      : filter === 'upcoming'
        ? items.filter((item) => item.next_review > today)
        : items;

  const dueToday = items.filter((item) => item.next_review === today);
  const upcoming = items.filter((item) => item.next_review > today);

  const startReview = () => {
    if (dueToday.length > 0) {
      setCurrentItem(dueToday[0]);
      setShowAnswer(false);
      setUserRating(null);
    }
  };

  const handleRating = async (rating: number) => {
    if (!currentItem) return;

    setUserRating(rating);

    // Calculate new interval based on SM-2 algorithm
    let newInterval: number;
    let newEase = currentItem.ease;

    if (rating === 0) {
      newInterval = 1; // Failed - review tomorrow
      newEase = Math.max(1.3, newEase - 0.2);
    } else if (rating === 1) {
      newInterval = currentItem.interval * 1.2; // Hard - slightly longer
      newEase = Math.max(1.3, newEase - 0.15);
    } else if (rating === 2) {
      newInterval = currentItem.interval * currentItem.ease; // Good - use ease factor
    } else {
      newInterval = currentItem.interval * currentItem.ease * 1.3; // Easy - much longer
      newEase = newEase + 0.1;
    }

    newInterval = Math.round(newInterval);

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

    // Update in database
    const { error } = await supabase
      .from('spaced_repetition_items')
      .update({
        interval: newInterval,
        ease: newEase,
        next_review: nextReviewDate.toISOString().split('T')[0],
        last_review: today,
        times_reviewed: currentItem.times_reviewed + 1,
        times_correct: currentItem.times_correct + (rating >= 2 ? 1 : 0),
      })
      .eq('id', currentItem.id);

    if (error) {
      console.error('Failed to update item:', error);
    } else {
      await fetchItems();

      // Move to next item
      const remainingDue = items.filter((item) => item.next_review === today);
      if (remainingDue.length > 0) {
        setCurrentItem(remainingDue[0]);
        setShowAnswer(false);
        setUserRating(null);
      } else {
        setCurrentItem(null);
        setShowAnswer(false);
        setUserRating(null);
      }
    }
  };

  const resetItem = async (id: string) => {
    const { error } = await supabase
      .from('spaced_repetition_items')
      .update({
        interval: 0,
        ease: 2.5,
        next_review: today,
        times_reviewed: 0,
        times_correct: 0,
      })
      .eq('id', id);

    if (error) {
      console.error('Failed to reset item:', error);
    } else {
      fetchItems();
    }
  };

  if (currentItem) {
    return (
      <AppShell>
        <PageHeader
          title={t('srs_review_session')}
          description={t('srs_items_to_review', undefined, {
            n: dueToday.filter((i) => i.next_review === today).length,
          })}
        />

        <div className="mt-10">
          <div className="rounded-xl border border-border bg-card p-8">
            <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium">{currentItem.vak}</span>
              <span>•</span>
              <span>{currentItem.onderwerp}</span>
              <span>•</span>
              <span>{t('srs_interval_days', undefined, { n: currentItem.interval })}</span>
            </div>

            <h2 className="text-2xl font-semibold mb-8">{currentItem.vraag}</h2>

            {showAnswer ? (
              <div className="space-y-6">
                <div className="p-6 rounded-lg bg-secondary/50">
                  <p className="font-medium mb-2">{t('answer')}</p>
                  <p className="text-lg">{currentItem.antwoord}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-4">{t('srs_how_well')}</p>
                  <div className="grid grid-cols-4 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => handleRating(0)}
                      className="h-auto py-4 flex flex-col gap-1"
                    >
                      <XCircle className="h-5 w-5 text-red-500" />
                      <span className="text-xs">{t('srs_rating_unknown')}</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleRating(1)}
                      className="h-auto py-4 flex flex-col gap-1"
                    >
                      <span className="text-lg">😕</span>
                      <span className="text-xs">{t('srs_rating_partial')}</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleRating(2)}
                      className="h-auto py-4 flex flex-col gap-1"
                    >
                      <span className="text-lg">🙂</span>
                      <span className="text-xs">{t('srs_rating_slow')}</span>
                    </Button>
                    <Button
                      onClick={() => handleRating(3)}
                      className="h-auto py-4 flex flex-col gap-1"
                    >
                      <CheckCircle className="h-5 w-5" />
                      <span className="text-xs">{t('srs_rating_fast')}</span>
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <Button onClick={() => setShowAnswer(true)} className="w-full" size="lg">
                {t('srs_show_answer')}
              </Button>
            )}
          </div>

          <div className="mt-6 flex justify-center">
            <Button variant="ghost" onClick={() => setCurrentItem(null)}>
              {t('srs_end_session')}
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title={t('srs_title')}
        description={t('srs_description')}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowAddDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t('srs_new_item')}
            </Button>
            {dueToday.length > 0 && (
              <Button onClick={startReview}>
                <Play className="mr-2 h-4 w-4" />
                {t('srs_start_review', undefined, { n: dueToday.length })}
              </Button>
            )}
          </div>
        }
      />

      <div className="mt-10 space-y-6">
        {/* Stats Overview */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 rounded-lg border border-border bg-card" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">{t('srs_today')}</span>
              </div>
              <p className="font-display text-2xl font-semibold">{dueToday.length}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                <span className="text-sm text-muted-foreground">{t('srs_upcoming_7')}</span>
              </div>
              <p className="font-display text-2xl font-semibold">{upcoming.length}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span className="text-sm text-muted-foreground">{t('srs_avg_score')}</span>
              </div>
              <p className="font-display text-2xl font-semibold">
                {items.length > 0
                  ? Math.round(
                      (items.reduce(
                        (sum, i) => sum + i.times_correct / Math.max(1, i.times_reviewed),
                        0
                      ) /
                        items.length) *
                        100
                    )
                  : 0}
                %
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="h-5 w-5 text-purple-500" />
                <span className="text-sm text-muted-foreground">{t('srs_total_items')}</span>
              </div>
              <p className="font-display text-2xl font-semibold">{items.length}</p>
            </div>
          </div>
        )}

        {/* Interval Schedule Info */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-display text-xl font-semibold mb-4">{t('srs_interval_schema')}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="p-4 rounded-lg bg-secondary/50">
              <h3 className="font-medium mb-2">{t('srs_standard')}</h3>
              <div className="flex flex-wrap gap-2">
                {STANDARD_INTERVALS.map((interval, i) => (
                  <span key={i} className="px-2 py-1 rounded bg-background text-xs">
                    D{i}:{' '}
                    {interval === 0 ? t('srs_first_time') : t('srs_days_count', undefined, { n: interval })}
                  </span>
                ))}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-secondary/50">
              <h3 className="font-medium mb-2">{t('srs_languages')}</h3>
              <div className="flex flex-wrap gap-2">
                {LANGUAGE_INTERVALS.map((interval, i) => (
                  <span key={i} className="px-2 py-1 rounded bg-background text-xs">
                    D{i}:{' '}
                    {interval === 0 ? t('srs_first_time') : t('srs_days_count', undefined, { n: interval })}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          <Button
            variant={filter === 'today' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('today')}
          >
            {t('srs_filter_today', undefined, { n: dueToday.length })}
          </Button>
          <Button
            variant={filter === 'upcoming' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('upcoming')}
          >
            {t('srs_filter_upcoming', undefined, { n: upcoming.length })}
          </Button>
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            {t('srs_filter_all', undefined, { n: items.length })}
          </Button>
        </div>

        {/* Items List */}
        {filteredItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-10 text-center">
            <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="font-display text-xl font-semibold mb-2">{t('srs_empty')}</h2>
            <p className="text-sm text-muted-foreground">
              {filter === 'today' ? t('srs_empty_today') : t('srs_empty_category')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <div key={item.id} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{item.vak}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">{item.onderwerp}</span>
                    </div>
                    <p className="text-sm mb-3">{item.vraag}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        {t('srs_interval_days', undefined, { n: item.interval })}
                      </span>
                      <span>•</span>
                      <span>Next: {item.next_review}</span>
                      <span>•</span>
                      <span>
                        Score:{' '}
                        {item.times_reviewed > 0
                          ? Math.round((item.times_correct / item.times_reviewed) * 100)
                          : 0}
                        %
                      </span>
                      <span>•</span>
                      <span>Ease: {item.ease.toFixed(2)}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => resetItem(item.id)}
                    title={t('srs_reset_title')}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Algorithm Info */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-display text-xl font-semibold mb-4">{t('srs_about_algorithm')}</h2>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>{t('srs_algorithm_text')}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="p-4 rounded-lg bg-secondary/50">
                <h3 className="font-medium text-foreground mb-2">{t('srs_score0_title')}</h3>
                <p>{t('srs_score0_desc')}</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50">
                <h3 className="font-medium text-foreground mb-2">{t('srs_score1_title')}</h3>
                <p>{t('srs_score1_desc')}</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50">
                <h3 className="font-medium text-foreground mb-2">{t('srs_score2_title')}</h3>
                <p>{t('srs_score2_desc')}</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50">
                <h3 className="font-medium text-foreground mb-2">{t('srs_score3_title')}</h3>
                <p>{t('srs_score3_desc')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Item Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('srs_add_item_title')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
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
                placeholder={t('srs_topic_placeholder')}
              />
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
            <div>
              <Label htmlFor="antwoord">{t('answer')}</Label>
              <Textarea
                id="antwoord"
                value={formData.antwoord}
                onChange={(e) => setFormData({ ...formData, antwoord: e.target.value })}
                placeholder={t('deck_answer_placeholder')}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleAddItem}>{t('srs_add_item')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
