import { createClient } from '@/lib/supabase/client';
import { getPendingReviews, clearSyncedReviews } from './db';

// Sync offline reviews to Supabase
export async function syncOfflineReviews(): Promise<{ synced: number; failed: number }> {
  const supabase = createClient();
  const pendingReviews = await getPendingReviews();
  
  if (pendingReviews.length === 0) {
    return { synced: 0, failed: 0 };
  }

  let synced = 0;
  let failed = 0;
  const syncedIds: number[] = [];

  for (const review of pendingReviews) {
    try {
      // Insert review into card_reviews
      const { error } = await supabase
        .from('card_reviews')
        .insert({
          flashcard_id: review.cardId,
          user_id: review.userId,
          was_correct: review.rating >= 3,
          reviewed_at: review.timestamp instanceof Date ? review.timestamp.toISOString() : review.timestamp,
        });

      if (error) throw error;

      synced++;
      if (review.id) {
        syncedIds.push(review.id);
      }
    } catch (error) {
      console.error('Failed to sync review:', error);
      failed++;
    }
  }

  // Clear synced reviews from IndexedDB
  if (syncedIds.length > 0) {
    await clearSyncedReviews(syncedIds);
  }

  return { synced, failed };
}

// Check if user is online
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine;
}

// Auto-sync when coming back online
export function setupOnlineSync() {
  if (typeof window === 'undefined') return;

  window.addEventListener('online', async () => {
    console.log('[Sync] Back online, syncing...');
    const result = await syncOfflineReviews();
    console.log(`[Sync] Synced ${result.synced} reviews, ${result.failed} failed`);
  });
}
