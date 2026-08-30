'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, RotateCw, X } from 'lucide-react';
import Link from 'next/link';

interface Term {
  id: string;
  term: string;
  definition: string;
}

interface StudySet {
  id: string;
  title: string;
  terms: Term[];
}

export default function FlashcardsPage() {
  const params = useParams();
  const router = useRouter();
  const [studySet, setStudySet] = useState<StudySet | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [shuffledTerms, setShuffledTerms] = useState<Term[]>([]);

  useEffect(() => {
    const savedSets = localStorage.getItem('aether-study-sets');
    if (!savedSets) return;

    const sets = JSON.parse(savedSets);
    const set = sets.find((s: StudySet) => s.id === params.setId);
    if (set) {
      setStudySet(set);
      setShuffledTerms([...set.terms]);
    }
  }, [params.setId]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % shuffledTerms.length);
    }, 150);
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) =>
        prev === 0 ? shuffledTerms.length - 1 : prev - 1
      );
    }, 150);
  };

  const handleShuffle = () => {
    const shuffled = [...shuffledTerms].sort(() => Math.random() - 0.5);
    setShuffledTerms(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  if (!studySet || shuffledTerms.length === 0) {
    return null;
  }

  const currentTerm = shuffledTerms[currentIndex];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-[1400px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/leerplatform/studiesets/${studySet.id}`}>
                <Button variant="ghost" size="icon">
                  <X className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {studySet.title}
                </h1>
                <p className="text-sm text-gray-600">
                  Flashcards · {currentIndex + 1} / {shuffledTerms.length}
                </p>
              </div>
            </div>
            <Button
              onClick={handleShuffle}
              variant="outline"
              className="border-2"
            >
              <RotateCw className="w-4 h-4 mr-2" />
              Shuffle
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-8 py-16">
        <div className="w-full max-w-4xl">
          {/* Flashcard */}
          <div
            className="perspective-1000 cursor-pointer mb-8"
            onClick={handleFlip}
          >
            <div
              className={`relative w-full transition-all duration-500 transform-style-3d ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
              style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              {/* Front */}
              <Card
                className={`min-h-[400px] border-4 border-purple-200 bg-white shadow-2xl flex items-center justify-center p-12 ${
                  isFlipped ? 'hidden' : 'block'
                }`}
              >
                <div className="text-center">
                  <div className="text-sm font-medium text-purple-600 mb-4">
                    TERM
                  </div>
                  <div
                    className="text-5xl font-bold text-gray-900"
                    style={{ fontFamily: 'Cormorant Garamond, serif' }}
                  >
                    {currentTerm.term}
                  </div>
                </div>
              </Card>

              {/* Back */}
              <Card
                className={`min-h-[400px] border-4 border-blue-200 bg-white shadow-2xl flex items-center justify-center p-12 ${
                  isFlipped ? 'block' : 'hidden'
                }`}
              >
                <div className="text-center">
                  <div className="text-sm font-medium text-blue-600 mb-4">
                    DEFINITIE
                  </div>
                  <div
                    className="text-4xl text-gray-900"
                    style={{ fontFamily: 'Cormorant Garamond, serif' }}
                  >
                    {currentTerm.definition}
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <div className="text-center text-sm text-gray-600 mb-6">
            Klik op de kaart om te draaien
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={handlePrevious}
              variant="outline"
              size="lg"
              className="border-2"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Vorige
            </Button>
            <div className="px-8 py-3 bg-white border-2 rounded-lg font-medium">
              {currentIndex + 1} / {shuffledTerms.length}
            </div>
            <Button
              onClick={handleNext}
              variant="outline"
              size="lg"
              className="border-2"
            >
              Volgende
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
