'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
}

interface StudySet {
  id: string;
  title: string;
  termCount: number;
  folderId?: string;
}

export default function FolderDetailPage() {
  const params = useParams();
  const [folder, setFolder] = useState<Folder | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [studySets, setStudySets] = useState<StudySet[]>([]);
  const [folderPath, setFolderPath] = useState<Folder[]>([]);

  useEffect(() => {
    const savedFolders = localStorage.getItem('aether-folders');
    const savedSets = localStorage.getItem('aether-study-sets');
    
    if (savedFolders) {
      const allFolders = JSON.parse(savedFolders);
      setFolders(allFolders);
      const currentFolder = allFolders.find((f: Folder) => f.id === params.folderId);
      setFolder(currentFolder);
    }
    if (savedSets) setStudySets(JSON.parse(savedSets));
  }, [params.folderId]);

  // Build folder path
  useEffect(() => {
    if (!folder) return;

    const path: Folder[] = [];
    let currentId: string | undefined = folder.id;
    
    while (currentId) {
      const f = folders.find(f => f.id === currentId);
      if (!f) break;
      path.unshift(f);
      currentId = f.parentId;
    }
    
    setFolderPath(path);
  }, [folder, folders]);

  if (!folder) {
    return (
      <div className="max-w-[1400px] mx-auto px-8 py-16">
        <div className="text-center">
          <h1
            className="text-7xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            Map niet gevonden
          </h1>
          <Link href="/leerplatform/vakken">
            <Button className="bg-purple-600 hover:bg-purple-700">
              Terug naar mappen
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const subFolders = folders.filter(f => f.parentId === folder.id);
  const folderStudySets = studySets.filter(s => s.folderId === folder.id);

  return (
    <div className="max-w-[1400px] mx-auto px-8 py-16">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8 text-sm text-gray-600">
        <Link
          href="/leerplatform/vakken"
          className="flex items-center gap-1 hover:text-purple-600 transition-colors"
        >
          <Home className="w-4 h-4" />
          Mappen
        </Link>
        {folderPath.map((f, idx) => (
          <div key={f.id} className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4" />
            {idx === folderPath.length - 1 ? (
              <span className="text-purple-600 font-medium">{f.name}</span>
            ) : (
              <Link
                href={`/leerplatform/vakken/${f.id}`}
                className="hover:text-purple-600 transition-colors"
              >
                {f.name}
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className={`w-20 h-20 ${folder.color} rounded-2xl flex items-center justify-center`}>
            <FolderOpen className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1
              className="text-7xl font-bold text-gray-900 mb-2"
              style={{ fontFamily: 'Cormorant Garamond, serif' }}
            >
              {folder.name}
            </h1>
            <p className="text-[15px] text-gray-600">
              {subFolders.length + folderStudySets.length} items
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/leerplatform/studiesets/nieuw">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Nieuwe studieset
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      {subFolders.length === 0 && folderStudySets.length === 0 ? (
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
              Voeg studiesets toe aan deze map
            </p>
            <Link href="/leerplatform/studiesets/nieuw">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Nieuwe studieset
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Subfolders */}
          {subFolders.length > 0 && (
            <div>
              <h2
                className="text-3xl font-bold text-gray-900 mb-6"
                style={{ fontFamily: 'Cormorant Garamond, serif' }}
              >
                Submappen
              </h2>
              <div className="grid grid-cols-3 gap-6">
                {subFolders.map((subFolder) => (
                  <Link key={subFolder.id} href={`/leerplatform/vakken/${subFolder.id}`}>
                    <Card className="border-2 hover:border-purple-400 transition-all cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 ${subFolder.color} rounded-lg flex items-center justify-center`}>
                            <FolderOpen className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">
                              {subFolder.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {subFolder.studySetCount} items
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Study Sets */}
          {folderStudySets.length > 0 && (
            <div>
              <h2
                className="text-3xl font-bold text-gray-900 mb-6"
                style={{ fontFamily: 'Cormorant Garamond, serif' }}
              >
                Studiesets
              </h2>
              <div className="grid grid-cols-3 gap-6">
                {folderStudySets.map((set) => (
                  <Link key={set.id} href={`/leerplatform/studiesets/${set.id}`}>
                    <Card className="border-2 hover:border-purple-400 transition-all cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                          <BookOpen className="w-5 h-5 text-purple-600" />
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">
                              {set.title}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {set.termCount} termen
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
