/**
 * Unified Digital Filesystem Service
 * Manages the entire application's content structure
 */

import {
  FilesystemNode,
  FilesystemNodeType,
  FilesystemSnapshot,
} from '@/types/filesystem';

class FilesystemService {
  private static instance: FilesystemService;
  private nodes: Map<string, FilesystemNode> = new Map();
  private rootId: string = 'root';
  private isInitialized: boolean = false;

  private constructor() {}

  static getInstance(): FilesystemService {
    if (!FilesystemService.instance) {
      FilesystemService.instance = new FilesystemService();
    }
    return FilesystemService.instance;
  }

  /**
   * Initialize the filesystem with default structure
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Load from local storage first
    const stored = localStorage.getItem('aether_filesystem');
    if (stored) {
      try {
        const snapshot: FilesystemSnapshot = JSON.parse(stored);
        this.loadSnapshot(snapshot);
        this.isInitialized = true;
        return;
      } catch (error) {
        console.error('Failed to load filesystem snapshot:', error);
      }
    }

    // Create default structure
    await this.createDefaultStructure();
    this.isInitialized = true;
  }

  /**
   * Create default filesystem structure
   */
  private async createDefaultStructure(): Promise<void> {
    const root: FilesystemNode = {
      id: this.rootId,
      type: 'root',
      name: 'Root',
      parentId: null,
      path: '/',
      metadata: {
        order: 0,
        permissions: {
          canRead: ['admin', 'user'],
          canWrite: ['admin'],
          canDelete: ['admin'],
        },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'admin',
      isLocal: false,
    };

    this.nodes.set(this.rootId, root);

    // Create user notes folder
    const notesFolder: FilesystemNode = {
      id: 'notes_root',
      type: 'note_folder',
      name: 'Mijn Notities',
      parentId: this.rootId,
      path: '/Mijn Notities',
      metadata: {
        color: '#8B5CF6',
        icon: 'folder',
        order: 1000,
        permissions: {
          canRead: ['user'],
          canWrite: ['user'],
          canDelete: ['user'],
        },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'user',
      isLocal: true,
    };

    this.nodes.set('notes_root', notesFolder);
    this.saveToStorage();
  }

  /**
   * Load filesystem from snapshot
   */
  private loadSnapshot(snapshot: FilesystemSnapshot): void {
    this.nodes.clear();
    snapshot.nodes.forEach((node) => {
      this.nodes.set(node.id, node);
    });
  }

  /**
   * Save current state to local storage
   */
  private saveToStorage(): void {
    const snapshot: FilesystemSnapshot = {
      version: 1,
      timestamp: new Date().toISOString(),
      nodes: Array.from(this.nodes.values()),
      checksum: this.calculateChecksum(),
    };
    localStorage.setItem('aether_filesystem', JSON.stringify(snapshot));
  }

  /**
   * Calculate checksum for integrity verification
   */
  private calculateChecksum(): string {
    const data = JSON.stringify(Array.from(this.nodes.values()));
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
  }

  /**
   * Get a node by ID
   */
  getNode(id: string): FilesystemNode | undefined {
    return this.nodes.get(id);
  }

  /**
   * Get all children of a node
   */
  getChildren(parentId: string): FilesystemNode[] {
    return Array.from(this.nodes.values())
      .filter((node) => node.parentId === parentId)
      .sort((a, b) => a.metadata.order - b.metadata.order);
  }

  /**
   * Get node by path
   */
  getNodeByPath(path: string): FilesystemNode | undefined {
    return Array.from(this.nodes.values()).find((node) => node.path === path);
  }

  /**
   * Create a new node
   */
  async createNode(
    type: FilesystemNodeType,
    name: string,
    parentId: string,
    content?: any,
    isLocal: boolean = false
  ): Promise<FilesystemNode> {
    const parent = this.nodes.get(parentId);
    if (!parent) {
      throw new Error(`Parent node ${parentId} not found`);
    }

    const id = this.generateId();
    const path = parent.path === '/' ? `/${name}` : `${parent.path}/${name}`;

    const siblings = this.getChildren(parentId);
    const maxOrder = siblings.length > 0 ? Math.max(...siblings.map(s => s.metadata.order)) : 0;

    const newNode: FilesystemNode = {
      id,
      type,
      name,
      parentId,
      path,
      metadata: {
        order: maxOrder + 1,
        permissions: isLocal
          ? {
              canRead: ['user'],
              canWrite: ['user'],
              canDelete: ['user'],
            }
          : {
              canRead: ['admin', 'user'],
              canWrite: ['admin'],
              canDelete: ['admin'],
            },
      },
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: isLocal ? 'user' : 'admin',
      isLocal,
    };

    this.nodes.set(id, newNode);
    this.saveToStorage();

    return newNode;
  }

  /**
   * Update a node
   */
  async updateNode(
    id: string,
    updates: Partial<FilesystemNode>
  ): Promise<FilesystemNode> {
    const node = this.nodes.get(id);
    if (!node) {
      throw new Error(`Node ${id} not found`);
    }

    const updatedNode = {
      ...node,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.nodes.set(id, updatedNode);
    this.saveToStorage();

    return updatedNode;
  }

  /**
   * Delete a node
   */
  async deleteNode(id: string): Promise<void> {
    const node = this.nodes.get(id);
    if (!node) {
      throw new Error(`Node ${id} not found`);
    }

    // Recursively delete children
    const children = this.getChildren(id);
    for (const child of children) {
      await this.deleteNode(child.id);
    }

    this.nodes.delete(id);
    this.saveToStorage();
  }

  /**
   * Move a node to a new parent
   */
  async moveNode(id: string, newParentId: string): Promise<FilesystemNode> {
    const node = this.nodes.get(id);
    const newParent = this.nodes.get(newParentId);

    if (!node || !newParent) {
      throw new Error('Node or parent not found');
    }

    const oldPath = node.path;
    const newPath = newParent.path === '/' ? `/${node.name}` : `${newParent.path}/${node.name}`;

    // Update path for all descendants
    const descendants = this.getAllDescendants(id);
    for (const descendant of descendants) {
      descendant.path = descendant.path.replace(oldPath, newPath);
      this.nodes.set(descendant.id, descendant);
    }

    const updatedNode = await this.updateNode(id, {
      parentId: newParentId,
      path: newPath,
    });

    return updatedNode;
  }

  /**
   * Rename a node
   */
  async renameNode(id: string, newName: string): Promise<FilesystemNode> {
    const node = this.nodes.get(id);
    if (!node) {
      throw new Error(`Node ${id} not found`);
    }

    const oldPath = node.path;
    const parentPath = node.parentId
      ? this.nodes.get(node.parentId)?.path || '/'
      : '/';
    const newPath = parentPath === '/' ? `/${newName}` : `${parentPath}/${newName}`;

    // Update path for all descendants
    const descendants = this.getAllDescendants(id);
    for (const descendant of descendants) {
      descendant.path = descendant.path.replace(oldPath, newPath);
      this.nodes.set(descendant.id, descendant);
    }

    const updatedNode = await this.updateNode(id, {
      name: newName,
      path: newPath,
    });

    return updatedNode;
  }

  /**
   * Duplicate a node
   */
  async duplicateNode(id: string): Promise<FilesystemNode> {
    const node = this.nodes.get(id);
    if (!node) {
      throw new Error(`Node ${id} not found`);
    }

    const copyName = `${node.name} (kopie)`;
    const parentNode = node.parentId ? this.nodes.get(node.parentId) : null;

    if (!parentNode) {
      throw new Error('Parent node not found');
    }

    const newNode = await this.createNode(
      node.type,
      copyName,
      parentNode.id,
      node.content,
      node.isLocal
    );

    // Duplicate children recursively
    const children = this.getChildren(id);
    for (const child of children) {
      await this.duplicateNode(child.id);
      // Move the duplicated child to the new parent
      const duplicatedChild = this.getChildren(id).find(
        c => c.name === child.name && c.id !== child.id
      );
      if (duplicatedChild) {
        await this.moveNode(duplicatedChild.id, newNode.id);
      }
    }

    return newNode;
  }

  /**
   * Add a button link to a specific location
   */
  async addButtonLink(
    targetPath: string,
    buttonText: string,
    placement: 'subject' | 'chapter' | 'paragraph' | 'root',
    placementId?: string,
    icon?: string
  ): Promise<FilesystemNode> {
    const parentId = placementId || this.rootId;
    const nodeName = `Button: ${buttonText}`;

    const buttonNode = await this.createNode(
      'button_link',
      nodeName,
      parentId,
      { shortcut: { targetId: '', targetPath, buttonText, buttonIcon: icon } },
      false
    );

    return buttonNode;
  }

  /**
   * Get all descendants of a node
   */
  private getAllDescendants(id: string): FilesystemNode[] {
    const descendants: FilesystemNode[] = [];
    const children = this.getChildren(id);

    for (const child of children) {
      descendants.push(child);
      descendants.push(...this.getAllDescendants(child.id));
    }

    return descendants;
  }

  /**
   * Get entire tree structure
   */
  getTree(): FilesystemNode[] {
    return this.getChildren(this.rootId);
  }

  /**
   * Search nodes by name
   */
  searchNodes(query: string): FilesystemNode[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.nodes.values()).filter((node) =>
      node.name.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get user's local notes
   */
  getUserNotes(): FilesystemNode[] {
    const notesFolder = this.nodes.get('notes_root');
    if (!notesFolder) return [];

    return this.getChildren(notesFolder.id);
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear entire filesystem (for testing/reset)
   */
  async clear(): Promise<void> {
    this.nodes.clear();
    localStorage.removeItem('aether_filesystem');
    this.isInitialized = false;
    await this.initialize();
  }
}

export const filesystemService = FilesystemService.getInstance();

/**
 * Convenience function to create a node
 */
export async function createNode(
  type: FilesystemNodeType,
  name: string,
  parentId: string,
  content?: any,
  isLocal: boolean = false
): Promise<FilesystemNode> {
  return await filesystemService.createNode(type, name, parentId, content, isLocal);
}