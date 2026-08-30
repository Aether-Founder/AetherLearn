import { createClient } from '@supabase/supabase-js';
import { config } from './config.js';

export const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Types for content creation
export interface Subject {
  name: string;
  description: string;
  color?: string;
  icon?: string;
}

export interface Chapter {
  subject_id: string;
  title: string;
  description: string;
  order?: number;
}

export interface LearningSet {
  subject_id: string;
  chapter_id?: string;
  title: string;
  description: string;
  cards: Array<{
    front: string;
    back: string;
    source_text?: string;
  }>;
}

export interface Quiz {
  subject_id: string;
  chapter_id?: string;
  title: string;
  description: string;
  questions: Array<{
    type: 'multiple_choice' | 'open';
    question: string;
    options?: string[];
    correct_answer?: number;
    model_answer?: string;
    explanation?: string;
  }>;
}

export interface Summary {
  subject_id: string;
  chapter_id?: string;
  title: string;
  content: string;
  tags?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export interface PracticeTest {
  subject_id: string;
  chapter_id?: string;
  title: string;
  description: string;
  duration_minutes: number;
  passing_score: number;
  questions: Array<{
    type: string;
    question: string;
    options?: string[];
    correct_answer?: number;
    points: number;
  }>;
}
