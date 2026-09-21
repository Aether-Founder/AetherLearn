'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, BookOpen, Copy, Star, TrendingUp, Loader2 } from 'lucide-react';
import Fuse from 'fuse.js';

interface StudySet {
  id: string;
  title: string;
  description: string;
  subject_id: string;
  user_id: string;
  is_public: boolean;
  clone_count: number;
  rating_avg: number;
  rating_count: number;
  created_at: string;
  flashcards: { count: number }[];
  subjects: {
    name: string;
    color: string;
  };
  profiles: {
    username: string;
  };
}

export default function BibliotheekPage() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  
  const [decks, setDecks] = useState<StudySet[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'rating'>('popular');
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCloning, setIsCloning] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Fetch subjects
      const { data: subjectsData } = await supabase
        .from('subjects')
        .select('*')
        .order('name');

      if (subjectsData) {
        setSubjects(subjectsData);
      }

      // Fetch public decks
      const { data: decksData, error } = await supabase
        .from('study_sets')
        .select(`
          *,
          subjects (
            name,
            color
          ),
          profiles (
            username
          ),
          flashcards (
            count
          )
        `)
        .eq('is_public', true)
        .order('clone_count', { ascending: false })
        .limit(100);

      if (error) throw error;
      
      // Process flashcard counts
      const processedDecks = (decksData || []).map((deck: any) => ({
        ...deck,
        flashcards: [{ count: deck.flashcards?.length || 0 }],
      }));

      setDecks(processedDecks);
    } catch (error) {
      console.error('Error loading library:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClone = async (deckId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }

    setIsCloning(deckId);

    try {
      // Call the clone function
      const { data, error } = await supabase.rpc('clone_study_set', {
        source_deck_id: deckId,
        target_user_id: user.id,
      });

      if (error) throw error;

      // Show success message
      alert('Deck gekopieerd naar je bibliotheek!');

      // Redirect to the new deck
      router.push(`/leersets/${data}`);
    } catch (error: any) {
      console.error('Clone error:', error);
      alert(`Kopiëren mislukt: ${error.message}`);
    } finally {
      setIsCloning(null);
    }
  };

  // Fuse.js search configuration
  const fuse = useMemo(() => {
    return new Fuse(decks, {
      keys: ['title', 'description', 'subjects.name'],
      threshold: 0.3,
    });
  }, [decks]);

  // Filter and sort decks
  const filteredDecks = useMemo(() => {
    let result = decks;

    // Search filter
    if (searchQuery) {
      result = fuse.search(searchQuery).map(r => r.item);
    }

    // Subject filter
    if (selectedSubject !== 'all') {
      result = result.filter(d => d.subject_id === selectedSubject);
    }

    // Sort
    switch (sortBy) {
      case 'popular':
        result = [...result].sort((a, b) => b.clone_count - a.clone_count);
        break;
      case 'newest':
        result = [...result].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case 'rating':
        result = [...result].sort((a, b) => b.rating_avg - a.rating_avg);
        break;
    }

    return result;
  }, [decks, searchQuery, selectedSubject, sortBy, fuse]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= Math.round(rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
        <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Bibliotheek
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Ontdek en kopieer studiemateriaal van andere studenten
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Zoek op titel, onderwerp..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              />
            </div>

            {/* Subject Filter */}
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            >
              <option value="all">Alle vakken</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            >
              <option value="popular">Meest gekopieerd</option>
              <option value="newest">Nieuwste</option>
              <option value="rating">Best beoordeeld</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          {filteredDecks.length} {filteredDecks.length === 1 ? 'deck' : 'decks'} gevonden
        </div>

        {/* Deck Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDecks.map((deck, index) => (
            <motion.div
              key={deck.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
            >
              {/* Subject Badge */}
              <div className="flex items-center justify-between mb-4">
                <span
                  className="px-3 py-1 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: deck.subjects?.color || '#6b7280' }}
                >
                  {deck.subjects?.name || 'Onbekend'}
                </span>
                {deck.clone_count > 100 && (
                  <div className="flex items-center space-x-1 text-orange-600">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs font-medium">Populair</span>
                  </div>
                )}
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                {deck.title}
              </h3>

              {/* Description */}
              {deck.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {deck.description}
                </p>
              )}

              {/* Stats */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Kaarten</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {deck.flashcards[0]?.count || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Gekopieerd</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {deck.clone_count >= 1000
                      ? `${(deck.clone_count / 1000).toFixed(1)}k`
                      : deck.clone_count} keer
                  </span>
                </div>
                {deck.rating_count > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Beoordeling</span>
                    {renderStars(deck.rating_avg)}
                  </div>
                )}
              </div>

              {/* Creator */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-xs text-white font-medium">
                      {deck.profiles?.username?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {deck.profiles?.username || 'Anoniem'}
                  </span>
                </div>

                {/* Clone Button */}
                <button
                  onClick={() => handleClone(deck.id)}
                  disabled={isCloning === deck.id}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {isCloning === deck.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Kopiëren...</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Kopieer</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredDecks.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Geen decks gevonden. Probeer een andere zoekopdracht.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
