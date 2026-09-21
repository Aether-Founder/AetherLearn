import Dexie, { Table } from 'dexie';

export interface OfflineReview {
  id?: number;
  cardId: string;
  rating: number;
  timestamp: Date;
  deckId: string;
  userId: string;
}

export interface OfflineDeck {
  id: string;
  title: string;
  subjectId: string;
  cards: any[];
  lastSynced: Date;
}

class AetherDB extends Dexie {
  offlineReviews!: Table<OfflineReview>;
  offlineDecks!: Table<OfflineDeck>;

  constructor() {
    super('AetherLearnDB');
    
    this.version(1).stores({
      offlineReviews: '++id, cardId, timestamp, deckId, userId',
      offlineDecks: 'id, title, subjectId, lastSynced',
    });
  }
}

export const db = new AetherDB();

// Add a review to the offline queue
export async function addOfflineReview(review: Omit<OfflineReview, 'id'>): Promise<void> {
  await db.offlineReviews.add(review);
}

// Get all pending offline reviews
export async function getPendingReviews(): Promise<OfflineReview[]> {
  return await db.offlineReviews.toArray();
}

// Clear synced reviews
export async function clearSyncedReviews(ids: number[]): Promise<void> {
  await db.offlineReviews.bulkDelete(ids);
}

// Cache a deck for offline use
export async function cacheDeck(deck: OfflineDeck): Promise<void> {
  await db.offlineDecks.put(deck);
}

// Get cached deck
export async function getCachedDeck(deckId: string): Promise<OfflineDeck | undefined> {
  return await db.offlineDecks.get(deckId);
}

// Get all cached decks
export async function getAllCachedDecks(): Promise<OfflineDeck[]> {
  return await db.offlineDecks.toArray();
}
