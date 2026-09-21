'use client';

import { useState, useEffect } from 'react';
import { AppShell, PageHeader } from '@/components/AppShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit2, Trash2, Eye, FileText, FolderOpen } from 'lucide-react';
import { supabase as browserClient } from '@/lib/supabase/client';
import { useFilesystem } from '@/hooks/useFilesystem';
import { ButtonConfig } from '@/types/filesystem';
import ConfirmDialog from '@/components/ConfirmDialog';

const supabase = browserClient as any;

interface LeersetPage {
  id: string;
  title: string;
  description: string;
  content: any;
  button_config?: ButtonConfig;
  created_at: string;
  updated_at: string;
}

export default function AdminLeersetPages() {
  const [pages, setPages] = useState<LeersetPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showButtonDialog, setShowButtonDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<LeersetPage | null>(null);
  const [editingPage, setEditingPage] = useState<LeersetPage | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    buttonText: '',
    buttonIcon: '',
    buttonPlacement: 'root' as 'root' | 'subject' | 'chapter' | 'topic',
    buttonPlacementId: '',
  });
  const [createdPageId, setCreatedPageId] = useState<string | null>(null);
  const [createdPagePath, setCreatedPagePath] = useState<string>('');

  const { nodes, createNode, addButtonLink } = useFilesystem();

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const { data, error } = await supabase
        .from('leerset_pages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPages(data || []);
    } catch (error) {
      console.error('Failed to fetch leerset pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingPage(null);
    setFormData({
      title: '',
      description: '',
      content: '',
      buttonText: '',
      buttonIcon: '',
      buttonPlacement: 'root',
      buttonPlacementId: '',
    });
    setShowDialog(true);
  };

  const openEditDialog = (page: LeersetPage) => {
    setEditingPage(page);
    setFormData({
      title: page.title,
      description: page.description,
      content: JSON.stringify(page.content, null, 2),
      buttonText: page.button_config?.text || '',
      buttonIcon: page.button_config?.icon || '',
      buttonPlacement: page.button_config?.placement || 'root',
      buttonPlacementId: page.button_config?.placementId || '',
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    try {
      let content: any;
      try {
        content = JSON.parse(formData.content);
      } catch (_error) {
        alert('Invalid JSON content');
        return;
      }

      const buttonConfig: ButtonConfig | undefined = formData.buttonText
        ? {
            text: formData.buttonText,
            icon: formData.buttonIcon || undefined,
            targetPath: `/leerset/${formData.title.toLowerCase().replace(/\s+/g, '-')}`,
            placement: formData.buttonPlacement,
            placementId: formData.buttonPlacementId || undefined,
            style: 'primary',
          }
        : undefined;

      if (editingPage) {
        const { error } = await supabase
          .from('leerset_pages')
          .update({
            title: formData.title,
            description: formData.description,
            content,
            button_config: buttonConfig,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingPage.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('leerset_pages')
          .insert({
            title: formData.title,
            description: formData.description,
            content,
            button_config: buttonConfig,
          })
          .select()
          .single();

        if (error) throw error;

        // Store created page info for button dialog
        setCreatedPageId(data.id);
        setCreatedPagePath(`/leerset/${formData.title.toLowerCase().replace(/\s+/g, '-')}`);

        // Create filesystem node
        const pagePath = `/leerset/${formData.title.toLowerCase().replace(/\s+/g, '-')}`;
        await createNode('leerset_page', formData.title, 'root', {
          leersetPage: {
            title: formData.title,
            description: formData.description,
            content,
            buttonConfig,
          },
        });

        // Show button dialog to ask if admin wants to add a button
        setShowButtonDialog(true);
      }

      setShowDialog(false);
      fetchPages();
    } catch (error) {
      console.error('Failed to save leerset page:', error);
      alert('Failed to save leerset page');
    }
  };

  const handleDelete = async (id: string) => {
    const page = pages.find(p => p.id === id);
    if (page) {
      setPageToDelete(page);
      setShowDeleteDialog(true);
    }
  };

  const confirmDelete = async () => {
    if (!pageToDelete) return;

    try {
      const { error } = await supabase.from('leerset_pages').delete().eq('id', pageToDelete.id);
      if (error) throw error;
      fetchPages();
      setShowDeleteDialog(false);
      setPageToDelete(null);
    } catch (error) {
      console.error('Failed to delete leerset page:', error);
      alert('Failed to delete leerset page');
    }
  };

  const getFilesystemNodes = () => {
    return nodes.filter(node => 
      node.type === 'subject' || node.type === 'chapter' || node.type === 'paragraph'
    );
  };

  if (loading) {
    return (
      <AppShell>
        <PageHeader title="Leerset Pages" description="Manage JSON leerset pages" />
        <div className="mt-10">Loading...</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="Leerset Pages"
        description="Create and manage JSON leerset pages with button placement"
        action={
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            New Leerset Page
          </Button>
        }
      />

      <div className="mt-8 grid gap-4">
        {pages.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No leerset pages yet. Create your first one!</p>
          </div>
        ) : (
          pages.map((page) => (
            <div
              key={page.id}
              className="border rounded-lg p-6 hover:border-border/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{page.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{page.description}</p>
                  
                  {page.button_config && (
                    <div className="mt-3 flex items-center gap-2 text-sm">
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded">
                        Button: {page.button_config.text}
                      </span>
                      <span className="text-muted-foreground">
                        Placement: {page.button_config.placement}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/leerset/${page.id}`, '_blank')}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(page)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(page.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPage ? 'Edit Leerset Page' : 'Create Leerset Page'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Bijv. Biologie H1"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Wat leer je in deze leerset?"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="content">JSON Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder='{"sections": [...]}'
                rows={10}
                className="font-mono text-sm"
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Button Configuration</h3>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="buttonText">Button Text (default: title)</Label>
                  <Input
                    id="buttonText"
                    value={formData.buttonText}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    placeholder="Leave empty to use title"
                  />
                </div>

                <div>
                  <Label htmlFor="buttonIcon">Button Icon (optional)</Label>
                  <Input
                    id="buttonIcon"
                    value={formData.buttonIcon}
                    onChange={(e) => setFormData({ ...formData, buttonIcon: e.target.value })}
                    placeholder="Bijv. book-open"
                  />
                </div>

                <div>
                  <Label htmlFor="buttonPlacement">Button Placement</Label>
                  <Select
                    value={formData.buttonPlacement}
                    onValueChange={(value: 'root' | 'subject' | 'chapter' | 'paragraph') =>
                      setFormData({ ...formData, buttonPlacement: value })
                    }
                  >
                    <SelectTrigger id="buttonPlacement">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="root">Root (Homepage)</SelectItem>
                      <SelectItem value="subject">Inside Subject</SelectItem>
                      <SelectItem value="chapter">Inside Chapter</SelectItem>
                      <SelectItem value="topic">Inside Topic/Paragraph</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.buttonPlacement !== 'root' && (
                  <div>
                    <Label htmlFor="buttonPlacementId">Target {formData.buttonPlacement}</Label>
                    <Select
                      value={formData.buttonPlacementId}
                      onValueChange={(value) => setFormData({ ...formData, buttonPlacementId: value })}
                    >
                      <SelectTrigger id="buttonPlacementId">
                        <SelectValue placeholder={`Select ${formData.buttonPlacement}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {getFilesystemNodes().map((node) => (
                          <SelectItem key={node.id} value={node.id}>
                            <div className="flex items-center gap-2">
                              {node.type === 'subject' && <FolderOpen className="h-4 w-4" />}
                              <span>{node.name}</span>
                              <span className="text-xs text-muted-foreground">({node.type})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingPage ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Button Creation Dialog */}
      <Dialog open={showButtonDialog} onOpenChange={setShowButtonDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Shortcut Button?</DialogTitle>
            <DialogDescription>
              Would you like to add a shortcut button to this leerset page? This will allow users to quickly navigate to this content from specific locations.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex gap-3">
              <Button onClick={() => setShowButtonDialog(false)}>
                No, Skip
              </Button>
              <Button 
                onClick={() => {
                  setShowButtonDialog(false);
                  // Navigate to button management page with pre-filled data
                  window.location.href = `/admin/buttons?create=true&targetPath=${encodeURIComponent(createdPagePath)}&targetId=${createdPageId}&targetType=leerset_page&buttonText=${encodeURIComponent(formData.title || createdPagePath)}`;
                }}
              >
                Yes, Add Button
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Leerset pagina verwijderen"
        description={`Weet je zeker dat je "${pageToDelete?.title}" wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.`}
        onConfirm={confirmDelete}
        confirmText="Verwijderen"
        cancelText="Annuleren"
        variant="destructive"
      />
    </AppShell>
  );
}