'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MoreVertical, 
  Move, 
  Trash2, 
  Edit2, 
  Copy, 
  Link2
} from 'lucide-react';
import { FilesystemNode } from '@/types/filesystem';
import ConfirmDialog from '@/components/ConfirmDialog';

interface FileOperationsMenuProps {
  node: FilesystemNode;
  onMove: (nodeId: string, newParentId: string) => Promise<void>;
  onRename: (nodeId: string, newName: string) => Promise<void>;
  onDelete: (nodeId: string) => Promise<void>;
  onDuplicate: (nodeId: string) => Promise<void>;
  onCreateShortcut: (nodeId: string, targetPath: string, buttonText: string) => Promise<void>;
  availableParents: FilesystemNode[];
}

export default function FileOperationsMenu({
  node,
  onMove,
  onRename,
  onDelete,
  onDuplicate,
  onCreateShortcut,
  availableParents,
}: FileOperationsMenuProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showShortcutDialog, setShowShortcutDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showMoveConfirmDialog, setShowMoveConfirmDialog] = useState(false);
  const [selectedParent, setSelectedParent] = useState('');
  const [newName, setNewName] = useState(node.name);
  const [shortcutTargetPath, setShortcutTargetPath] = useState('');
  const [shortcutButtonText, setShortcutButtonText] = useState(node.name);

  const handleMove = async () => {
    if (!selectedParent) return;
    setShowMoveConfirmDialog(true);
  };

  const confirmMove = async () => {
    await onMove(node.id, selectedParent);
    setShowMoveDialog(false);
    setShowMoveConfirmDialog(false);
    setShowMenu(false);
  };

  const handleRename = async () => {
    if (!newName.trim()) return;
    await onRename(node.id, newName);
    setShowRenameDialog(false);
    setShowMenu(false);
  };

  const handleDelete = async () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    await onDelete(node.id);
    setShowDeleteDialog(false);
    setShowMenu(false);
  };

  const handleDuplicate = async () => {
    await onDuplicate(node.id);
    setShowMenu(false);
  };

  const handleCreateShortcut = async () => {
    if (!shortcutTargetPath || !shortcutButtonText.trim()) return;
    await onCreateShortcut(node.id, shortcutTargetPath, shortcutButtonText);
    setShowShortcutDialog(false);
    setShowMenu(false);
  };

  return (
    <>
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowMenu(!showMenu)}
          className="h-8 w-8 p-0"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>

        {showMenu && (
          <div className="absolute right-0 top-8 z-50 w-48 rounded-md border border-border bg-background shadow-lg">
            <div className="py-1">
              <button
                onClick={() => {
                  setShowMoveDialog(true);
                  setShowMenu(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-secondary"
              >
                <Move className="h-4 w-4" />
                Move
              </button>
              <button
                onClick={() => {
                  setShowRenameDialog(true);
                  setShowMenu(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-secondary"
              >
                <Edit2 className="h-4 w-4" />
                Rename
              </button>
              <button
                onClick={handleDuplicate}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-secondary"
              >
                <Copy className="h-4 w-4" />
                Duplicate
              </button>
              <button
                onClick={() => {
                  setShowShortcutDialog(true);
                  setShowMenu(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-secondary"
              >
                <Link2 className="h-4 w-4" />
                Create Shortcut
              </button>
              <button
                onClick={handleDelete}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-secondary text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Move Dialog */}
      <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move "{node.name}"</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="parent">New Location</Label>
              <Select value={selectedParent} onValueChange={setSelectedParent}>
                <SelectTrigger id="parent">
                  <SelectValue placeholder="Select new parent" />
                </SelectTrigger>
                <SelectContent>
                  {availableParents.map((parent) => (
                    <SelectItem key={parent.id} value={parent.id}>
                      {parent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMoveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleMove} disabled={!selectedParent}>
              Move
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename "{node.name}"</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">New Name</Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter new name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRenameDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRename} disabled={!newName.trim()}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shortcut Dialog */}
      <Dialog open={showShortcutDialog} onOpenChange={setShowShortcutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Shortcut for "{node.name}"</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="targetPath">Target Path</Label>
              <Input
                id="targetPath"
                value={shortcutTargetPath}
                onChange={(e) => setShortcutTargetPath(e.target.value)}
                placeholder="/path/to/target"
              />
            </div>
            <div>
              <Label htmlFor="buttonText">Button Text</Label>
              <Input
                id="buttonText"
                value={shortcutButtonText}
                onChange={(e) => setShortcutButtonText(e.target.value)}
                placeholder="Button text"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShortcutDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateShortcut}
              disabled={!shortcutTargetPath || !shortcutButtonText.trim()}
            >
              Create Shortcut
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title={`"${node.name}" verwijderen`}
        description={`Weet je zeker dat je "${node.name}" wilt verwijderen? ${node.type === 'note_folder' ? 'Alle inhoud in deze map zal ook worden verwijderd.' : ''} Deze actie kan niet ongedaan worden gemaakt.`}
        onConfirm={confirmDelete}
        confirmText="Verwijderen"
        cancelText="Annuleren"
        variant="destructive"
      />

      {/* Move Confirmation Dialog */}
      <ConfirmDialog
        open={showMoveConfirmDialog}
        onOpenChange={setShowMoveConfirmDialog}
        title={`"${node.name}" verplaatsen`}
        description={`Weet je zeker dat je "${node.name}" wilt verplaatsen naar een nieuwe locatie?`}
        onConfirm={confirmMove}
        confirmText="Verplaatsen"
        cancelText="Annuleren"
        variant="default"
      />
    </>
  );
}