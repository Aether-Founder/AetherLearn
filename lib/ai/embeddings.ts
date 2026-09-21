import { getDefaultProvider } from './providers';
import { logAIUsage } from './rate-limiter';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

export interface EmbeddingResult {
  id: string;
  sourceType: string;
  sourceId: string;
  content: string;
  metadata: any;
  similarity: number;
}

// Generate embedding for a single text
export async function generateEmbedding(text: string): Promise<number[]> {
  const provider = getDefaultProvider();
  return provider.generateEmbedding(text);
}

// Embed an entire study set (all flashcards)
export async function embedStudySet(deckId: string, userId: string, supabase: SupabaseClient<Database>): Promise<void> {
  // Fetch all flashcards in the deck
  const { data: flashcards, error } = await (supabase as any)
    .from('flashcards')
    .select('*')
    .eq('study_set_id', deckId);

  if (error) {
    console.error('Error fetching flashcards:', error);
    throw error;
  }

  if (!flashcards || flashcards.length === 0) {
    console.log('No flashcards to embed');
    return;
  }

  // Fetch deck info for metadata
  const { data: deck } = await (supabase as any)
    .from('study_sets')
    .select('title, subject_id')
    .eq('id', deckId)
    .single();

  // Delete existing embeddings for this deck
  await (supabase as any)
    .from('embeddings')
    .delete()
    .eq('source_type', 'flashcard')
    .in('source_id', flashcards.map((f: any) => f.id));

  // Generate embeddings for each flashcard
  const embeddings = [];
  
  for (const card of flashcards) {
    const content = `Vraag: ${card.front}\nAntwoord: ${card.back}`;
    
    try {
      const embedding = await generateEmbedding(content);
      
      embeddings.push({
        user_id: userId,
        source_type: 'flashcard',
        source_id: card.id,
        content,
        embedding,
        metadata: {
          deck_id: deckId,
          deck_title: deck?.title || 'Onbekend',
          subject_id: deck?.subject_id,
          card_front: card.front,
          card_back: card.back,
        },
      });

      // Log usage
      await logAIUsage(userId, 'embedding', 'qwen-embedding', content.length, 0, 'qwen', supabase);
      
    } catch (err) {
      console.error(`Error embedding card ${card.id}:`, err);
    }
  }

  // Batch insert embeddings
  if (embeddings.length > 0) {
    const { error: insertError } = await (supabase as any)
      .from('embeddings')
      .insert(embeddings);

    if (insertError) {
      console.error('Error inserting embeddings:', insertError);
      throw insertError;
    }

    console.log(`✓ Embedded ${embeddings.length} flashcards for deck ${deckId}`);
  }
}

// Search for relevant embeddings using cosine similarity
export async function searchRelevant(
  query: string,
  userId: string,
  limit: number = 5,
  threshold: number = 0.7,
  supabase: SupabaseClient<Database>
): Promise<EmbeddingResult[]> {
  // Generate embedding for the query
  const queryEmbedding = await generateEmbedding(query);

  // Use the match_embeddings function
  const { data, error } = await supabase.rpc('match_embeddings', {
    query_embedding: queryEmbedding,
    match_user_id: userId,
    match_threshold: threshold,
    match_count: limit,
  });

  if (error) {
    console.error('Error searching embeddings:', error);
    return [];
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    sourceType: row.source_type,
    sourceId: row.source_id,
    content: row.content,
    metadata: row.metadata,
    similarity: row.similarity,
  }));
}

// Delete embeddings for a study set (when deck is deleted)
export async function deleteDeckEmbeddings(deckId: string, supabase: SupabaseClient<Database>): Promise<void> {
  const { error } = await (supabase as any)
    .from('embeddings')
    .delete()
    .eq('source_type', 'flashcard')
    .eq('metadata->>deck_id', deckId);

  if (error) {
    console.error('Error deleting embeddings:', error);
  }
}
