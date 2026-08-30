'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  FolderOpen,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Move,
  ChevronRight,
  Home,
  BookOpen,
} from 'lucide-react';

interface Folder {
  id: string;
  name: string;
  color: string;
  studySetCount: number;
  parentId?: string;
  createdAt: Date;
}

interface StudySet {
  id: string;
  title: string;
  termCount: number;
  folderId?: string;
}

const FOLDER_COLORS = [
  'bg-purple-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-pink-500',
  'bg-red-500',
  'bg-indigo-500',
  'bg-orange-500',
];

export default function VakkenPage() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [studySets, setStudySets] = useState<StudySet[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(undefined);
  const [folderPath, setFolderPath] = useState<Folder[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedColor, setSelectedColor] = useState(FOLDER_COLORS[0]);

  // Load data
  useEffect(() => {
    const savedFolders = localStorage.getItem('aether-folders');
    const savedSets = localStorage.getItem('aether-study-sets');
    
    if (savedFolders) setFolders(JSON.parse(savedFolders));
    if (savedSets) setStudySets(JSON.parse(savedSets));
  }, []);

  // Save data
  useEffect(() => {
    localStorage.setItem('aether-folders', JSON.stringify(folders));
  }, [folders]);

  useEffect(() => {
    localStorage.setItem('aether-study-sets', JSON.stringify(studySets));
  }, [studySets]);

  // Build folder path
  useEffect(() => {
    if (!currentFolderId) {
      setFolderPath([]);
      return;
    }

    const path: Folder[] = [];
    let folderId: string | undefined = currentFolderId;
    
    while (folderId) {
      const folder = folders.find(f => f.id === folderId);
      if (!folder) break;
      path.unshift(folder);
      folderId = folder.parentId;
    }
    
    setFolderPath(path);
  }, [currentFolderId, folders]);

  const currentFolders = folders.filter(f => f.parentId === currentFolderId);
  const currentStudySets = studySets.filter(s => s.folderId === currentFolderId);

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;

    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name: newFolderName,
      color: selectedColor,
      studySetCount: 0,
      parentId: currentFolderId,
      createdAt: new Date(),
    };

    setFolders([...folders, newFolder]);
    setNewFolderName('');
    setIsCreateDialogOpen(false);
  };

  const handleDeleteFolder = (folderId: string) => {
    if (!confirm('Weet je zeker dat je deze map wilt verwijderen?')) return;
    
    // Delete folder and all its children recursively
    const deleteRecursive = (id: string) => {
      const children = folders.filter(f => f.parentId === id);
      children.forEach(child => deleteRecursive(child.id));
      
      // Delete study sets in this folder
      setStudySets(studySets.filter(s => s.folderId !== id));
    };
    
    deleteRecursive(folderId);
    setFolders(folders.filter(f => f.id !== folderId));
  };

  const handleMoveFolder = (folderId: string, newParentId?: string) => {
    setFolders(
      folders.map(f =>
        f.id === folderId ? { ...f, parentId: newParentId } : f
      )
    );
  };

  const handleMoveStudySet = (setId: string, newFolderId?: string) => {
    setStudySets(
      studySets.map(s =>
        s.id === setId ? { ...s, folderId: newFolderId } : s
      )
    );
  };

  const handleDeleteStudySet = (setId: string) => {
    if (!confirm('Weet je zeker dat je deze studieset wilt verwijderen?')) return;
    setStudySets(studySets.filter(s => s.id !== setId));
  };

  const handleDuplicateStudySet = (setId: string) => {
    const original = studySets.find(s => s.id === setId);
    if (!original) return;

    const duplicate: StudySet = {
      ...original,
      id: `set-${Date.now()}`,
      title: `${original.title} (kopie)`,
    };

    setStudySets([...studySets, duplicate]);
  };

  return (
    <div className="max-w-[1400px] mx-auto px-8 py-16">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8 text-sm text-gray-600">
        <button
          onClick={() => setCurrentFolderId(undefined)}
          className="flex items-center gap-1 hover:text-purple-600 transition-colors"
        >
          <Home className="w-4 h-4" />
          Mappen
        </button>
        {folderPath.map((folder) => (
          <div key={folder.id} className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4" />
            <button
              onClick={() => setCurrentFolderId(folder.id)}
              className="hover:text-purple-600 transition-colors"
            >
              {folder.name}
            </button>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <h1
          className="text-7xl font-bold text-gray-900"
          style={{ fontFamily: 'Cormorant Garamond, serif' }}
        >
          {currentFolderId ? folderPath[folderPath.length - 1]?.name : 'Mappen'}
        </h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Nieuwe map
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nieuwe map maken</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Mapnaam
                </label>
                <Input
                  placeholder="Bijvoorbeeld: Wiskunde"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Kleur
                </label>
                <div className="flex gap-2">
                  {FOLDER_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-lg ${color} ${
                        selectedColor === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>
              <Button
                onClick={handleCreateFolder}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Map maken
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Content */}
      {currentFolders.length === 0 && currentStudySets.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="p-12 text-center">
            <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3
              className="text-4xl font-bold text-gray-900 mb-4"
              style={{ fontFamily: 'Cormorant Garamond, serif' }}
            >
              Deze map is leeg
            </h3>
            <p className="text-[15px] text-gray-600 mb-6">
              Maak een nieuwe map of voeg een studieset toe
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nieuwe map
              </Button>
              <Link href="/leerplatform/studiesets/nieuw">
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Nieuwe studieset
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Folders */}
          {currentFolders.length > 0 && (
            <div>
              <h2
                className="text-3xl font-bold text-gray-900 mb-6"
                style={{ fontFamily: 'Cormorant Garamond, serif' }}
              >
                Mappen
              </h2>
              <div className="grid grid-cols-3 gap-6">
                {currentFolders.map((folder) => (
                  <Card
                    key={folder.id}
                    className="border-2 hover:border-purple-400 transition-all cursor-pointer group"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div
                          onClick={() => setCurrentFolderId(folder.id)}
                          className="flex items-center gap-3 flex-1"
                        >
                          <div className={`w-12 h-12 ${folder.color} rounded-lg flex items-center justify-center`}>
                            <FolderOpen className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">
                              {folder.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {folder.studySetCount} {folder.studySetCount === 1 ? 'item' : 'items'}
                            </p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {}}>
                              <Edit className="w-4 h-4 mr-2" />
                              Naam wijzigen
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleMoveFolder(folder.id)}>
                              <Move className="w-4 h-4 mr-2" />
                              Verplaatsen
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteFolder(folder.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Verwijderen
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Study Sets */}
          {currentStudySets.length > 0 && (
            <div>
              <h2
                className="text-3xl font-bold text-gray-900 mb-6"
                style={{ fontFamily: 'Cormorant Garamond, serif' }}
              >
                Studiesets
              </h2>
              <div className="grid grid-cols-3 gap-6">
                {currentStudySets.map((set) => (
                  <Card
                    key={set.id}
                    className="border-2 hover:border-purple-400 transition-all group"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <Link
                          href={`/leerplatform/studiesets/${set.id}`}
                          className="flex-1"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <BookOpen className="w-5 h-5 text-purple-600" />
                            <h3 className="text-xl font-bold text-gray-900">
                              {set.title}
                            </h3>
                          </div>
                          <p className="text-sm text-gray-600">
                            {set.termCount} {set.termCount === 1 ? 'term' : 'termen'}
                          </p>
                        </Link>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDuplicateStudySet(set.id)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Dupliceren
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleMoveStudySet(set.id)}>
                              <Move className="w-4 h-4 mr-2" />
                              Verplaatsen
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteStudySet(set.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Verwijderen
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
