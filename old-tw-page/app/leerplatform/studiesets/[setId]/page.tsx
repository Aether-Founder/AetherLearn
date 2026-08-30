'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  CreditCard,
  BookOpen,
  Edit3,
  CheckSquare,
  FileText,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  ChevronLeft,
} from 'lucide-react';

interface Term {
  id: string;
  term: string;
  definition: string;
}

interface StudySet {
  id: string;
  title: string;
  description?: string;
  termCount: number;
  terms: Term[];
  createdAt: Date;
  lastStudied?: Date;
}

export default function StudySetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [studySet, setStudySet] = useState<StudySet | null>(null);

  useEffect(() => {
    const savedSets = localStorage.getItem('aether-study-sets');
    if (!savedSets) return;

    const sets = JSON.parse(savedSets);
    const set = sets.find((s: StudySet) => s.id === params.setId);
    if (set) setStudySet(set);
  }, [params.setId]);

  const handleDelete = () => {
    if (!confirm('Weet je zeker dat je deze studieset wilt verwijderen?')) return;

    const savedSets = localStorage.getItem('aether-study-sets');
    if (!savedSets) return;

    const sets = JSON.parse(savedSets);
    const updated = sets.filter((s: StudySet) => s.id !== params.setId);
    localStorage.setItem('aether-study-sets', JSON.stringify(updated));
    router.push('/leerplatform');
  };

  const handleDuplicate = () => {
    if (!studySet) return;

    const duplicate = {
      ...studySet,
      id: `set-${Date.now()}`,
      title: `${studySet.title} (kopie)`,
      createdAt: new Date(),
    };

    const savedSets = localStorage.getItem('aether-study-sets');
    const sets = savedSets ? JSON.parse(savedSets) : [];
    sets.push(duplicate);
    localStorage.setItem('aether-study-sets', JSON.stringify(sets));

    router.push(`/leerplatform/studiesets/${duplicate.id}`);
  };

  if (!studySet) {
    return (
      <div className="max-w-[1400px] mx-auto px-8 py-16">
        <div className="text-center">
          <h1
            className="text-7xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            Studieset niet gevonden
          </h1>
          <Link href="/leerplatform">
            <Button className="bg-purple-600 hover:bg-purple-700">
              Terug naar overzicht
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const learningModes = [
    {
      id: 'flashcards',
      title: 'Flashcards',
      description: 'Oefen met flashcards',
      icon: CreditCard,
      color: 'bg-purple-500',
      href: `/leerplatform/studiesets/${studySet.id}/flashcards`,
    },
    {
      id: 'leren',
      title: 'Leren',
      description: 'Leer met slimme herhaling',
      icon: BookOpen,
      color: 'bg-blue-500',
      href: `/leerplatform/studiesets/${studySet.id}/leren`,
    },
    {
      id: 'schrijven',
      title: 'Schrijven',
      description: 'Type de antwoorden',
      icon: Edit3,
      color: 'bg-green-500',
      href: `/leerplatform/studiesets/${studySet.id}/schrijven`,
    },
    {
      id: 'meerkeuze',
      title: 'Meerkeuze',
      description: 'Kies het juiste antwoord',
      icon: CheckSquare,
      color: 'bg-yellow-500',
      href: `/leerplatform/studiesets/${studySet.id}/meerkeuze`,
    },
    {
      id: 'toets',
      title: 'Toets',
      description: 'Test je kennis',
      icon: FileText,
      color: 'bg-pink-500',
      href: `/leerplatform/studiesets/${studySet.id}/toets`,
    },
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-8 py-16">
      {/* Back Button */}
      <Link
        href="/leerplatform"
        className="inline-flex items-center text-gray-600 hover:text-purple-600 mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Terug naar overzicht
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-12">
        <div>
          <h1
            className="text-7xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            {studySet.title}
          </h1>
          {studySet.description && (
            <p className="text-[15px] text-gray-600 mb-4">
              {studySet.description}
            </p>
          )}
          <p className="text-[15px] text-gray-600">
            {studySet.termCount} {studySet.termCount === 1 ? 'term' : 'termen'}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => {}}>
              <Edit className="w-4 h-4 mr-2" />
              Bewerken
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDuplicate}>
              <Copy className="w-4 h-4 mr-2" />
              Dupliceren
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} className="text-red-600">
              <Trash2 className="w-4 h-4 mr-2" />
              Verwijderen
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Learning Modes */}
      <div className="mb-16">
        <h2
          className="text-3xl font-bold text-gray-900 mb-6"
          style={{ fontFamily: 'Cormorant Garamond, serif' }}
        >
          Leermodi
        </h2>
        <div className="grid grid-cols-3 gap-6">
          {learningModes.map((mode) => (
            <Link key={mode.id} href={mode.href}>
              <Card className="border-2 hover:border-purple-400 transition-all cursor-pointer group">
                <CardContent className="p-8">
                  <div
                    className={`w-16 h-16 ${mode.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <mode.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {mode.title}
                  </h3>
                  <p className="text-[15px] text-gray-600">{mode.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Terms List */}
      <div>
        <h2
          className="text-3xl font-bold text-gray-900 mb-6"
          style={{ fontFamily: 'Cormorant Garamond, serif' }}
        >
          Termen in deze set
        </h2>
        <div className="space-y-4">
          {studySet.terms.map((term, index) => (
            <Card key={term.id} className="border-2">
              <CardContent className="p-6">
                <div className="flex gap-6">
                  <div className="text-2xl font-bold text-gray-400">
                    {index + 1}
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-6">
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">
                        TERM
                      </div>
                      <div className="text-lg font-medium text-gray-900">
                        {term.term}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">
                        DEFINITIE
                      </div>
                      <div className="text-lg text-gray-700">
                        {term.definition}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
