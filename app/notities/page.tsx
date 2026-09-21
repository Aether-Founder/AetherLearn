'use client';

import { AppShell } from '@/components/AppShell';
import { useEffect, useRef, useState } from 'react';
import { supabase as browserClient } from '@/lib/supabase/client';
import { useWorkspaceStore, type WorkspaceItem } from '@/store/useWorkspaceStore';
import { OfflineStorage, LocalNote } from '@/lib/offline/storage';
import { ChevronDown, ChevronRight, Edit, Eye, FolderPlus, Plus, Type, SpellCheck } from 'lucide-react';
import { useTranslation } from '@/lib/useTranslation';
import { marked } from 'marked';
import VisualToolsToolbar from '@/components/notes/VisualToolsToolbar';
import { Diagram, MindMap, Drawing } from '@/types/filesystem';
import DiagramEditor from '@/components/notes/DiagramEditor';
import MindMapEditor from '@/components/notes/MindMapEditor';
import DrawingEditor from '@/components/notes/DrawingEditor';
import { exportNoteAsText } from '@/utils/noteExportUtils';
import { useFilesystem } from '@/hooks/useFilesystem';
import { filesystemService } from '@/lib/filesystem/filesystemService';
import FileOperationsMenu from '@/components/filesystem/FileOperationsMenu';
import { useContentCache } from '@/hooks/useContentCache';

const supabase = browserClient as any;

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

type DragState = {
  draggedId: string | null;
  dropTargetId: string | null;
  droppedId: string | null;
  setDraggedId: (id: string | null) => void;
  setDropTargetId: (id: string | null) => void;
  setDroppedId: (id: string | null) => void;
};

function TreeItem({
  item,
  level = 0,
  dragState,
}: {
  item: WorkspaceItem;
  level?: number;
  dragState: DragState;
}) {
  const { t } = useTranslation();
  const { getChildren, toggleMapExpanded, expandedMaps, setSelectedId, selectedId } =
    useWorkspaceStore();
  const { moveNode, renameNode, deleteNode, duplicateNode, addButtonLink, nodes } = useFilesystem();
  const [menuOpen, setMenuOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [name, setName] = useState(item.name);
  const children = getChildren(item.id);
  const isExpanded = expandedMaps.has(item.id);
  const isSelected = selectedId === item.id;

  const handleFileSystemMove = async (nodeId: string, newParentId: string) => {
    try {
      await moveNode(nodeId, newParentId);
    } catch (error) {
      console.error('Failed to move item:', error);
      alert('Failed to move item');
    }
  };

  const handleFileSystemRename = async (nodeId: string, newName: string) => {
    try {
      await renameNode(nodeId, newName);
      // Also update the workspace item
      await updateItem({ name: newName });
    } catch (error) {
      console.error('Failed to rename item:', error);
      alert('Failed to rename item');
    }
  };

  const handleFileSystemDelete = async (nodeId: string) => {
    try {
      await deleteNode(nodeId);
      // Also remove from workspace
      await remove();
    } catch (error) {
      console.error('Failed to delete item:', error);
      alert('Failed to delete item');
    }
  };

  const handleFileSystemDuplicate = async (nodeId: string) => {
    try {
      await duplicateNode(nodeId);
      // Also duplicate in workspace
      await duplicate();
    } catch (error) {
      console.error('Failed to duplicate item:', error);
      alert('Failed to duplicate item');
    }
  };

  const handleCreateShortcut = async (nodeId: string, targetPath: string, buttonText: string) => {
    try {
      await addButtonLink(targetPath, buttonText, 'root');
      alert('Shortcut created successfully');
    } catch (error) {
      console.error('Failed to create shortcut:', error);
      alert('Failed to create shortcut');
    }
  };

  const updateItem = async (updates: Partial<WorkspaceItem>) => {
    useWorkspaceStore.getState().updateItemOptimistic(item.id, updates);

    const isOnline = navigator.onLine;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user && item.type === 'page') {
      const contentValue = updates.content !== undefined ? updates.content : item.content;
      const contentString =
        typeof contentValue === 'string' ? contentValue : JSON.stringify(contentValue);

      const localNote: LocalNote = {
        id: item.id,
        user_id: user.id,
        title: updates.name || item.name,
        content: contentString,
        type: 'page',
        parent_id: item.parent_id || undefined,
        created_at: item.created_at,
        updated_at: new Date().toISOString(),
        sync_status: isOnline ? 'synced' : 'pending',
        remote_id: item.id,
      };
      await OfflineStorage.saveNote(localNote);
    }

    if (isOnline) {
      await supabase
        .from('workspace_items')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', item.id);
    }
  };

  const rename = async () => {
    const trimmedName = name.trim();
    if (trimmedName && trimmedName !== item.name) await updateItem({ name: trimmedName });
    setRenameOpen(false);
    setMenuOpen(false);
  };

  const duplicate = async () => {
    const { id: _id, created_at: _createdAt, updated_at: _updatedAt, ...copy } = item;
    const id = useWorkspaceStore
      .getState()
      .createItemOptimistic({
        ...copy,
        name: `${item.name} kopie`,
        order_index: item.order_index + 1,
      });
    try {
      const { data } = await supabase
        .from('workspace_items')
        .insert({ ...copy, id, name: `${item.name} kopie`, order_index: item.order_index + 1 })
        .select()
        .single();
      if (data) useWorkspaceStore.getState().updateItemOptimistic(id, data);
    } finally {
      setMenuOpen(false);
    }
  };

  const remove = async () => {
    if (confirm(t('notes_delete_confirm', undefined, { name: item.name }))) {
      useWorkspaceStore.getState().deleteItemOptimistic(item.id);
      await supabase.from('workspace_items').delete().eq('id', item.id);
    }
    setMenuOpen(false);
  };

  const moveInto = async (folder: WorkspaceItem, draggedItem: WorkspaceItem) => {
    if (draggedItem.id === folder.id || draggedItem.parent_id === folder.id) return;
    const index = getChildren(folder.id).length;
    const workspace = useWorkspaceStore.getState();
    workspace.moveItemOptimistic(draggedItem.id, folder.id, index);
    if (!workspace.expandedMaps.has(folder.id)) workspace.toggleMapExpanded(folder.id);
    await supabase
      .from('workspace_items')
      .update({ parent_id: folder.id, order_index: index, updated_at: new Date().toISOString() })
      .eq('id', draggedItem.id);
    dragState.setDroppedId(draggedItem.id);
    window.setTimeout(() => dragState.setDroppedId(null), 1200);
  };

  return (
    <div>
      <div
        draggable
        onDragStart={(event) => {
          event.dataTransfer.setData('text/plain', item.id);
          event.dataTransfer.effectAllowed = 'move';
          dragState.setDraggedId(item.id);
        }}
        onDragEnd={() => {
          dragState.setDraggedId(null);
          dragState.setDropTargetId(null);
        }}
        onDragOver={(event) => {
          if (item.type === 'map' && dragState.draggedId !== item.id) {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'move';
            dragState.setDropTargetId(item.id);
          }
        }}
        onDragLeave={() => {
          if (dragState.dropTargetId === item.id) dragState.setDropTargetId(null);
        }}
        onDrop={(event) => {
          event.preventDefault();
          const id = event.dataTransfer.getData('text/plain');
          const dragged = useWorkspaceStore
            .getState()
            .items.find((workspaceItem) => workspaceItem.id === id);
          if (item.type === 'map' && dragged) void moveInto(item, dragged);
          dragState.setDraggedId(null);
          dragState.setDropTargetId(null);
        }}
        onContextMenu={(event) => {
          event.preventDefault();
          setMenuOpen(true);
        }}
        className={`relative flex min-h-7 items-center rounded px-1 text-sm transition-colors hover:bg-secondary ${isSelected ? 'bg-secondary text-foreground' : 'text-muted-foreground'} ${dragState.draggedId === item.id ? 'opacity-40' : ''} ${dragState.dropTargetId === item.id ? 'bg-secondary outline outline-1 outline-foreground/40' : ''} ${dragState.droppedId === item.id ? 'workspace-drop-success' : ''}`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        <button
          type="button"
          onClick={() =>
            item.type === 'map' ? toggleMapExpanded(item.id) : setSelectedId(item.id)
          }
          className="flex min-w-0 flex-1 items-center gap-1.5 py-1 text-left"
        >
          {item.type === 'map' ? (
            isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            )
          ) : (
            <span className="w-3.5" />
          )}
          <span className="truncate">{item.name}</span>
        </button>
        {menuOpen && (
          <div
            className="absolute right-0 top-7 z-20 w-32 rounded-md border border-border bg-background p-1 text-xs shadow-lg"
            onMouseLeave={() => setMenuOpen(false)}
          >
            <button
              type="button"
              onClick={() => {
                setName(item.name);
                setRenameOpen(true);
                setMenuOpen(false);
              }}
              className="w-full rounded px-2 py-1.5 text-left hover:bg-secondary"
            >
              Hernoemen
            </button>
            <button
              type="button"
              onClick={duplicate}
              className="w-full rounded px-2 py-1.5 text-left hover:bg-secondary"
            >
              Dupliceren
            </button>
            <button
              type="button"
              onClick={remove}
              className="w-full rounded px-2 py-1.5 text-left hover:bg-secondary"
            >
              Verwijderen
            </button>
            <div className="border-t border-border my-1" />
            <FileOperationsMenu
              node={{
                id: item.id,
                type: item.type === 'map' ? 'note_folder' : 'note',
                name: item.name,
                parentId: item.parent_id || null,
                path: `/${item.name}`,
                metadata: {
                  order: 0,
                  permissions: {
                    canRead: ['user'],
                    canWrite: ['user'],
                    canDelete: ['user'],
                  },
                },
                createdAt: item.created_at || new Date().toISOString(),
                updatedAt: item.updated_at || new Date().toISOString(),
                createdBy: 'user',
                isLocal: true,
              }}
              onMove={handleFileSystemMove}
              onRename={handleFileSystemRename}
              onDelete={handleFileSystemDelete}
              onDuplicate={handleFileSystemDuplicate}
              onCreateShortcut={handleCreateShortcut}
              availableParents={nodes.filter(n => n.type === 'note_folder' || n.type === 'root')}
            />
          </div>
        )}
        {renameOpen && (
          <div
            className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
            onMouseDown={() => setRenameOpen(false)}
          >
            <form
              className="w-full max-w-sm rounded-xl border border-border bg-background p-5 shadow-2xl"
              onMouseDown={(event) => event.stopPropagation()}
              onSubmit={(event) => {
                event.preventDefault();
                void rename();
              }}
            >
              <h2 className="font-display text-xl font-semibold">Hernoemen</h2>
              <label className="mt-4 block text-sm text-muted-foreground">
                Naam
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-foreground/50"
                  autoFocus
                />
              </label>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRenameOpen(false)}
                  className="rounded-md border border-border px-3 py-2 text-sm hover:bg-secondary"
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground disabled:opacity-50"
                >
                  Opslaan
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
      {item.type === 'map' &&
        isExpanded &&
        children.map((child) => (
          <TreeItem key={child.id} item={child} level={level + 1} dragState={dragState} />
        ))}
    </div>
  );
}

function WorkspaceSidebar() {
  const { t } = useTranslation();
  const { getChildren, setItems, setLoading, setSelectedId, createItemOptimistic, items, workspaces, currentWorkspaceId, setCurrentWorkspaceId, createWorkspace } =
    useWorkspaceStore();
  const rootItems = getChildren(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [droppedId, setDroppedId] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const dragState = {
    draggedId,
    dropTargetId,
    droppedId,
    setDraggedId,
    setDropTargetId,
    setDroppedId,
  };

  // Initialize default workspace if none exists
  useEffect(() => {
    if (workspaces.length === 0) {
      const defaultId = createWorkspace('Standaard');
      setCurrentWorkspaceId(defaultId);
    }
  }, [workspaces.length, createWorkspace, setCurrentWorkspaceId]);

  useEffect(() => {
    async function syncWorkspace() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        const { data, error } = await supabase
          .from('workspace_items')
          .select('*')
          .eq('user_id', user.id)
          .order('order_index');
        if (!error && data) {
          setItems(data);

          // Create default subject folders only for the first workspace if they don't exist
          if (workspaces.length === 1) {
            const existingFolders = data.filter((item: WorkspaceItem) => item.type === 'map' && !item.parent_id && item.workspace_id === currentWorkspaceId);
            const existingFolderNames = new Set(existingFolders.map((item: WorkspaceItem) => item.name));

            for (const subject of DEFAULT_SUBJECTS) {
              if (!existingFolderNames.has(subject)) {
                const folderId = createItemOptimistic({
                  user_id: user.id,
                  name: subject,
                  type: 'map',
                  parent_id: null,
                  order_index: data.length + DEFAULT_SUBJECTS.indexOf(subject),
                  content: {},
                  workspace_id: currentWorkspaceId,
                });
                try {
                  await supabase
                    .from('workspace_items')
                    .insert({
                      id: folderId,
                      user_id: user.id,
                      name: subject,
                      type: 'map',
                      parent_id: null,
                      order_index: data.length + DEFAULT_SUBJECTS.indexOf(subject),
                      content: {},
                      workspace_id: currentWorkspaceId,
                    });
                } catch (err) {
                  console.error('Error creating default folder:', err);
                }
              }
            }
          }
        }
      } finally {
        setLoading(false);
        setIsInitialLoading(false);
      }
    }
    syncWorkspace();
  }, [setItems, setLoading, createItemOptimistic, workspaces, currentWorkspaceId]);

  const handleCreateWorkspace = () => {
    if (!newWorkspaceName.trim()) return;
    if (workspaces.some(w => w.name.toLowerCase() === newWorkspaceName.toLowerCase())) {
      alert('Er bestaat al een werkruimte met deze naam.');
      return;
    }
    const newId = createWorkspace(newWorkspaceName);
    setCurrentWorkspaceId(newId);
    setNewWorkspaceName('');
    setShowCreateWorkspace(false);
  };
  const createItem = async (type: 'map' | 'page') => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const item = {
      user_id: user?.id || 'local-user',
      name: type === 'map' ? t('notes_new_folder') : t('notes_new_page'),
      type,
      parent_id: null,
      order_index: rootItems.length,
      content: type === 'page' ? '' : {},
      workspace_id: currentWorkspaceId,
    };
    const id = createItemOptimistic(item);
    if (type === 'page') setSelectedId(id);
    try {
      const { data } = await supabase
        .from('workspace_items')
        .insert({ ...item, id })
        .select()
        .single();
      if (data) useWorkspaceStore.getState().updateItemOptimistic(id, data);
    } catch {
      /* Local workspace remains available while offline. */
    }
  };
  if (isInitialLoading) {
    return (
      <aside className="flex w-72 shrink-0 flex-col border-r border-border bg-background">
        <div className="flex items-center justify-between px-5 py-4">
          <h1 className="text-sm font-semibold tracking-wide text-foreground">Werkruimte</h1>
          <div className="flex items-center gap-1">
            <div className="skeleton-line h-8 w-8 rounded"></div>
            <div className="skeleton-line h-8 w-8 rounded"></div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-3 py-2">
              <div className="skeleton-line h-4 w-3/4 rounded"></div>
            </div>
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-border bg-background">
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold tracking-wide text-foreground">Werkruimte</h1>
          {/* Workspace dots navigation */}
          <div className="flex items-center gap-2">
            {workspaces.map((workspace) => (
              <button
                key={workspace.id}
                type="button"
                onClick={() => setCurrentWorkspaceId(workspace.id)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  workspace.id === currentWorkspaceId ? 'bg-foreground' : 'bg-muted-foreground hover:bg-foreground/60'
                }`}
                title={workspace.name}
              />
            ))}
            <button
              type="button"
              onClick={() => setShowCreateWorkspace(true)}
              className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
              title="Nieuwe werkruimte"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => createItem('map')}
            className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
            title={t('notes_new_folder')}
          >
            <FolderPlus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => createItem('page')}
            className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
            title={t('notes_new_page')}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4 pt-6">
        {rootItems.length ? (
          rootItems.map((item) => <TreeItem key={item.id} item={item} dragState={dragState} />)
        ) : (
          <p className="px-3 py-5 text-sm text-muted-foreground">{t('notes_empty_state')}</p>
        )}
      </div>

      {showCreateWorkspace && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
          onMouseDown={() => setShowCreateWorkspace(false)}
        >
          <form
            className="w-full max-w-sm rounded-xl border border-border bg-background p-5 shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
            onSubmit={(event) => {
              event.preventDefault();
              handleCreateWorkspace();
            }}
          >
            <h2 className="font-display text-xl font-semibold">Nieuwe werkruimte</h2>
            <label className="mt-4 block text-sm text-muted-foreground">
              Naam
              <input
                value={newWorkspaceName}
                onChange={(event) => setNewWorkspaceName(event.target.value)}
                className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-foreground/50"
                autoFocus
                placeholder="Bijv. School"
              />
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreateWorkspace(false)}
                className="rounded-md border border-border px-3 py-2 text-sm hover:bg-secondary"
              >
                Annuleren
              </button>
              <button
                type="submit"
                disabled={!newWorkspaceName.trim()}
                className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground disabled:opacity-50"
              >
                Maken
              </button>
            </div>
          </form>
        </div>
      )}
    </aside>
  );
}

function editorContent(content: WorkspaceItem['content']) {
  if (typeof content !== 'string') return '<h1><br></h1>';
  try {
    const parsed = JSON.parse(content);
    if (parsed?.type === 'doc' || Array.isArray(parsed)) return '<h1><br></h1>';
  } catch {
    /* Existing HTML or text. */
  }
  return content || '<h1><br></h1>';
}

function placeCursorAtEnd(node: HTMLElement) {
  const range = document.createRange();
  range.selectNodeContents(node);
  range.collapse(false);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

function EditorPanel() {
  const { t } = useTranslation();
  const { getSelectedItem, updateContent } = useWorkspaceStore();
  const item = getSelectedItem();
  const editorRef = useRef<HTMLDivElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();
  const fontSizeTimer = useRef<ReturnType<typeof setTimeout>>();
  const cursorPlacedRef = useRef<Set<string>>(new Set());
  const [headerFont, setHeaderFont] = useState<'inter' | 'display'>('inter');
  const [showSpelling, setShowSpelling] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [showFontSize, setShowFontSize] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<
    Array<{ question: string; answer: string }>
  >([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [diagrams, setDiagrams] = useState<Diagram[]>([]);
  const [mindMaps, setMindMaps] = useState<MindMap[]>([]);
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const { createNode, updateNode, getUserNotes } = useFilesystem();

  // Cache note content for offline access
  useContentCache(
    item ? `/notes/${item.id}` : '',
    item ? {
      content: item.content,
      diagrams,
      mindMaps,
      drawings,
    } : null,
    'note',
    item ? {
      title: item.name,
      description: `Note created at ${item.created_at}`,
      lastModified: item.updated_at,
    } : undefined
  );

  const handlePaste = async (event: React.ClipboardEvent) => {
    event.preventDefault();
    const text = event.clipboardData.getData('text/plain');
    const html = await marked.parse(text);
    document.execCommand('insertHTML', false, html);
  };

  const handleAddDiagram = (diagram: Diagram) => {
    setDiagrams([...diagrams, diagram]);
  };

  const handleUpdateDiagram = (updatedDiagram: Diagram) => {
    setDiagrams(diagrams.map(d => d.id === updatedDiagram.id ? updatedDiagram : d));
  };

  const handleDeleteDiagram = (diagramId: string) => {
    setDiagrams(diagrams.filter(d => d.id !== diagramId));
  };

  const handleAddMindMap = (mindMap: MindMap) => {
    setMindMaps([...mindMaps, mindMap]);
  };

  const handleUpdateMindMap = (updatedMindMap: MindMap) => {
    setMindMaps(mindMaps.map(m => m.id === updatedMindMap.id ? updatedMindMap : m));
  };

  const handleDeleteMindMap = (mindMapId: string) => {
    setMindMaps(mindMaps.filter(m => m.id !== mindMapId));
  };

  const handleAddDrawing = (drawing: Drawing) => {
    setDrawings([...drawings, drawing]);
  };

  const handleUpdateDrawing = (updatedDrawing: Drawing) => {
    setDrawings(drawings.map(d => d.id === updatedDrawing.id ? updatedDrawing : d));
  };

  const handleDeleteDrawing = (drawingId: string) => {
    setDrawings(drawings.filter(d => d.id !== drawingId));
  };

  const handleExportText = () => {
    if (!item) return;
    exportNoteAsText(
      item.content,
      diagrams,
      mindMaps,
      drawings,
      item.name || 'note'
    );
  };

  // Save note to filesystem
  const saveNoteToFilesystem = async () => {
    if (!item) return;

    try {
      // Initialize filesystem if not already done
      await filesystemService.initialize();

      // Check if note already exists in filesystem by name
      const existingNotes = getUserNotes();
      const existingNote = existingNotes.find(n => n.name === item.name);

      const noteContent = {
        note: {
          id: item.id,
          content: item.content,
          diagrams,
          mindMaps,
          drawings,
        },
      };

      if (existingNote) {
        // Update existing note
        await updateNode(existingNote.id, {
          content: noteContent,
          name: item.name,
        });
      } else {
        // Create new note in filesystem
        await createNode('note', item.name, 'notes_root', noteContent, true);
      }
    } catch (error) {
      console.error('Failed to save note to filesystem:', error);
    }
  };

  // Auto-save to filesystem when content changes
  useEffect(() => {
    if (item && (diagrams.length > 0 || mindMaps.length > 0 || drawings.length > 0)) {
      saveNoteToFilesystem();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diagrams, mindMaps, drawings, item?.content]);

  useEffect(() => {
    setHeaderFont(
      localStorage.getItem('aether-workspace-header-font') === 'display' ? 'display' : 'inter'
    );
    setShowSpelling(localStorage.getItem('aether-workspace-spellcheck') === 'true');
    if (editorRef.current) editorRef.current.innerHTML = item ? editorContent(item.content) : '';
    if (item && item.content === '' && !cursorPlacedRef.current.has(item.id) && isEditing) {
      cursorPlacedRef.current.add(item.id);
      setTimeout(() => {
        if (editorRef.current) {
          placeCursorAtEnd(editorRef.current);
        }
      }, 50);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.id, isEditing]);
  useEffect(() => {
    if (editorRef.current && item) {
      editorRef.current.contentEditable = isEditing ? 'true' : 'false';
      // In read mode, hide cursor
      if (!isEditing) {
        editorRef.current.style.caretColor = 'transparent';
      } else {
        editorRef.current.style.caretColor = 'auto';
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]);
  useEffect(
    () => () => {
      clearTimeout(saveTimer.current);
      clearTimeout(fontSizeTimer.current);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const save = (content: string) => {
    if (!item) return;
    const title = editorRef.current?.querySelector('h1')?.textContent?.trim();
    const updates = title ? { content, name: title } : { content };
    updateContent(item.id, content);
    if (title && title !== item.name)
      useWorkspaceStore.getState().updateItemOptimistic(item.id, { name: title });
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      supabase
        .from('workspace_items')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', item.id);
    }, 350);
  };

  const generateQuestions = async () => {
    if (!item || !editorRef.current) return;

    const content = editorRef.current.innerText || '';
    if (content.length < 100) {
      alert('Voeg meer inhoud toe om vragen te genereren (minimaal 100 tekens).');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, subject: item.name }),
      });

      if (!response.ok) throw new Error('Failed to generate questions');

      const data = await response.json();
      setGeneratedQuestions(data.questions || []);
      setShowQuestionDialog(true);
    } catch (error) {
      console.error('Error generating questions:', error);
      alert('Er is een fout opgetreden bij het genereren van vragen.');
    } finally {
      setIsGenerating(false);
    }
  };

  const insertQuestion = (question: { question: string; answer: string }) => {
    if (!editorRef.current) return;

    const questionHtml = `
      <div class="generated-question" style="margin: 16px 0; padding: 12px; border-left: 3px solid #3b82f6; background: #f1f5f9;">
        <p style="font-weight: 600; margin: 0 0 8px 0;">Vraag: ${question.question}</p>
        <p style="margin: 0; color: #64748b;">Antwoord: ${question.answer}</p>
      </div>
    `;

    editorRef.current.innerHTML += questionHtml;
    save(editorRef.current.innerHTML);
  };
  const transformMarkdown = () => {
    const selection = window.getSelection();
    const block = selection?.anchorNode?.parentElement?.closest('h1,h2,h3,p,div,li,pre');
    if (!block || !editorRef.current?.contains(block)) return;
    const text = block.textContent || '';
    const match = text.match(
      /^(.*?)(\*\*(.+?)\*\*|\*([^*]+?)\*|__([^_]+?)__|~~(.+?)~~|`([^`]+?)`|\[\[(.+?)\]\]) $/
    );
    if (text === '``` ') {
      block.outerHTML = '<pre><code><br></code></pre>';
      placeCursorAtEnd(editorRef.current);
      return;
    }
    if (text === '- ' || text === '* ') {
      block.outerHTML = '<ul><li><br></li></ul>';
      placeCursorAtEnd(editorRef.current);
      return;
    }
    if (!match) return;
    const [, before, , bold, italic, underline, strike, code, wikilink] = match;

    if (wikilink) {
      // Convert wikilink to a link
      const linkName = wikilink.trim();
      const linkHtml = `<a href="#${linkName}" class="wikilink text-primary hover:underline" data-wikilink="${linkName}">${linkName}</a>`;
      block.innerHTML = `${before}${linkHtml}&nbsp;`;
      placeCursorAtEnd(block as HTMLElement);
      return;
    }

    const tag = bold ? 'strong' : italic ? 'em' : underline ? 'u' : strike ? 's' : 'code';
    const value = bold || italic || underline || strike || code;
    block.innerHTML = `${before}<${tag}>${value}</${tag}>&nbsp;`;
    placeCursorAtEnd(block as HTMLElement);
  };
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.ctrlKey && event.shiftKey && (event.key === '>' || event.key === '<')) {
      event.preventDefault();
      const nextSize = Math.min(32, Math.max(12, fontSize + (event.key === '>' ? 1 : -1)));
      setFontSize(nextSize);
      setShowFontSize(true);
      clearTimeout(fontSizeTimer.current);
      fontSizeTimer.current = setTimeout(() => setShowFontSize(false), 3000);
      document.execCommand('fontSize', false, '7');
      editorRef.current?.querySelectorAll('font[size="7"]').forEach((node) => {
        const span = document.createElement('span');
        span.style.fontSize = `${nextSize}px`;
        span.innerHTML = node.innerHTML;
        node.replaceWith(span);
      });
      if (editorRef.current) save(editorRef.current.innerHTML);
      return;
    }
    if (event.key === ' ') window.setTimeout(transformMarkdown, 0);
    if (event.key === 'Enter') {
      const heading = window.getSelection()?.anchorNode?.parentElement?.closest('h1');
      if (heading && editorRef.current?.contains(heading)) {
        event.preventDefault();
        heading.insertAdjacentHTML('afterend', '<p><br></p>');
        placeCursorAtEnd(heading.nextElementSibling as HTMLElement);
      }
    }
    if (event.key === 'Backspace') {
      const selection = window.getSelection();
      const parent = selection?.anchorNode?.parentElement?.closest('strong,em,u,s,code');
      if (parent && selection?.isCollapsed && selection.anchorOffset === 0) {
        event.preventDefault();
        const marker =
          parent.tagName === 'STRONG'
            ? '**'
            : parent.tagName === 'EM'
              ? '*'
              : parent.tagName === 'U'
                ? '__'
                : parent.tagName === 'S'
                  ? '~~'
                  : '`';
        const text = document.createTextNode(`${marker}${parent.textContent || ''}${marker}`);
        parent.replaceWith(text);
        const range = document.createRange();
        range.setStart(text, text.length);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  };
  if (!item)
    return (
      <main className="grid flex-1 place-items-center">
        <p className="text-sm text-muted-foreground">{t('notes_select_page')}</p>
      </main>
    );
  return (
    <main className={`flex min-w-0 flex-1 flex-col bg-background workspace-headers-${headerFont}`}>
      <div className="flex h-14 items-center justify-between border-b border-border px-8">
        <p className="text-sm font-medium text-foreground">{item.name}</p>
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
            title={isEditing ? 'Leesmodus' : 'Bewerkmodus'}
          >
            {isEditing ? <Eye className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={generateQuestions}
            disabled={isGenerating}
            className="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-50"
            title="Genereer vragen van inhoud"
          >
            {isGenerating ? '...' : 'Vragen genereren'}
          </button>
          <button
            type="button"
            onClick={() => {
              const enabled = !showSpelling;
              setShowSpelling(enabled);
              localStorage.setItem('aether-workspace-spellcheck', String(enabled));
            }}
            className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
            title={showSpelling ? 'Rode onderstreping verbergen' : 'Rode onderstreping tonen'}
          >
            <SpellCheck className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <Type className="h-4 w-4 text-muted-foreground" />
            <select
              value={headerFont}
              onChange={(event) => {
                const value = event.target.value as 'inter' | 'display';
                setHeaderFont(value);
                localStorage.setItem('aether-workspace-header-font', value);
              }}
              className="bg-secondary text-foreground rounded px-2 py-1 text-xs outline-none border border-border"
            >
              <option value="inter">Inter</option>
              <option value="display">Cormorant Garamond</option>
            </select>
          </div>
        </div>
      </div>

      <VisualToolsToolbar
        onAddDiagram={handleAddDiagram}
        onAddMindMap={handleAddMindMap}
        onAddDrawing={handleAddDrawing}
        onExportText={handleExportText}
      />

      <div 
        className="relative min-h-0 flex-1 overflow-y-auto px-8 py-10 sm:px-14 lg:px-24"
      >
        {showFontSize && <div className="workspace-font-size-indicator">{fontSize}px</div>}
        <div
          ref={editorRef}
          contentEditable={isEditing}
          spellCheck={showSpelling}
          suppressContentEditableWarning
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onInput={(event) => save(event.currentTarget.innerHTML)}
          data-placeholder={t('notes_start_typing')}
          className="workspace-editor mx-auto min-h-[calc(100vh-10rem)] w-full max-w-4xl font-sans text-base leading-8 text-foreground outline-none"
        />

        {/* Render Diagrams */}
        {diagrams.map((diagram) => (
          <div key={diagram.id} className="mt-8">
            <DiagramEditor
              diagram={diagram}
              onUpdate={handleUpdateDiagram}
              onDelete={() => handleDeleteDiagram(diagram.id)}
            />
          </div>
        ))}

        {/* Render Mind Maps */}
        {mindMaps.map((mindMap) => (
          <div key={mindMap.id} className="mt-8">
            <MindMapEditor
              mindMap={mindMap}
              onUpdate={handleUpdateMindMap}
              onDelete={() => handleDeleteMindMap(mindMap.id)}
            />
          </div>
        ))}

        {/* Render Drawings */}
        {drawings.map((drawing) => (
          <div key={drawing.id} className="mt-8">
            <DrawingEditor
              drawing={drawing}
              onUpdate={handleUpdateDrawing}
              onDelete={() => handleDeleteDrawing(drawing.id)}
            />
          </div>
        ))}
      </div>

      {showQuestionDialog && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
          onMouseDown={() => setShowQuestionDialog(false)}
        >
          <div
            className="w-full max-w-2xl rounded-xl border border-border bg-background p-6 shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <h2 className="font-display text-xl font-semibold mb-4">Gegenereerde Vragen</h2>
            <div className="max-h-96 overflow-y-auto space-y-3 mb-4">
              {generatedQuestions.length === 0 ? (
                <p className="text-sm text-muted-foreground">Geen vragen gegenereerd.</p>
              ) : (
                generatedQuestions.map((q, i) => (
                  <div key={i} className="p-4 rounded-lg border border-border bg-secondary/30">
                    <p className="font-medium text-sm mb-2">{q.question}</p>
                    <p className="text-sm text-muted-foreground">{q.answer}</p>
                    <button
                      onClick={() => insertQuestion(q)}
                      className="mt-2 text-xs text-primary hover:underline"
                    >
                      Invoegen
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowQuestionDialog(false)}
                className="rounded-md border border-border px-4 py-2 text-sm hover:bg-secondary"
              >
                Sluiten
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function NotitiesPage() {
  return (
    <AppShell fullWidth hideFooter>
      <section className="flex h-[calc(100vh-4rem)] min-h-[580px]">
        <WorkspaceSidebar />
        <EditorPanel />
      </section>
    </AppShell>
  );
}
