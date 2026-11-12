'use client';

import { useState, useEffect } from 'react';
import { AppShell, PageHeader } from '@/components/AppShell';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, FileText, HelpCircle, Download, Trash2, Edit, CheckCircle2 } from 'lucide-react';

interface LessonNote {
  id: string;
  title: string;
  subject: string;
  date: string;
  content: string;
  questions: Array<{ id: string; text: string; status: 'pending' | 'answered' }>;
}

export default function LessonNotesPage() {
  const [notes, setNotes] = useState<LessonNote[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    subject: '',
    date: '',
    content: '',
  });

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = () => {
    try {
      const stored = localStorage.getItem('aether_lesson_notes');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Cast the status type properly
        const typedNotes: LessonNote[] = parsed.map((note: any) => ({
          ...note,
          questions: note.questions.map((q: any) => ({
            ...q,
            status: q.status as 'pending' | 'answered',
          })),
        }));
        setNotes(typedNotes);
      }
    } catch {
      setNotes([]);
    }
  };

  const saveNotes = (data: LessonNote[]) => {
    try {
      localStorage.setItem('aether_lesson_notes', JSON.stringify(data));
    } catch {
      console.error('Failed to save lesson notes');
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({
      title: '',
      subject: '',
      date: new Date().toISOString().split('T')[0],
      content: '',
    });
    setModalOpen(true);
  };

  const openEdit = (note: LessonNote) => {
    setEditingId(note.id);
    setForm({
      title: note.title,
      subject: note.subject,
      date: note.date,
      content: note.content,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newNote: LessonNote = {
      id: editingId || `note_${Date.now()}`,
      title: form.title,
      subject: form.subject,
      date: form.date,
      content: form.content,
      questions: [],
    };

    const updatedNotes = editingId
      ? notes.map((note) => (note.id === editingId ? newNote : note))
      : [...notes, newNote];

    setNotes(updatedNotes);
    saveNotes(updatedNotes);
    setModalOpen(false);
  };

  const deleteNote = (id: string) => {
    const updated = notes.filter((note) => note.id !== id);
    setNotes(updated);
    saveNotes(updated);
  };

  const addQuestion = (noteId: string) => {
    const questionText = prompt('Voer je vraag in:');
    if (!questionText) return;

    const newQuestion = { id: `q_${Date.now()}`, text: questionText, status: 'pending' as const };
    const updated = notes.map((note) =>
      note.id === noteId
        ? {
            ...note,
            questions: [...note.questions, newQuestion],
          }
        : note
    );
    setNotes(updated);
    saveNotes(updated);
  };

  const toggleQuestionStatus = (noteId: string, questionId: string) => {
    const updated = notes.map((note) =>
      note.id === noteId
        ? {
            ...note,
            questions: note.questions.map((q) => {
              const newStatus: 'pending' | 'answered' = q.status === 'pending' ? 'answered' : 'pending';
              return { ...q, status: newStatus };
            }),
          }
        : note
    );
    setNotes(updated);
    saveNotes(updated);
  };

  const exportQuestions = (note: LessonNote) => {
    const questionsText = note.questions
      .map((q, i) => `${i + 1}. ${q.text}`)
      .join('\n');
    const blob = new Blob([questionsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title}_vragen.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sortedNotes = [...notes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <AppShell>
      <PageHeader
        title="Les Notities"
        description="Maak notities tijdens lessen en genereer vragen voor docenten"
        action={
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nieuwe notitie
          </Button>
        }
        actionPosition="right"
      />

      <div className="mt-10">
        {sortedNotes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="font-display text-xl font-semibold mb-2">Geen notities</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Maak je eerste lesnotitie om te beginnen.
            </p>
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Nieuwe notitie
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedNotes.map((note) => (
              <div key={note.id} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{note.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {note.subject} · {new Date(note.date).toLocaleDateString('nl-NL')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="ghost" size="sm" onClick={() => openEdit(note)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => deleteNote(note.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {note.content && (
                  <div className="mb-4 p-3 rounded bg-secondary/50 text-sm">
                    {note.content}
                  </div>
                )}

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <HelpCircle className="h-4 w-4" />
                      Vragen ({note.questions.length})
                    </h4>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addQuestion(note.id)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Vraag toevoegen
                      </Button>
                      {note.questions.length > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => exportQuestions(note)}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Exporteren
                        </Button>
                      )}
                    </div>
                  </div>
                  {note.questions.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">Nog geen vragen</p>
                  ) : (
                    <div className="space-y-2">
                      {note.questions.map((question) => (
                        <div
                          key={question.id}
                          className="flex items-start gap-2 p-2 rounded border border-border hover:bg-secondary/50"
                        >
                          <button
                            type="button"
                            onClick={() => toggleQuestionStatus(note.id, question.id)}
                            className={`p-1 rounded-full transition-colors ${
                              question.status === 'answered'
                                ? 'bg-green-500 text-white'
                                : 'bg-secondary hover:bg-secondary/80'
                            }`}
                          >
                            <CheckCircle2 className="h-3 w-3" />
                          </button>
                          <span className={`text-sm flex-1 ${question.status === 'answered' ? 'line-through text-muted-foreground' : ''}`}>
                            {question.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Bewerk notitie' : 'Nieuwe notitie'}</DialogTitle>
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
              <Label htmlFor="date">Datum</Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="content">Notities</Label>
              <textarea
                id="content"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={6}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Typ je notities hier..."
              />
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
