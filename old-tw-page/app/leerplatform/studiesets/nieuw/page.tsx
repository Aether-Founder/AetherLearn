'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, Save } from 'lucide-react';

interface Term {
  id: string;
  term: string;
  definition: string;
}

export default function NewStudySetPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [terms, setTerms] = useState<Term[]>([
    { id: '1', term: '', definition: '' },
    { id: '2', term: '', definition: '' },
  ]);

  const addTerm = () => {
    setTerms([
      ...terms,
      { id: `${Date.now()}`, term: '', definition: '' },
    ]);
  };

  const removeTerm = (id: string) => {
    if (terms.length <= 2) return;
    setTerms(terms.filter((t) => t.id !== id));
  };

  const updateTerm = (id: string, field: 'term' | 'definition', value: string) => {
    setTerms(
      terms.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('Voer een titel in voor je studieset');
      return;
    }

    const validTerms = terms.filter(t => t.term.trim() && t.definition.trim());
    if (validTerms.length < 2) {
      alert('Voeg minimaal 2 termen toe');
      return;
    }

    const newSet = {
      id: `set-${Date.now()}`,
      title,
      description,
      termCount: validTerms.length,
      terms: validTerms,
      createdAt: new Date(),
      lastStudied: undefined,
    };

    // Save to localStorage
    const savedSets = localStorage.getItem('aether-study-sets');
    const sets = savedSets ? JSON.parse(savedSets) : [];
    sets.push(newSet);
    localStorage.setItem('aether-study-sets', JSON.stringify(sets));

    router.push(`/leerplatform/studiesets/${newSet.id}`);
  };

  return (
    <div className="max-w-[1200px] mx-auto px-8 py-16">
      {/* Header */}
      <div className="mb-10">
        <h1
          className="text-7xl font-bold text-gray-900 mb-6"
          style={{ fontFamily: 'Cormorant Garamond, serif' }}
        >
          Nieuwe studieset maken
        </h1>
        <div className="space-y-4">
          <Input
            placeholder="Voer een titel in, bijvoorbeeld 'Biologie - Hoofdstuk 3'"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xl font-bold border-2"
          />
          <Textarea
            placeholder="Voeg een beschrijving toe (optioneel)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border-2"
          />
        </div>
      </div>

      {/* Terms */}
      <div className="space-y-6 mb-8">
        {terms.map((term, index) => (
          <Card key={term.id} className="border-2">
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                <div className="text-2xl font-bold text-gray-400 mt-2">
                  {index + 1}
                </div>
                <div className="flex-1 grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Term
                    </label>
                    <Input
                      placeholder="Voer term in"
                      value={term.term}
                      onChange={(e) =>
                        updateTerm(term.id, 'term', e.target.value)
                      }
                      className="border-2"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Definitie
                    </label>
                    <Input
                      placeholder="Voer definitie in"
                      value={term.definition}
                      onChange={(e) =>
                        updateTerm(term.id, 'definition', e.target.value)
                      }
                      className="border-2"
                    />
                  </div>
                </div>
                {terms.length > 2 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTerm(term.id)}
                    className="mt-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button
          onClick={addTerm}
          variant="outline"
          className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50"
        >
          <Plus className="w-4 h-4 mr-2" />
          Term toevoegen
        </Button>
        <div className="flex gap-3">
          <Button
            onClick={() => router.back()}
            variant="outline"
          >
            Annuleren
          </Button>
          <Button
            onClick={handleSave}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            Opslaan
          </Button>
        </div>
      </div>
    </div>
  );
}
