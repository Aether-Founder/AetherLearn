import { create } from 'zustand';
import type { Json } from '@/types/database.types';

export type WorkspaceItemType = 'map' | 'page';

export interface WorkspaceItem {
  id: string;
  user_id: string;
  name: string;
  type: WorkspaceItemType;
  parent_id: string | null;
  order_index: number;
  content: Json;
  created_at: string;
  updated_at: string;
  workspace_id: string;
}

export interface Workspace {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface WorkspaceState {
  items: WorkspaceItem[];
  workspaces: Workspace[];
  currentWorkspaceId: string;
  isLoading: boolean;
  selectedId: string | null;
  expandedMaps: Set<string>;

  // Actions
  setItems: (items: WorkspaceItem[]) => void;
  setWorkspaces: (workspaces: Workspace[]) => void;
  setCurrentWorkspaceId: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setSelectedId: (id: string | null) => void;
  toggleMapExpanded: (id: string) => void;

  // Local persistence helpers
  loadFromLocalStorage: () => void;

  // Optimistic updates
  createItemOptimistic: (item: Omit<WorkspaceItem, 'id' | 'created_at' | 'updated_at'>) => string;
  updateItemOptimistic: (id: string, updates: Partial<WorkspaceItem>) => void;
  deleteItemOptimistic: (id: string) => void;
  moveItemOptimistic: (id: string, newParentId: string | null, newIndex: number) => void;

  // Workspace management
  createWorkspace: (name: string) => string;
  deleteWorkspace: (id: string) => void;
  updateWorkspace: (id: string, name: string) => void;

  // Selectors
  getChildren: (parentId: string | null) => WorkspaceItem[];
  getSelectedItem: () => WorkspaceItem | null;

  // Content updates
  updateContent: (id: string, content: any) => void;
}

const STORAGE_KEY = 'aether_workspace_items';
const WORKSPACES_KEY = 'aether_workspaces';
const CURRENT_WORKSPACE_KEY = 'aether_current_workspace';

function saveLocal(items: WorkspaceItem[]) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save workspace items to localStorage', e);
    }
  }
}

function getInitialLocalItems(): WorkspaceItem[] {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      /* fallback */
    }
  }
  return [];
}

function getInitialWorkspaces(): Workspace[] {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(WORKSPACES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      /* fallback */
    }
  }
  return [];
}

function getInitialCurrentWorkspaceId(): string {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(CURRENT_WORKSPACE_KEY);
      if (stored) return stored;
    } catch (e) {
      /* fallback */
    }
  }
  const workspaces = getInitialWorkspaces();
  return workspaces.length > 0 ? workspaces[0].id : '';
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  items: getInitialLocalItems(),
  workspaces: getInitialWorkspaces(),
  currentWorkspaceId: getInitialCurrentWorkspaceId(),
  isLoading: false,
  selectedId: null,
  expandedMaps: new Set(),

  setItems: (items) => {
    saveLocal(items);
    set({ items });
  },

  setWorkspaces: (workspaces) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(WORKSPACES_KEY, JSON.stringify(workspaces));
    }
    set({ workspaces });
  },

  setCurrentWorkspaceId: (id) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CURRENT_WORKSPACE_KEY, id);
    }
    set({ currentWorkspaceId: id, selectedId: null });
  },

  loadFromLocalStorage: () => {
    const local = getInitialLocalItems();
    if (local.length > 0) {
      set({ items: local });
    }
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setSelectedId: (id) => set({ selectedId: id }),

  toggleMapExpanded: (id) => {
    const expanded = new Set(get().expandedMaps);
    if (expanded.has(id)) {
      expanded.delete(id);
    } else {
      expanded.add(id);
    }
    set({ expandedMaps: expanded });
  },

  createItemOptimistic: (itemData) => {
    const id = crypto.randomUUID();
    const newItem: WorkspaceItem = {
      ...itemData,
      id,
      workspace_id: get().currentWorkspaceId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const updatedItems = [...get().items, newItem];
    saveLocal(updatedItems);
    set({ items: updatedItems });
    return id;
  },

  updateItemOptimistic: (id, updates) => {
    const updatedItems = get().items.map((item) =>
      item.id === id ? { ...item, ...updates, updated_at: new Date().toISOString() } : item
    );
    saveLocal(updatedItems);
    set({ items: updatedItems });
  },

  deleteItemOptimistic: (id) => {
    const deleteRecursive = (itemId: string, currentItems: WorkspaceItem[]): WorkspaceItem[] => {
      const childrenIds = new Set(
        currentItems.filter((i) => i.parent_id === itemId).map((i) => i.id)
      );
      let remaining = currentItems.filter((i) => i.id !== itemId && i.parent_id !== itemId);
      for (const childId of childrenIds) {
        remaining = deleteRecursive(childId, remaining);
      }
      return remaining;
    };

    const remainingItems = deleteRecursive(id, get().items);
    saveLocal(remainingItems);
    set({
      items: remainingItems,
      selectedId: get().selectedId === id ? null : get().selectedId,
    });
  },

  moveItemOptimistic: (id, newParentId, newIndex) => {
    const state = get();
    const item = state.items.find((i) => i.id === id);
    if (!item) return;

    const updatedItems = state.items.map((i) => {
      if (i.id === id) {
        return {
          ...i,
          parent_id: newParentId,
          order_index: newIndex,
          updated_at: new Date().toISOString(),
        };
      }
      if (i.parent_id === newParentId && i.id !== id) {
        if (i.order_index >= newIndex) {
          return { ...i, order_index: i.order_index + 1, updated_at: new Date().toISOString() };
        } else if (item.parent_id === newParentId && i.order_index < item.order_index) {
          return { ...i, order_index: i.order_index - 1, updated_at: new Date().toISOString() };
        }
      }
      return i;
    });

    saveLocal(updatedItems);
    set({ items: updatedItems });
  },

  createWorkspace: (name) => {
    const id = crypto.randomUUID();
    const newWorkspace: Workspace = {
      id,
      user_id: 'local-user',
      name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const updatedWorkspaces = [...get().workspaces, newWorkspace];
    get().setWorkspaces(updatedWorkspaces);
    return id;
  },

  deleteWorkspace: (id) => {
    const updatedWorkspaces = get().workspaces.filter((w) => w.id !== id);
    get().setWorkspaces(updatedWorkspaces);

    // Delete all items in this workspace
    const remainingItems = get().items.filter((item) => item.workspace_id !== id);
    saveLocal(remainingItems);
    set({ items: remainingItems });

    // If deleting current workspace, switch to first available
    if (get().currentWorkspaceId === id && updatedWorkspaces.length > 0) {
      get().setCurrentWorkspaceId(updatedWorkspaces[0].id);
    }
  },

  updateWorkspace: (id, name) => {
    const updatedWorkspaces = get().workspaces.map((w) =>
      w.id === id ? { ...w, name, updated_at: new Date().toISOString() } : w
    );
    get().setWorkspaces(updatedWorkspaces);
  },

  getChildren: (parentId) => {
    const { items, currentWorkspaceId } = get();
    return items
      .filter((item) => item.parent_id === parentId && item.workspace_id === currentWorkspaceId)
      .sort((a, b) => a.order_index - b.order_index);
  },

  getSelectedItem: () => {
    const { items, selectedId } = get();
    return items.find((item) => item.id === selectedId) || null;
  },

  updateContent: (id, content) => {
    const updatedItems = get().items.map((item) =>
      item.id === id ? { ...item, content, updated_at: new Date().toISOString() } : item
    );
    saveLocal(updatedItems);
    set({ items: updatedItems });
  },
}));
