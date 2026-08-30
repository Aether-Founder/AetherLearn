import { createClient } from '@supabase/supabase-js';
import { config } from './config.js';

export const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export type ArtisanQueueItem = {
  id: string;
  user_id: string;
  file_name: string;
  storage_path: string;
  file_size_bytes: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result_deck_id?: string;
  admin_notes?: string;
  card_count?: number;
  created_at: string;
  updated_at: string;
};
