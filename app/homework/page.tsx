'use client';

import { useState, useEffect } from 'react';
import { AppShell, PageHeader } from '@/components/AppShell';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, CheckCircle2, Clock, Calendar, Trash2, Edit } from 'lucide-react';

type Grade = 'red' | 'orange' | 'green' | 'not_graded';
type Priority = 'low' | 'medium' | 'high';

interface Homework {
  id: string;
  title: string;
  subject: string;
  description?: string;
  dueDate: string;
  grade: Grade;
  priority: Priority;
  subtasks: Array<{ id: string; title: string; completed: boolean }>;
  estimatedTime?: number;
  completed: boolean;
  recurring?: 'daily' | 'weekly' | 'none';
}

const GRADE_LABELS: Record<Grade, string> = {
  red: 'Rood',
  orange: 'Oranje',
  green: 'Groen',
  not_graded: 'Niet nagekeken',
};

const GRADE_COLORS: Record<Grade, string> = {
  red: 'bg-red-500 text-white',
  orange: 'bg-orange-500 text-white',
  green: 'bg-green-500 text-white',
  not_graded: 'bg-gray-500 text-white',
};

const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Laag',
  medium: 'Middel',
  high: 'Hoog',
};

const PRIORITY_COLORS: Record<Priority, string> = {
  low: 'text-blue-500 bg-blue-500/10',
  medium: 'text-yellow-500 bg-yellow-500/10',
  high: 'text-red-500 bg-red-500/10',
};

export default function HomeworkPage() {
  const [homework, setHomework] = useState<Homework[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    subject: '',
    description: '',
    dueDate: '',
    grade: 'not_graded' as Grade,
    priority: 'medium' as Priority,
    estimatedTime: '',
    recurring: 'none' as 'daily' | 'weekly' | 'none',
  });

  useEffect(() => {
    loadHomework();
  }, []);

  const loadHomework = () => {
    try {
      const stored = localStorage.getItem('aether_homework');
      if (stored) {
        setHomework(JSON.parse(stored));
      }
    } catch {
      setHomework([]);
    }
  };

  const saveHomework = (data: Homework[]) => {
    try {
      localStorage.setItem('aether_homework', JSON.stringify(data));
    } catch {
      console.error('Failed to save homework');
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({
      title: '',
      subject: '',
      description: '',
      dueDate: '',
      grade: 'not_graded',
      priority: 'medium',
      estimatedTime: '',
      recurring: 'none',
    });
    setModalOpen(true);
  };

  const openEdit = (item: Homework) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      subject: item.subject,
      description: item.description || '',
      dueDate: item.dueDate,
      grade: item.grade,
      priority: item.priority,
      estimatedTime: item.estimatedTime?.toString() || '',
      recurring: item.recurring || 'none',
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newItem: Homework = {
      id: editingId || `hw_${Date.now()}`,
      title: form.title,
      subject: form.subject,
      description: form.description,
      dueDate: form.dueDate,
      grade: form.grade,
      priority: form.priority,
      subtasks: [],
      estimatedTime: form.estimatedTime ? parseInt(form.estimatedTime) : undefined,
      completed: false,
      recurring: form.recurring,
    };

    if (editingId) {
      setHomework((prev) => prev.map((item) => (item.id === editingId ? newItem : item)));
    } else {
      setHomework((prev) => [...prev, newItem]);
    }

    saveHomework(editingId ? homework.map((item) => (item.id === editingId ? newItem : item)) : [...homework, newItem]);
    setModalOpen(false);
  };

  const deleteHomework = (id: string) => {
    const updated = homework.filter((item) => item.id !== id);
    setHomework(updated);
    saveHomework(updated);
  };

  const toggleComplete = (id: string) => {
    const updated = homework.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setHomework(updated);
    saveHomework(updated);
  };

  const getActionSuggestion = (grade: Grade): string => {
    switch (grade) {
      case 'red':
        return 'Herhaal dit onderwerp en vraag om extra uitleg';
      case 'orange':
        return 'Oefen meer met dit onderwerp';
      case 'green':
        return 'Ga door met dit niveau';
      case 'not_graded':
        return 'Wacht op beoordeling';
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const sortedHomework = [...homework].sort((a, b) => {
    // Sort by completion first
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    // Then by due date
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  return (
    <AppShell>
      <PageHeader
        title="Huiswerk"
        description="Beheer je huiswerkopdrachten met kleurgecodeerde beoordeling"
        action={
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nieuwe opdracht
          </Button>
        }
        actionPosition="right"
      />

      <div className="mt-10">
        {sortedHomework.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="font-display text-xl font-semibold mb-2">Geen huiswerk</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Voeg je eerste huiswerkopdracht toe om te beginnen.
            </p>
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Nieuwe opdracht
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedHomework.map((item) => (
              <div
                key={item.id}
                className={`rounded-xl border p-5 transition-colors ${
                  item.completed
                    ? 'border-border bg-muted/30 opacity-60'
                    : isOverdue(item.dueDate)
                    ? 'border-red-500 bg-red-500/5'
                    : 'border-border bg-card'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <button
                        type="button"
                        onClick={() => toggleComplete(item.id)}
                        className={`p-1 rounded-full transition-colors ${
                          item.completed ? 'bg-green-500 text-white' : 'bg-secondary hover:bg-secondary/80'
                        }`}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </button>
                      <h3 className={`font-semibold ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {item.title}
                      </h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${PRIORITY_COLORS[item.priority]}`}>
                        {PRIORITY_LABELS[item.priority]}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${GRADE_COLORS[item.grade]}`}>
                        {GRADE_LABELS[item.grade]}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{item.subject}</p>
                    {item.description && (
                      <p className="text-sm mb-3">{item.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(item.dueDate).toLocaleDateString('nl-NL')}
                      </div>
                      {item.estimatedTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {item.estimatedTime} min
                        </div>
                      )}
                      {item.recurring !== 'none' && (
                        <span className="text-primary">
                          {item.recurring === 'daily' ? 'Dagelijks' : 'Wekelijks'}
                        </span>
                      )}
                    </div>
                    {item.grade !== 'not_graded' && !item.completed && (
                      <div className="mt-3 p-3 rounded bg-secondary/50 text-sm">
                        <p className="font-medium mb-1">Actie:</p>
                        <p className="text-muted-foreground">{getActionSuggestion(item.grade)}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteHomework(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Bewerk opdracht' : 'Nieuwe opdracht'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Titel</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="subject">Vak</Label>
              <Input
                id="subject"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Beschrijving (optioneel)</Label>
              <Input
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="dueDate">Deadline</Label>
              <Input
                id="dueDate"
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="priority">Prioriteit</Label>
              <select
                id="priority"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}
                className="w-full h-10 rounded-md border border-input bg-background px-3"
              >
                <option value="low">Laag</option>
                <option value="medium">Middel</option>
                <option value="high">Hoog</option>
              </select>
            </div>
            <div>
              <Label htmlFor="grade">Beoordeling</Label>
              <select
                id="grade"
                value={form.grade}
                onChange={(e) => setForm({ ...form, grade: e.target.value as Grade })}
                className="w-full h-10 rounded-md border border-input bg-background px-3"
              >
                <option value="not_graded">Niet nagekeken</option>
                <option value="green">Groen</option>
                <option value="orange">Oranje</option>
                <option value="red">Rood</option>
              </select>
            </div>
            <div>
              <Label htmlFor="estimatedTime">Geschatte tijd (minuten)</Label>
              <Input
                id="estimatedTime"
                type="number"
                value={form.estimatedTime}
                onChange={(e) => setForm({ ...form, estimatedTime: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="recurring">Herhaling</Label>
              <select
                id="recurring"
                value={form.recurring}
                onChange={(e) => setForm({ ...form, recurring: e.target.value as 'daily' | 'weekly' | 'none' })}
                className="w-full h-10 rounded-md border border-input bg-background px-3"
              >
                <option value="none">Geen</option>
                <option value="daily">Dagelijks</option>
                <option value="weekly">Wekelijks</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Annuleren
              </Button>
              <Button type="submit">{editingId ? 'Opslaan' : 'Toevoegen'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
