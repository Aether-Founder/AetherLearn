import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { addOfflineReview, cacheDeck, getCachedDeck } from '@/lib/pwa/db';
import { isOnline, syncOfflineReviews } from '@/lib/pwa/sync';

export function useOfflineStudy(deckId: string) {
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [cachedData, setCachedData] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    // Check if offline
    const offline = !isOnline();
    setIsOfflineMode(offline);

    // Try to load from cache if offline
    if (offline && deckId) {
      getCachedDeck(deckId).then((data) => {
        if (data) {
          setCachedData(data);
        }
      });
    }

    // Sync when coming back online
    if (!offline) {
      syncOfflineReviews().then((result) => {
        if (result.synced > 0) {
          console.log(`Synced ${result.synced} offline reviews`);
        }
      });
    }
  }, [deckId]);

  const saveReview = async (cardId: string, rating: number, userId: string) => {
    if (isOfflineMode) {
      // Save to IndexedDB
      await addOfflineReview({
        cardId,
        rating,
        timestamp: new Date(),
        deckId,
        userId,
      });
      console.log('[Offline] Review saved locally');
    } else {
      // Save to Supabase
      const { error } = await supabase.from('card_reviews').insert({
        flashcard_id: cardId,
        user_id: userId,
        was_correct: rating >= 3,
        reviewed_at: new Date().toISOString(),
      });

      if (error) {
        console.error('Failed to save review:', error);
        // Fallback to offline storage
        await addOfflineReview({
          cardId,
          rating,
          timestamp: new Date(),
          deckId,
          userId,
        });
      }
    }
  };

  return {
    isOfflineMode,
    cachedData,
    saveReview,
  };
}
