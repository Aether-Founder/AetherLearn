import { createClient } from '@/lib/supabase/client';
import { embedStudySet } from './embeddings';

// Background job to embed a study set after creation/import
export async function backgroundEmbedStudySet(deckId: string, userId: string): Promise<void> {
  try {
    console.log(`[Background] Starting embedding for deck ${deckId}`);
    const supabase = createClient();
    await embedStudySet(deckId, userId, supabase);
    console.log(`[Background] Completed embedding for deck ${deckId}`);
  } catch (error) {
    console.error(`[Background] Failed to embed deck ${deckId}:`, error);
    // Don't throw - this is a background job
  }
}

// Hook to trigger embedding after deck creation
export function useAutoEmbed() {
  const triggerEmbedding = async (deckId: string, userId: string) => {
    // Run in background (don't await)
    backgroundEmbedStudySet(deckId, userId);
  };

  return { triggerEmbedding };
}
