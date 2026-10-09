'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Edit2, Save, X, BookOpen } from 'lucide-react';
import { AppShell, PageHeader } from '@/components/AppShell';

interface Subject {
  id: string;
  name: string;
  description: string;
  slug: string;
  createdAt: string;
}

interface SubjectsData {
  subjects: Subject[];
  lastUpdated: string;
}

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Subject>>({
    name: '',
    description: '',
    slug: ''
  });

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      const response = await fetch('/api/admin/subjects');
      if (response.ok) {
        const data: SubjectsData = await response.json();
        setSubjects(data.subjects || []);
      } else {
        // Try to load directly from JSON file
        const jsonResponse = await fetch('/admin-subjects.json');
        if (jsonResponse.ok) {
          const data: SubjectsData = await jsonResponse.json();
          setSubjects(data.subjects || []);
        }
      }
    } catch (error) {
      console.error('Error loading subjects:', error);
      // Try to load directly from JSON file as fallback
      try {
        const jsonResponse = await fetch('/admin-subjects.json');
        if (jsonResponse.ok) {
          const data: SubjectsData = await jsonResponse.json();
          setSubjects(data.subjects || []);
        }
      } catch (jsonError) {
        console.error('Error loading subjects from JSON:', jsonError);
      }
    } finally {
      setLoading(false);
    }
  };

  const saveSubjects = async (subjectsToSave: Subject[]) => {
    try {
      const response = await fetch('/api/admin/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjects: subjectsToSave }),
      });

      if (response.ok) {
        setSubjects(subjectsToSave);
        setShowForm(false);
        setEditingId(null);
        setFormData({
          name: '',
          description: '',
          slug: ''
        });
      } else {
        // If API fails, update local state anyway (for dev mode)
        setSubjects(subjectsToSave);
        setShowForm(false);
        setEditingId(null);
        setFormData({
          name: '',
          description: '',
          slug: ''
        });
      }
    } catch (error) {
      console.error('Error saving subjects:', error);
      // Update local state anyway (for dev mode)
      setSubjects(subjectsToSave);
      setShowForm(false);
      setEditingId(null);
      setFormData({
        name: '',
        description: '',
        slug: ''
      });
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleAdd = () => {
    const slug = formData.slug || generateSlug(formData.name || '');
    const newSubject: Subject = {
      id: `subject-${Date.now()}`,
      name: formData.name || '',
      description: formData.description || '',
      slug,
      createdAt: new Date().toISOString()
    };

    saveSubjects([...subjects, newSubject]);
  };

  const handleUpdate = () => {
    if (!editingId) return;

    const slug = formData.slug || generateSlug(formData.name || '');
    const updatedSubjects = subjects.map(subject =>
      subject.id === editingId
        ? { ...subject, ...formData, slug }
        : subject
    );

    saveSubjects(updatedSubjects);
  };

  const handleDelete = (id: string) => {
    const updatedSubjects = subjects.filter(subject => subject.id !== id);
    saveSubjects(updatedSubjects);
  };

  const startEdit = (subject: Subject) => {
    setEditingId(subject.id);
    setFormData(subject);
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setShowForm(false);
    setFormData({
      name: '',
      description: '',
      slug: ''
    });
  };

  if (loading) {
    return (
      <AppShell>
        <PageHeader title="Vakken Beheren" description="Beheer vakken voor de hele applicatie" />
        <div className="flex items-center justify-center py-20">
          <div className="text-muted-foreground">Laden...</div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="Vakken Beheren"
        description="Beheer vakken voor de hele applicatie"
        action={
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nieuw Vak
          </Button>
        }
      />

      <div className="space-y-6">
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? 'Vak Bewerken' : 'Nieuw Vak'}</CardTitle>
              <CardDescription>
                Vul de details in voor het vak
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Vaknaam *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Bijv. Natuurkunde"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="natuurkunde"
                />
                <p className="text-xs text-muted-foreground">
                  Wordt automatisch gegenereerd indien leeg gelaten
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Beschrijving</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Beschrijving van het vak"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                {editingId ? (
                  <>
                    <Button onClick={handleUpdate}>
                      <Save className="h-4 w-4 mr-2" />
                      Opslaan
                    </Button>
                    <Button variant="outline" onClick={cancelEdit}>
                      <X className="h-4 w-4 mr-2" />
                      Annuleren
                    </Button>
                  </>
                ) : (
                  <>
                    <Button onClick={handleAdd}>
                      <Plus className="h-4 w-4 mr-2" />
                      Toevoegen
                    </Button>
                    <Button variant="outline" onClick={cancelEdit}>
                      <X className="h-4 w-4 mr-2" />
                      Annuleren
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <Card key={subject.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{subject.name}</CardTitle>
                    <CardDescription className="mt-1">
                      /{subject.slug}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(subject)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(subject.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {subject.description && (
                    <p className="text-sm text-muted-foreground">{subject.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Aangemaakt: {new Date(subject.createdAt).toLocaleDateString('nl-NL')}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}

          {subjects.length === 0 && !showForm && (
            <div className="col-span-full text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Geen vakken gevonden</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
