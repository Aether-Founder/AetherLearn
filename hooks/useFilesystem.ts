/**
 * React hook for using the filesystem service
 */

import { useState, useEffect, useCallback } from 'react';
import { filesystemService } from '@/lib/filesystem/filesystemService';
import { FilesystemNode, FilesystemNodeType } from '@/types/filesystem';
import { populateFilesystemFromDatabaseClient } from '@/lib/filesystem/filesystemContentLoaderClient';

export function useFilesystem() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [nodes, setNodes] = useState<FilesystemNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    initializeFilesystem();
  }, [isClient]);

  const initializeFilesystem = async () => {
    try {
      await filesystemService.initialize();
      
      // Populate filesystem with database content
      try {
        await populateFilesystemFromDatabaseClient();
      } catch (error) {
        console.error('Failed to populate filesystem from database:', error);
        // Continue anyway - filesystem is still functional
      }
      
      setIsInitialized(true);
      refreshNodes();
    } catch (error) {
      console.error('Failed to initialize filesystem:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshNodes = useCallback(() => {
    const tree = filesystemService.getTree();
    setNodes(tree);
  }, []);

  const createNode = useCallback(async (
    type: FilesystemNodeType,
    name: string,
    parentId: string,
    content?: any,
    isLocal?: boolean
  ) => {
    const newNode = await filesystemService.createNode(type, name, parentId, content, isLocal);
    refreshNodes();
    return newNode;
  }, [refreshNodes]);

  const updateNode = useCallback(async (id: string, updates: Partial<FilesystemNode>) => {
    const updatedNode = await filesystemService.updateNode(id, updates);
    refreshNodes();
    return updatedNode;
  }, [refreshNodes]);

  const deleteNode = useCallback(async (id: string) => {
    await filesystemService.deleteNode(id);
    refreshNodes();
  }, [refreshNodes]);

  const moveNode = useCallback(async (id: string, newParentId: string) => {
    const updatedNode = await filesystemService.moveNode(id, newParentId);
    refreshNodes();
    return updatedNode;
  }, [refreshNodes]);

  const renameNode = useCallback(async (id: string, newName: string) => {
    const updatedNode = await filesystemService.renameNode(id, newName);
    refreshNodes();
    return updatedNode;
  }, [refreshNodes]);

  const duplicateNode = useCallback(async (id: string) => {
    const newNode = await filesystemService.duplicateNode(id);
    refreshNodes();
    return newNode;
  }, [refreshNodes]);

  const addButtonLink = useCallback(async (
    targetPath: string,
    buttonText: string,
    placement: 'subject' | 'chapter' | 'paragraph' | 'root',
    placementId?: string,
    icon?: string
  ) => {
    const buttonNode = await filesystemService.addButtonLink(
      targetPath,
      buttonText,
      placement,
      placementId,
      icon
    );
    refreshNodes();
    return buttonNode;
  }, [refreshNodes]);

  const getNode = useCallback((id: string) => {
    return filesystemService.getNode(id);
  }, []);

  const getChildren = useCallback((parentId: string) => {
    return filesystemService.getChildren(parentId);
  }, []);

  const getUserNotes = useCallback(() => {
    return filesystemService.getUserNotes();
  }, []);

  const searchNodes = useCallback((query: string) => {
    return filesystemService.searchNodes(query);
  }, []);

  // Return early on server to avoid context issues
  if (!isClient) {
    return {
      isInitialized: false,
      loading: true,
      nodes: [],
      createNode: async () => ({ id: '', type: 'root', name: '', parentId: null, path: '', metadata: { order: 0, permissions: { canRead: [], canWrite: [], canDelete: [] } }, createdAt: '', updatedAt: '', createdBy: '', isLocal: false } as FilesystemNode),
      updateNode: async () => ({ id: '', type: 'root', name: '', parentId: null, path: '', metadata: { order: 0, permissions: { canRead: [], canWrite: [], canDelete: [] } }, createdAt: '', updatedAt: '', createdBy: '', isLocal: false } as FilesystemNode),
      deleteNode: async () => {},
      moveNode: async () => ({ id: '', type: 'root', name: '', parentId: null, path: '', metadata: { order: 0, permissions: { canRead: [], canWrite: [], canDelete: [] } }, createdAt: '', updatedAt: '', createdBy: '', isLocal: false } as FilesystemNode),
      renameNode: async () => ({ id: '', type: 'root', name: '', parentId: null, path: '', metadata: { order: 0, permissions: { canRead: [], canWrite: [], canDelete: [] } }, createdAt: '', updatedAt: '', createdBy: '', isLocal: false } as FilesystemNode),
      duplicateNode: async () => ({ id: '', type: 'root', name: '', parentId: null, path: '', metadata: { order: 0, permissions: { canRead: [], canWrite: [], canDelete: [] } }, createdAt: '', updatedAt: '', createdBy: '', isLocal: false } as FilesystemNode),
      addButtonLink: async () => ({ id: '', type: 'root', name: '', parentId: null, path: '', metadata: { order: 0, permissions: { canRead: [], canWrite: [], canDelete: [] } }, createdAt: '', updatedAt: '', createdBy: '', isLocal: false } as FilesystemNode),
      getNode: () => undefined,
      getChildren: () => [],
      getUserNotes: () => [],
      searchNodes: () => [],
      refreshNodes: () => {},
    };
  }

  return {
    isInitialized,
    loading,
    nodes,
    createNode,
    updateNode,
    deleteNode,
    moveNode,
    renameNode,
    duplicateNode,
    addButtonLink,
    getNode,
    getChildren,
    getUserNotes,
    searchNodes,
    refreshNodes,
  };
}