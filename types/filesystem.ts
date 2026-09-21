/**
 * Unified Digital Filesystem Types
 * This defines the structure for the entire application's content filesystem
 */

export type FilesystemNodeType =
  | 'root'
  | 'subject'
  | 'chapter'
  | 'topic'
  | 'paragraph'
  | 'leerset_page'
  | 'study_set'
  | 'note_folder'
  | 'note'
  | 'shortcut'
  | 'button_link';

export interface FilesystemNode {
  id: string;
  type: FilesystemNodeType;
  name: string;
  parentId: string | null;
  path: string; // Full path in filesystem
  metadata: FilesystemMetadata;
  content?: FilesystemContent;
  children?: FilesystemNode[];
  createdAt: string;
  updatedAt: string;
  createdBy: string; // 'admin' or user_id
  isLocal: boolean; // true for user-only content (notes)
}

export interface FilesystemMetadata {
  color?: string;
  icon?: string;
  order: number;
  permissions: {
    canRead: string[]; // 'admin', 'user', or specific user_ids
    canWrite: string[];
    canDelete: string[];
  };
  tags?: string[];
  thumbnail?: string;
}

export interface FilesystemContent {
  // For leerset pages
  leersetPage?: {
    title: string;
    description: string;
    content: any; // JSON content structure
    buttonConfig?: ButtonConfig;
  };
  
  // For study sets
  studySet?: {
    title: string;
    description: string;
    cardCount: number;
  };
  
  // For notes
  note?: {
    content: any; // BlockNote content
    diagrams?: Diagram[];
    mindMaps?: MindMap[];
    drawings?: Drawing[];
  };
  
  // For shortcuts/buttons
  shortcut?: {
    targetId: string;
    targetPath: string;
    buttonText: string;
    buttonIcon?: string;
  };
}

export interface ButtonConfig {
  text: string;
  icon?: string;
  targetPath: string;
  placement: 'subject' | 'chapter' | 'topic' | 'root';
  placementId?: string; // ID of subject/chapter/topic
  style?: 'primary' | 'secondary' | 'outline';
}

export interface Diagram {
  id: string;
  type: 'flowchart' | 'sequence' | 'class' | 'entity';
  data: any; // Diagram-specific data
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export interface MindMap {
  id: string;
  nodes: MindMapNode[];
  connections: MindMapConnection[];
  centralNodeId: string;
}

export interface MindMapNode {
  id: string;
  text: string;
  position: { x: number; y: number };
  color?: string;
  size?: number;
}

export interface MindMapConnection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  label?: string;
  style?: 'solid' | 'dashed' | 'dotted';
}

export interface Drawing {
  id: string;
  type: 'freehand' | 'shape' | 'text';
  strokes: Stroke[];
  backgroundColor?: string;
}

export interface Stroke {
  points: { x: number; y: number }[];
  color: string;
  width: number;
  style?: 'solid' | 'dashed';
}

export interface FilesystemOperation {
  type: 'move' | 'delete' | 'rename' | 'duplicate' | 'create' | 'update';
  nodeId: string;
  targetParentId?: string;
  newName?: string;
  metadata?: Partial<FilesystemMetadata>;
  content?: Partial<FilesystemContent>;
}

export interface FilesystemSnapshot {
  version: number;
  timestamp: string;
  nodes: FilesystemNode[];
  checksum: string;
}