'use client';

import { useState, useEffect } from 'react';
import { AppShell, PageHeader } from '@/components/AppShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit2, Trash2, ExternalLink } from 'lucide-react';
import { supabase as browserClient } from '@/lib/supabase/client';
import ConfirmDialog from '@/components/ConfirmDialog';

interface ContentButton {
  id: string;
  created_by: string;
  target_type: 'leerset_page' | 'study_set' | 'note' | 'custom_url';
  target_id: string;
  target_path: string;
  button_text: string;
  button_icon?: string;
  placement: 'root' | 'subject' | 'chapter' | 'topic';
  placement_id?: string;
  button_style: 'primary' | 'secondary' | 'outline';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Subject {
  id: string;
  name: string;
}

interface Chapter {
  id: string;
  name: string;
  subject_id: string;
}

interface Topic {
  id: string;
  name: string;
  chapter_id: string;
}

export default function AdminButtonManagement() {
  const [buttons, setButtons] = useState<ContentButton[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingButton, setEditingButton] = useState<ContentButton | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [buttonToDelete, setButtonToDelete] = useState<ContentButton | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [formData, setFormData] = useState({
    target_type: 'leerset_page' as 'leerset_page' | 'study_set' | 'note' | 'custom_url',
    target_id: '',
    target_path: '',
    button_text: '',
    button_icon: '',
    placement: 'root' as 'root' | 'subject' | 'chapter' | 'topic',
    placement_id: '',
    button_style: 'primary' as 'primary' | 'secondary' | 'outline',
  });

  // Check for URL parameters for pre-filling from leerset page creation
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const create = urlParams.get('create');
    const targetPath = urlParams.get('targetPath');
    const targetId = urlParams.get('targetId');
    const targetType = urlParams.get('targetType');
    const buttonText = urlParams.get('buttonText');

    if (create === 'true' && targetPath && targetId && targetType) {
      setFormData({
        target_type: targetType as any,
        target_id: targetId,
        target_path: targetPath,
        button_text: buttonText || targetPath,
        button_icon: '',
        placement: 'root',
        placement_id: '',
        button_style: 'primary',
      });
      setShowDialog(true);
    }
  }, []);

  useEffect(() => {
    loadButtons();
    loadSubjects();
  }, []);

  const loadButtons = async () => {
    try {
      const { data, error } = await (browserClient as any)
        .from('content_buttons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setButtons(data || []);
    } catch (error) {
      console.error('Error loading buttons:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubjects = async () => {
    try {
      const { data, error } = await (browserClient as any)
        .from('subjects')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  };

  const loadChapters = async (subjectId: string) => {
    try {
      const { data, error } = await (browserClient as any)
        .from('subject_chapters')
        .select('id, name, subject_id')
        .eq('subject_id', subjectId)
        .order('number');

      if (error) throw error;
      setChapters(data || []);
    } catch (error) {
      console.error('Error loading chapters:', error);
    }
  };

  const loadTopics = async (chapterId: string) => {
    try {
      const { data, error } = await (browserClient as any)
        .from('subject_topics')
        .select('id, name, chapter_id')
        .eq('chapter_id', chapterId)
        .order('name');

      if (error) throw error;
      setTopics(data || []);
    } catch (error) {
      console.error('Error loading topics:', error);
    }
  };

  const handleCreate = () => {
    setEditingButton(null);
    setFormData({
      target_type: 'leerset_page',
      target_id: '',
      target_path: '',
      button_text: '',
      button_icon: '',
      placement: 'root',
      placement_id: '',
      button_style: 'primary',
    });
    setShowDialog(true);
  };

  const handleEdit = (button: ContentButton) => {
    setEditingButton(button);
    setFormData({
      target_type: button.target_type,
      target_id: button.target_id,
      target_path: button.target_path,
      button_text: button.button_text,
      button_icon: button.button_icon || '',
      placement: button.placement,
      placement_id: button.placement_id || '',
      button_style: button.button_style,
    });
    setShowDialog(true);
  };

  const confirmDelete = async () => {
    if (!buttonToDelete) return;

    try {
      const { error } = await (browserClient as any)
        .from('content_buttons')
        .delete()
        .eq('id', buttonToDelete.id);

      if (error) throw error;
      await loadButtons();
      setShowDeleteDialog(false);
      setButtonToDelete(null);
    } catch (error) {
      console.error('Error deleting button:', error);
      alert('Failed to delete button');
    }
  };

  const handleDelete = (button: ContentButton) => {
    setButtonToDelete(button);
    setShowDeleteDialog(true);
  };

  const handleSave = async () => {
    try {
      const { data: { user } } = await browserClient.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (editingButton) {
        const { error } = await (browserClient as any)
          .from('content_buttons')
          .update({
            target_type: formData.target_type,
            target_id: formData.target_id,
            target_path: formData.target_path,
            button_text: formData.button_text,
            button_icon: formData.button_icon || null,
            placement: formData.placement,
            placement_id: formData.placement_id || null,
            button_style: formData.button_style,
          })
          .eq('id', editingButton.id);

        if (error) throw error;
      } else {
        const { error } = await (browserClient as any)
          .from('content_buttons')
          .insert({
            created_by: user.id,
            target_type: formData.target_type,
            target_id: formData.target_id,
            target_path: formData.target_path,
            button_text: formData.button_text,
            button_icon: formData.button_icon || null,
            placement: formData.placement,
            placement_id: formData.placement_id || null,
            button_style: formData.button_style,
            is_active: true,
          });

        if (error) throw error;
      }

      await loadButtons();
      setShowDialog(false);
    } catch (error) {
      console.error('Error saving button:', error);
      alert('Failed to save button');
    }
  };

  const handlePlacementChange = async (placement: string) => {
    setFormData({ ...formData, placement: placement as 'root' | 'subject' | 'chapter' | 'topic', placement_id: '' });
    
    if (placement === 'subject') {
      setChapters([]);
      setTopics([]);
    } else if (placement === 'chapter') {
      setTopics([]);
    }
  };

  const handleSubjectChange = async (subjectId: string) => {
    setFormData({ ...formData, placement_id: subjectId });
    await loadChapters(subjectId);
  };

  const handleChapterChange = async (chapterId: string) => {
    setFormData({ ...formData, placement_id: chapterId });
    await loadTopics(chapterId);
  };

  const handleTopicChange = (topicId: string) => {
    setFormData({ ...formData, placement_id: topicId });
  };

  const getPlacementName = (button: ContentButton) => {
    if (button.placement === 'root') return 'Homepage';
    if (button.placement === 'subject') {
      const subject = subjects.find(s => s.id === button.placement_id);
      return subject ? `Subject: ${subject.name}` : 'Unknown Subject';
    }
    if (button.placement === 'chapter') {
      const chapter = chapters.find(c => c.id === button.placement_id);
      return chapter ? `Chapter: ${chapter.name}` : 'Unknown Chapter';
    }
    if (button.placement === 'topic') {
      const topic = topics.find(t => t.id === button.placement_id);
      return topic ? `Topic: ${topic.name}` : 'Unknown Topic';
    }
    return button.placement;
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="Button Management"
        description="Manage shortcut buttons across the platform"
        action={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create Button
          </Button>
        }
      />

      <div className="space-y-4">
        {buttons.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No buttons created yet. Click "Create Button" to add one.
          </div>
        ) : (
          <div className="grid gap-4">
            {buttons.map((button) => (
              <div
                key={button.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg bg-background"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <ExternalLink className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{button.button_text}</span>
                    {!button.is_active && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>
                      <span className="font-medium">Target:</span> {button.target_path}
                    </div>
                    <div>
                      <span className="font-medium">Type:</span> {button.target_type}
                    </div>
                    <div>
                      <span className="font-medium">Placement:</span> {getPlacementName(button)}
                    </div>
                    <div>
                      <span className="font-medium">Style:</span> {button.button_style}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(button)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(button)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingButton ? 'Edit Button' : 'Create Button'}
            </DialogTitle>
            <DialogDescription>
              Configure a shortcut button to navigate to content
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="button_text">Button Text</Label>
              <Input
                id="button_text"
                value={formData.button_text}
                onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                placeholder="e.g., Rekenvaardigheid Basis"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_path">Target Path</Label>
              <Input
                id="target_path"
                value={formData.target_path}
                onChange={(e) => setFormData({ ...formData, target_path: e.target.value })}
                placeholder="/leerset/rekenvaardigheid-basis"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_type">Target Type</Label>
              <Select
                value={formData.target_type}
                onValueChange={(value: any) => setFormData({ ...formData, target_type: value })}
              >
                <SelectTrigger id="target_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="leerset_page">Leerset Page</SelectItem>
                  <SelectItem value="study_set">Study Set</SelectItem>
                  <SelectItem value="note">Note</SelectItem>
                  <SelectItem value="custom_url">Custom URL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_id">Target ID</Label>
              <Input
                id="target_id"
                value={formData.target_id}
                onChange={(e) => setFormData({ ...formData, target_id: e.target.value })}
                placeholder="ID of target content"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="placement">Placement Location</Label>
              <Select
                value={formData.placement}
                onValueChange={handlePlacementChange}
              >
                <SelectTrigger id="placement">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="root">Homepage (Root)</SelectItem>
                  <SelectItem value="subject">Subject</SelectItem>
                  <SelectItem value="chapter">Chapter</SelectItem>
                  <SelectItem value="topic">Topic/Paragraph</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.placement === 'subject' && (
              <div className="space-y-2">
                <Label htmlFor="subject">Select Subject</Label>
                <Select value={formData.placement_id || ''} onValueChange={handleSubjectChange}>
                  <SelectTrigger id="subject">
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.placement === 'chapter' && formData.placement_id && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="subject">Select Subject</Label>
                  <Select
                    value={subjects.find(s => s.id === formData.placement_id)?.id || ''}
                    onValueChange={handleSubjectChange}
                  >
                    <SelectTrigger id="subject">
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {chapters.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="chapter">Select Chapter</Label>
                    <Select
                      value={formData.placement_id || ''}
                      onValueChange={handleChapterChange}
                    >
                      <SelectTrigger id="chapter">
                        <SelectValue placeholder="Select a chapter" />
                      </SelectTrigger>
                      <SelectContent>
                        {chapters.map((chapter) => (
                          <SelectItem key={chapter.id} value={chapter.id}>
                            {chapter.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}

            {formData.placement === 'topic' && formData.placement_id && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="subject">Select Subject</Label>
                  <Select
                    value={subjects.find(s => chapters.find(c => c.id === formData.placement_id)?.subject_id === s.id)?.id || ''}
                    onValueChange={handleSubjectChange}
                  >
                    <SelectTrigger id="subject">
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {chapters.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="chapter">Select Chapter</Label>
                    <Select
                      value={chapters.find(c => topics.find(t => t.id === formData.placement_id)?.chapter_id === c.id)?.id || ''}
                      onValueChange={handleChapterChange}
                    >
                      <SelectTrigger id="chapter">
                        <SelectValue placeholder="Select a chapter" />
                      </SelectTrigger>
                      <SelectContent>
                        {chapters.map((chapter) => (
                          <SelectItem key={chapter.id} value={chapter.id}>
                            {chapter.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {topics.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="topic">Select Topic</Label>
                    <Select
                      value={formData.placement_id || ''}
                      onValueChange={handleTopicChange}
                    >
                      <SelectTrigger id="topic">
                        <SelectValue placeholder="Select a topic" />
                      </SelectTrigger>
                      <SelectContent>
                        {topics.map((topic) => (
                          <SelectItem key={topic.id} value={topic.id}>
                            {topic.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="button_style">Button Style</Label>
              <Select
                value={formData.button_style}
                onValueChange={(value: any) => setFormData({ ...formData, button_style: value })}
              >
                <SelectTrigger id="button_style">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">Primary</SelectItem>
                  <SelectItem value="secondary">Secondary</SelectItem>
                  <SelectItem value="outline">Outline</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingButton ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Button verwijderen"
        description={`Weet je zeker dat je de button "${buttonToDelete?.button_text}" wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.`}
        onConfirm={confirmDelete}
        confirmText="Verwijderen"
        cancelText="Annuleren"
        variant="destructive"
      />
    </AppShell>
  );
}