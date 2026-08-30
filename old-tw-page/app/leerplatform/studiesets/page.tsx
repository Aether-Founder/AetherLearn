'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Search, BookOpen } from 'lucide-react';

interface StudySet {
  id: string;
  title: string;
  description?: string;
  termCount: number;
  createdAt: Date;
}

export default function StudieSetsPage() {
  const [studySets, setStudySets] = useState<StudySet[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const savedSets = localStorage.getItem('aether-study-sets');
    if (savedSets) {
      setStudySets(JSON.parse(savedSets));
    }
  }, []);

  const filteredSets = studySets.filter((set) =>
    set.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-[1400px] mx-auto px-8 py-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1
            className="text-7xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            Alle studiesets
          </h1>
          <p className="text-[15px] text-gray-600">
            {studySets.length} {studySets.length === 1 ? 'studieset' : 'studiesets'}
          </p>
        </div>
        <Link href="/leerplatform/studiesets/nieuw">
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Nieuwe studieset
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Zoek studiesets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 border-2 text-lg py-6"
          />
        </div>
      </div>

      {/* Study Sets Grid */}
      {filteredSets.length > 0 ? (
        <div className="grid grid-cols-3 gap-6">
          {filteredSets.map((set) => (
            <Link key={set.id} href={`/leerplatform/studiesets/${set.id}`}>
              <Card className="border-2 hover:border-purple-400 transition-all cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {set.title}
                      </h3>
                      {set.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {set.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>
                      {set.termCount} {set.termCount === 1 ? 'term' : 'termen'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="p-16 text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3
              className="text-4xl font-bold text-gray-900 mb-4"
              style={{ fontFamily: 'Cormorant Garamond, serif' }}
            >
              {searchQuery ? 'Geen resultaten gevonden' : 'Nog geen studiesets'}
            </h3>
            <p className="text-[15px] text-gray-600 mb-6">
              {searchQuery
                ? 'Probeer een andere zoekterm'
                : 'Maak je eerste studieset om te beginnen'}
            </p>
            {!searchQuery && (
              <Link href="/leerplatform/studiesets/nieuw">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Maak studieset
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
