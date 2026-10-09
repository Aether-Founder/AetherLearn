'use client';

import { useState, useEffect } from 'react';
import { AppShell, PageHeader } from '@/components/AppShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  FileText, 
  GripVertical, 
  Image as ImageIcon, 
  Video, 
  Type, 
  Heading1, 
  Heading2,
  Save,
  X,
  Copy,
  Download
} from 'lucide-react';
import { toast } from 'sonner';

// Block types for the builder
type BlockType = 'text' | 'image' | 'video' | 'header' | 'title' | 'subtitle';

interface ContentBlock {
  id: string;
  type: BlockType;
  content: string;
  order: number;
  // For image/video blocks
  url?: string;
  isLocal?: boolean;
  altText?: string;
  // For header/title blocks
  level?: number;
}

interface LearnPageData {
  id: string;
  subject: string;
  siteMetadata: {
    title: string;
    titleI18n?: { en: string; nl: string };
    description: string;
    descriptionI18n?: { en: string; nl: string };
  };
  defaultViewMode: string;
  availableModes: string[];
  summary: string;
  summaryI18n?: { en: string; nl: string };
  summaryContentType: string;
  sections: any[];
}

export default function JsonBuilderPage() {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingBlock, setEditingBlock] = useState<ContentBlock | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [generatedJson, setGeneratedJson] = useState<string>('');
  
  // Page metadata
  const [pageMetadata, setPageMetadata] = useState({
    id: '',
    subject: '',
    title: '',
    titleEn: '',
    titleNl: '',
    description: '',
    descriptionEn: '',
    descriptionNl: '',
    summary: '',
    summaryEn: '',
    summaryNl: '',
  });

  // Form state for adding/editing blocks
  const [blockForm, setBlockForm] = useState({
    type: 'text' as BlockType,
    content: '',
    url: '',
    isLocal: false,
    altText: '',
    level: 1,
  });

  const addBlock = () => {
    const newBlock: ContentBlock = {
      id: `block-${Date.now()}`,
      type: blockForm.type,
      content: blockForm.content,
      url: blockForm.url,
      isLocal: blockForm.isLocal,
      altText: blockForm.altText,
      level: blockForm.level,
      order: blocks.length,
    };

    setBlocks([...blocks, newBlock]);
    setBlockForm({
      type: 'text',
      content: '',
      url: '',
      isLocal: false,
      altText: '',
      level: 1,
    });
    setShowAddDialog(false);
    toast.success('Block added successfully');
  };

  const editBlock = (block: ContentBlock) => {
    setEditingBlock(block);
    setBlockForm({
      type: block.type,
      content: block.content,
      url: block.url || '',
      isLocal: block.isLocal || false,
      altText: block.altText || '',
      level: block.level || 1,
    });
    setShowAddDialog(true);
  };

  const updateBlock = () => {
    if (!editingBlock) return;

    const updatedBlocks = blocks.map(block =>
      block.id === editingBlock.id
        ? {
            ...block,
            type: blockForm.type,
            content: blockForm.content,
            url: blockForm.url,
            isLocal: blockForm.isLocal,
            altText: blockForm.altText,
            level: blockForm.level,
          }
        : block
    );

    setBlocks(updatedBlocks);
    setEditingBlock(null);
    setBlockForm({
      type: 'text',
      content: '',
      url: '',
      isLocal: false,
      altText: '',
      level: 1,
    });
    setShowAddDialog(false);
    toast.success('Block updated successfully');
  };

  const deleteBlock = (blockId: string) => {
    setBlocks(blocks.filter(block => block.id !== blockId));
    toast.success('Block deleted');
  };

  const moveBlock = (blockId: string, direction: 'up' | 'down') => {
    const blockIndex = blocks.findIndex(block => block.id === blockId);
    if (blockIndex === -1) return;

    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? blockIndex - 1 : blockIndex + 1;

    if (targetIndex < 0 || targetIndex >= blocks.length) return;

    // Swap blocks
    [newBlocks[blockIndex], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[blockIndex]];
    
    // Update order
    newBlocks.forEach((block, index) => {
      block.order = index;
    });

    setBlocks(newBlocks);
  };

  const generateJson = () => {
    // Convert blocks to sections
    const sections = blocks.map((block, index) => {
      const baseSection = {
        id: `sec-${index + 1}`,
        title: getBlockTitle(block),
        contentType: getContentType(block),
      };

      switch (block.type) {
        case 'text':
          return {
            ...baseSection,
            content: block.content,
          };
        case 'image':
          return {
            ...baseSection,
            contentType: 'html',
            html: `<img src="${block.url}" alt="${block.altText || 'Image'}" style="max-width: 100%; height: auto;" />`,
          };
        case 'video':
          return {
            ...baseSection,
            contentType: 'html',
            html: `<video controls style="max-width: 100%; height: auto;"><source src="${block.url}" type="video/mp4">Your browser does not support the video tag.</video>`,
          };
        case 'header':
        case 'title':
        case 'subtitle':
          return {
            ...baseSection,
            contentType: 'markdown',
            content: `${'#'.repeat(block.level || 1)} ${block.content}`,
          };
        default:
          return {
            ...baseSection,
            content: block.content,
          };
      }
    });

    const pageData: LearnPageData = {
      id: pageMetadata.id || 'learn-page-' + Date.now(),
      subject: pageMetadata.subject || 'General',
      siteMetadata: {
        title: pageMetadata.title,
        ...(pageMetadata.titleEn && pageMetadata.titleNl && {
          titleI18n: {
            en: pageMetadata.titleEn,
            nl: pageMetadata.titleNl,
          },
        }),
        description: pageMetadata.description,
        ...(pageMetadata.descriptionEn && pageMetadata.descriptionNl && {
          descriptionI18n: {
            en: pageMetadata.descriptionEn,
            nl: pageMetadata.descriptionNl,
          },
        }),
      },
      defaultViewMode: 'simple',
      availableModes: ['simple', 'study', 'summary', 'quiz'],
      summary: pageMetadata.summary,
      ...(pageMetadata.summaryEn && pageMetadata.summaryNl && {
        summaryI18n: {
          en: pageMetadata.summaryEn,
          nl: pageMetadata.summaryNl,
        },
      }),
      summaryContentType: 'markdown',
      sections,
    };

    const jsonString = JSON.stringify(pageData, null, 2);
    setGeneratedJson(jsonString);
    setShowPreview(true);
  };

  const getBlockTitle = (block: ContentBlock): string => {
    switch (block.type) {
      case 'text':
        return 'Text Block';
      case 'image':
        return 'Image';
      case 'video':
        return 'Video';
      case 'header':
        return 'Header';
      case 'title':
        return 'Title';
      case 'subtitle':
        return 'Subtitle';
      default:
        return 'Block';
    }
  };

  const getContentType = (block: ContentBlock): string => {
    switch (block.type) {
      case 'text':
        return 'markdown';
      case 'image':
      case 'video':
        return 'html';
      case 'header':
      case 'title':
      case 'subtitle':
        return 'markdown';
      default:
        return 'markdown';
    }
  };

  const copyJson = () => {
    navigator.clipboard.writeText(generatedJson);
    toast.success('JSON copied to clipboard');
  };

  const downloadJson = () => {
    const blob = new Blob([generatedJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pageMetadata.id || 'learn-page'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('JSON file downloaded');
  };

  const getBlockIcon = (type: BlockType) => {
    switch (type) {
      case 'text':
        return <Type className="h-4 w-4" />;
      case 'image':
        return <ImageIcon className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'header':
        return <Heading1 className="h-4 w-4" />;
      case 'title':
        return <Heading1 className="h-4 w-4" />;
      case 'subtitle':
        return <Heading2 className="h-4 w-4" />;
      default:
        return <Type className="h-4 w-4" />;
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="No-Code JSON Builder"
        description="Create learn pages using a visual block-based interface"
        action={
          <Button onClick={generateJson}>
            <Save className="mr-2 h-4 w-4" />
            Generate JSON
          </Button>
        }
      />

      <div className="mt-8 space-y-6">
        {/* Page Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Page Metadata</CardTitle>
            <CardDescription>Basic information about your learn page</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="page-id">Page ID</Label>
                <Input
                  id="page-id"
                  value={pageMetadata.id}
                  onChange={(e) => setPageMetadata({ ...pageMetadata, id: e.target.value })}
                  placeholder="biology-cell-structure"
                />
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={pageMetadata.subject}
                  onChange={(e) => setPageMetadata({ ...pageMetadata, subject: e.target.value })}
                  placeholder="Biology"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={pageMetadata.title}
                onChange={(e) => setPageMetadata({ ...pageMetadata, title: e.target.value })}
                placeholder="Cell Structure and Function"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="title-en">Title (English)</Label>
                <Input
                  id="title-en"
                  value={pageMetadata.titleEn}
                  onChange={(e) => setPageMetadata({ ...pageMetadata, titleEn: e.target.value })}
                  placeholder="Cell Structure and Function"
                />
              </div>
              <div>
                <Label htmlFor="title-nl">Title (Dutch)</Label>
                <Input
                  id="title-nl"
                  value={pageMetadata.titleNl}
                  onChange={(e) => setPageMetadata({ ...pageMetadata, titleNl: e.target.value })}
                  placeholder="Celstructuur en functie"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={pageMetadata.description}
                onChange={(e) => setPageMetadata({ ...pageMetadata, description: e.target.value })}
                placeholder="Learn about the basic components of cells"
                rows={2}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="description-en">Description (English)</Label>
                <Textarea
                  id="description-en"
                  value={pageMetadata.descriptionEn}
                  onChange={(e) => setPageMetadata({ ...pageMetadata, descriptionEn: e.target.value })}
                  placeholder="Learn about the basic components of cells"
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="description-nl">Description (Dutch)</Label>
                <Textarea
                  id="description-nl"
                  value={pageMetadata.descriptionNl}
                  onChange={(e) => setPageMetadata({ ...pageMetadata, descriptionNl: e.target.value })}
                  placeholder="Leer over de basiscomponenten van cellen"
                  rows={2}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="summary">Summary</Label>
              <Textarea
                id="summary"
                value={pageMetadata.summary}
                onChange={(e) => setPageMetadata({ ...pageMetadata, summary: e.target.value })}
                placeholder="# Summary\n\nCells are the fundamental units of life..."
                rows={4}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="summary-en">Summary (English)</Label>
                <Textarea
                  id="summary-en"
                  value={pageMetadata.summaryEn}
                  onChange={(e) => setPageMetadata({ ...pageMetadata, summaryEn: e.target.value })}
                  placeholder="# Summary\n\nCells are the fundamental units of life..."
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="summary-nl">Summary (Dutch)</Label>
                <Textarea
                  id="summary-nl"
                  value={pageMetadata.summaryNl}
                  onChange={(e) => setPageMetadata({ ...pageMetadata, summaryNl: e.target.value })}
                  placeholder="# Samenvatting\n\nCellen zijn de fundamentele eenheden van het leven..."
                  rows={4}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Blocks */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Content Blocks</CardTitle>
                <CardDescription>Add and arrange content blocks for your learn page</CardDescription>
              </div>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Block
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {blocks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No content blocks yet. Add your first block to get started!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {blocks.map((block, index) => (
                  <div
                    key={block.id}
                    className="flex items-start gap-3 border rounded-lg p-4 hover:border-border/50 transition-colors"
                  >
                    <div className="flex flex-col gap-1 mt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveBlock(block.id, 'up')}
                        disabled={index === 0}
                      >
                        ↑
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveBlock(block.id, 'down')}
                        disabled={index === blocks.length - 1}
                      >
                        ↓
                      </Button>
                    </div>

                    <GripVertical className="h-5 w-5 text-muted-foreground mt-1" />

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getBlockIcon(block.type)}
                        <span className="font-semibold">{getBlockTitle(block)}</span>
                        <span className="text-xs text-muted-foreground">
                          {block.type === 'header' || block.type === 'title' || block.type === 'subtitle'
                            ? `(Level ${block.level})`
                            : ''}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {block.type === 'image' || block.type === 'video'
                          ? block.url
                          : block.content}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => editBlock(block)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteBlock(block.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Block Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBlock ? 'Edit Block' : 'Add Content Block'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="block-type">Block Type</Label>
              <Select
                value={blockForm.type}
                onValueChange={(value: BlockType) => setBlockForm({ ...blockForm, type: value })}
              >
                <SelectTrigger id="block-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text Block</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="header">Header</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="subtitle">Subtitle</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(blockForm.type === 'header' || blockForm.type === 'title' || blockForm.type === 'subtitle') && (
              <div>
                <Label htmlFor="header-level">Header Level</Label>
                <Select
                  value={blockForm.level.toString()}
                  onValueChange={(value) => setBlockForm({ ...blockForm, level: parseInt(value) })}
                >
                  <SelectTrigger id="header-level">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Level 1 (H1)</SelectItem>
                    <SelectItem value="2">Level 2 (H2)</SelectItem>
                    <SelectItem value="3">Level 3 (H3)</SelectItem>
                    <SelectItem value="4">Level 4 (H4)</SelectItem>
                    <SelectItem value="5">Level 5 (H5)</SelectItem>
                    <SelectItem value="6">Level 6 (H6)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {blockForm.type === 'text' || blockForm.type === 'header' || blockForm.type === 'title' || blockForm.type === 'subtitle' ? (
              <div>
                <Label htmlFor="block-content">Content</Label>
                <Textarea
                  id="block-content"
                  value={blockForm.content}
                  onChange={(e) => setBlockForm({ ...blockForm, content: e.target.value })}
                  placeholder="Enter your text content here..."
                  rows={6}
                  className="font-mono text-sm"
                />
              </div>
            ) : (
              <>
                <div>
                  <Label htmlFor="block-url">URL or Local Path</Label>
                  <Input
                    id="block-url"
                    value={blockForm.url}
                    onChange={(e) => setBlockForm({ ...blockForm, url: e.target.value })}
                    placeholder="https://example.com/image.jpg or /local/path/image.jpg"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is-local"
                    checked={blockForm.isLocal}
                    onChange={(e) => setBlockForm({ ...blockForm, isLocal: e.target.checked })}
                  />
                  <Label htmlFor="is-local">Local file path</Label>
                </div>

                {blockForm.type === 'image' && (
                  <div>
                    <Label htmlFor="alt-text">Alt Text</Label>
                    <Input
                      id="alt-text"
                      value={blockForm.altText}
                      onChange={(e) => setBlockForm({ ...blockForm, altText: e.target.value })}
                      placeholder="Image description for accessibility"
                    />
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAddDialog(false);
              setEditingBlock(null);
              setBlockForm({
                type: 'text',
                content: '',
                url: '',
                isLocal: false,
                altText: '',
                level: 1,
              });
            }}>
              Cancel
            </Button>
            <Button onClick={editingBlock ? updateBlock : addBlock}>
              {editingBlock ? 'Update' : 'Add'} Block
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* JSON Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generated JSON</DialogTitle>
            <DialogDescription>
              Review and copy the generated JSON for your learn page
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Textarea
              value={generatedJson}
              readOnly
              rows={20}
              className="font-mono text-sm"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              <X className="mr-2 h-4 w-4" />
              Close
            </Button>
            <Button variant="outline" onClick={copyJson}>
              <Copy className="mr-2 h-4 w-4" />
              Copy to Clipboard
            </Button>
            <Button onClick={downloadJson}>
              <Download className="mr-2 h-4 w-4" />
              Download JSON
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}