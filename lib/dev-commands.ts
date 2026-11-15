'use client';

import { supabase } from '@/lib/supabase/client';
import { STORAGE_KEY } from '@/lib/i18n-config';

/**
 * Dev console helpers, exposed as window.aether and announced on launch.
 *
 *   aether.setLanguage('en')   – force English
 *   aether.setLanguage('nl')   – force Dutch
 *   aether.setLanguage('auto') – location-based (NL/BE → nl, else en)
 *   aether.wipeAccount()       – delete all data for the logged-in account
 *                                (Supabase rows + localStorage + IndexedDB),
 *                                then reload → fresh-account onboarding
 */

const WIPE_TABLES = [
  'subject_grades',
  'subject_tests',
  'mastery_tracking',
  'subject_topics',
  'subject_chapters',
  'subjects',
  'flashcards',
  'study_sessions',
  'card_reviews',
  'study_sets',
  'daily_quiz_questions',
  'daily_quiz_sessions',
  'active_recall_questions',
  'spaced_repetition_items',
  'error_logs',
  'error_log',
  'tasks',
  'calendar_events',
  'planner_subtasks',
  'recurring_events',
  'test_week_subjects',
  'test_weeks',
  'bookmarks',
  'reading_progress',
  'achievements',
  'analytics_events',
  'ai_usage',
  'deck_ratings',
  'secret_subject_access',
  'workspace_items',
  'notion_entries',
  'notion_property_values',
  'inbox',
  'artisan_queue',
  'user_settings',
  'embeddings',
];

declare global {
  interface Window {
    aether?: {
      setLanguage: (lang: 'en' | 'nl' | 'auto') => void;
      wipeAccount: () => Promise<void>;
    };
  }
}

function setLanguage(lang: 'en' | 'nl' | 'auto') {
  if (lang === 'auto') {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, lang);
  }
  location.reload();
}

async function wipeAccount() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.warn('[aether] wipeAccount: no signed-in user — only local data will be cleared.');
  } else {
    let ok = 0;
    let failed = 0;
    for (const table of WIPE_TABLES) {
      const { error } = await (supabase.from as (t: string) => ReturnType<typeof supabase.from>)(table)
        .delete()
        .eq('user_id', user.id);
      if (error) failed++;
      else ok++;
    }
    console.log(`[aether] wipeAccount: cleared ${ok} tables (${failed} skipped/failed).`);

    // Reset profile-level onboarding selections (kept on the users row)
    const fromAny = supabase.from as unknown as (t: string) => any;
    await fromAny('users')
      .update({ selected_subjects: null, country_code: null, educational_level: null })
      .eq('id', user.id);
  }

  // Local storage: remove everything except the Supabase auth token (sb-*)
  const keys = Object.keys(localStorage);
  for (const key of keys) {
    if (!key.startsWith('sb-')) localStorage.removeItem(key);
  }

  // IndexedDB offline store
  try {
    await new Promise<void>((resolve) => {
      const req = indexedDB.deleteDatabase('AetherLearnDB');
      req.onsuccess = req.onerror = req.onblocked = () => resolve();
    });
  } catch {
    /* ignore */
  }

  console.log('[aether] wipeAccount: done — reloading as a fresh account.');
  location.reload();
}

let registered = false;

export function registerDevCommands() {
  if (registered || typeof window === 'undefined') return;
  registered = true;

  window.aether = { setLanguage, wipeAccount };

  console.log(
    '%c[AetherLearn] console commands%c\n' +
      '  aether.setLanguage(\'en\')    force English\n' +
      '  aether.setLanguage(\'nl\')    force Dutch\n' +
      '  aether.setLanguage(\'auto\')  language by location (NL/BE → Dutch, else English)\n' +
      '  aether.wipeAccount()         delete ALL account data + local storage → fresh start',
    'color:#7c3aed;font-weight:bold',
    'color:inherit'
  );
}
