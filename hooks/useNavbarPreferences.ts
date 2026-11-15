/**
 * Hook for managing navbar visibility preferences
 */

'use client';

import { useEffect, useState } from 'react';
import { useUser } from './useAuth';
import { useTranslation } from '@/lib/useTranslation';

export type NavPage =
  | 'dashboard'
  | 'subjects'
  | 'decks'
  | 'notes'
  | 'groups'
  | 'agenda'
  | 'artisan'
  | 'inbox'
  | 'foutenlogboek'
  | 'planner'
  | 'settings'
  | 'vandaag'
  | 'admin'
  | 'research'
  | 'books';

export interface NavVisibility {
  [key: string]: boolean;
}

const DEFAULT_VISIBILITY: NavVisibility = {
  dashboard: false,
  subjects: true,
  decks: false,
  notes: true,
  groups: false,
  agenda: true,
  artisan: true,
  inbox: false,
  foutenlogboek: false,
  planner: false,
  settings: false,
  vandaag: false,
  admin: false,
  research: true,
  books: true,
};

const PAGE_LABEL_KEYS: Record<NavPage, string> = {
  dashboard: 'nav_overview',
  subjects: 'nav_subjects',
  decks: 'nav_decks',
  notes: 'nav_notes',
  groups: 'nav_groups',
  agenda: 'nav_agenda',
  artisan: 'nav_artisan',
  inbox: 'nav_inbox',
  foutenlogboek: 'nav_error_log',
  planner: 'nav_planner',
  settings: 'nav_settings',
  vandaag: 'nav_today',
  admin: 'nav_admin',
  research: 'nav_research',
  books: 'nav_books',
};

const PAGE_HREFS: Record<NavPage, string> = {
  dashboard: '/',
  subjects: '/subjects',
  decks: '/study-sets',
  notes: '/notes',
  groups: '/groups',
  agenda: '/agenda',
  artisan: '/artisan',
  inbox: '/inbox',
  foutenlogboek: '/error-log',
  planner: '/planner',
  settings: '/settings',
  vandaag: '/today',
  admin: '/admin',
  research: '/research',
  books: '/books',
};

export function useNavbarPreferences() {
  const { user } = useUser();
  const { t } = useTranslation();
  const [visibility, setVisibility] = useState<NavVisibility>(DEFAULT_VISIBILITY);
  const [loading, setLoading] = useState(true);

  const PAGE_LABELS: Record<NavPage, string> = Object.fromEntries(
    (Object.keys(PAGE_LABEL_KEYS) as NavPage[]).map((page) => [page, t(PAGE_LABEL_KEYS[page])])
  ) as Record<NavPage, string>;

  useEffect(() => {
    const loadPreferences = () => {
      const key = user ? `navbar-visibility:${user.id}` : 'navbar-visibility:guest';
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored);
          setVisibility({ ...DEFAULT_VISIBILITY, ...parsed });
        }
      } catch (error) {
        console.error('Failed to load navbar preferences:', error);
      }
      setLoading(false);
    };

    loadPreferences();
  }, [user]);

  const toggleVisibility = (page: NavPage) => {
    const newVisibility = { ...visibility, [page]: !visibility[page] };
    setVisibility(newVisibility);

    const key = user ? `navbar-visibility:${user.id}` : 'navbar-visibility:guest';
    try {
      localStorage.setItem(key, JSON.stringify(newVisibility));
    } catch (error) {
      console.error('Failed to save navbar preferences:', error);
    }
  };

  const resetToDefaults = () => {
    setVisibility(DEFAULT_VISIBILITY);
    const key = user ? `navbar-visibility:${user.id}` : 'navbar-visibility:guest';
    try {
      localStorage.setItem(key, JSON.stringify(DEFAULT_VISIBILITY));
    } catch (error) {
      console.error('Failed to reset navbar preferences:', error);
    }
  };

  const getVisiblePages = (): NavPage[] => {
    return Object.entries(visibility)
      .filter(([_, visible]) => visible)
      .map(([page]) => page as NavPage);
  };

  return {
    visibility,
    toggleVisibility,
    resetToDefaults,
    getVisiblePages,
    loading,
    PAGE_LABELS,
    PAGE_HREFS,
  };
}
