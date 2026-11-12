'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, RotateCcw, CheckCircle, XCircle } from 'lucide-react';
import { useTranslation } from '@/lib/useTranslation';

interface StudyCard {
  id: string;
  term: string;
  definition: string;
  imageUrl?: string;
}

interface LearnModeProps {
  cards: StudyCard[];
  onComplete: (results: { correct: number; incorrect: number }) => void;
  onExit: () => void;
}

export function LearnMode({ cards, onComplete, onExit }: LearnModeProps) {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDefinition, setShowDefinition] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [reviewCards, setReviewCards] = useState<string[]>([]);

  const currentCard = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;

  const handleShowDefinition = () => {
    setShowDefinition(true);
  };

  const handleCorrect = () => {
    setCorrect(correct + 1);
    nextCard();
  };

  const handleIncorrect = () => {
    setIncorrect(incorrect + 1);
    setReviewCards([...reviewCards, currentCard.id]);
    nextCard();
  };

  const nextCard = () => {
    setShowDefinition(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete({ correct, incorrect: incorrect + 1 });
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowDefinition(false);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setShowDefinition(false);
    setCorrect(0);
    setIncorrect(0);
    setReviewCards([]);
  };

  if (cards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">{t('shell_no_cards_learn')}</p>
        <Button onClick={onExit}>{t('shell_back')}</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" onClick={onExit}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          {t('shell_exit')}
        </Button>
        <div className="text-sm text-muted-foreground">
          {currentIndex + 1} / {cards.length}
        </div>
        <Button variant="ghost" size="sm" onClick={handleRestart}>
          <RotateCcw className="w-4 h-4 mr-2" />
          {t('shell_restart')}
        </Button>
      </div>

      <Progress value={progress} className="mb-6" />

      <div className="bg-card border border-border rounded-lg p-8 mb-6">
        <div className="text-center mb-6">
          <p className="text-sm text-muted-foreground mb-2">{t('lp_term')}</p>
          <h2 className="text-2xl font-semibold">{currentCard.term}</h2>
        </div>

        {currentCard.imageUrl && (
          <div className="mb-6">
            <img
              src={currentCard.imageUrl}
              alt={currentCard.term}
              className="max-h-48 mx-auto rounded-lg"
            />
          </div>
        )}

        {!showDefinition ? (
          <Button onClick={handleShowDefinition} className="w-full">
            {t('shell_show_definition')}
          </Button>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">{t('lp_definition')}</p>
              <p className="text-xl">{currentCard.definition}</p>
            </div>

            <div className="flex gap-4">
              <Button onClick={handleIncorrect} variant="destructive" className="flex-1">
                <XCircle className="w-4 h-4 mr-2" />
                {t('shell_wrong')}
              </Button>
              <Button onClick={handleCorrect} variant="default" className="flex-1">
                <CheckCircle className="w-4 h-4 mr-2" />
                {t('advanced_quality_good')}
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <Button variant="ghost" size="sm" onClick={handlePrevious} disabled={currentIndex === 0}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          {t('previous')}
        </Button>

        <div className="flex gap-4">
          <span className="flex items-center text-green-600">
            <CheckCircle className="w-4 h-4 mr-1" />
            {correct}
          </span>
          <span className="flex items-center text-red-600">
            <XCircle className="w-4 h-4 mr-1" />
            {incorrect}
          </span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={nextCard}
          disabled={currentIndex === cards.length - 1}
        >
          {t('next')}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
