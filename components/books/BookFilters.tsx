'use client';

import { useState } from 'react';
import { BookFilterOptions } from '@/lib/books/types';
import { Search, Filter, X } from 'lucide-react';
import { useTranslation } from '@/lib/useTranslation';

interface BookFiltersProps {
  filters: BookFilterOptions;
  onFiltersChange: (filters: BookFilterOptions) => void;
  topics?: string[];
  collections?: string[];
}

export function BookFilters({
  filters,
  onFiltersChange,
  topics = [],
  collections = [],
}: BookFiltersProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: keyof BookFilterOptions, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className="space-y-3">
      {/* Search Bar and Filter Toggle on same line */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('books.search_placeholder')}
            value={filters.search || ''}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors border border-border rounded-lg bg-secondary"
        >
          <Filter className="w-4 h-4" />
          {t('books.filters')}
          {hasActiveFilters && (
            <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
              {Object.keys(filters).length}
            </span>
          )}
        </button>
      </div>

      {/* Expanded Filters - Horizontal grid */}
      {isExpanded && (
        <div className="flex flex-wrap gap-3 items-end">
          {/* Topic Filter */}
          {topics.length > 0 && (
            <div className="flex-1 min-w-[140px]">
              <label className="text-xs font-medium mb-1 block text-muted-foreground">{t('books.topic')}</label>
              <select
                value={filters.topic || ''}
                onChange={(e) => updateFilter('topic', e.target.value || undefined)}
                className="w-full px-3 py-2 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
              >
                <option value="">{t('books.all_topics')}</option>
                {topics.map((topic) => (
                  <option key={topic} value={topic}>
                    {t(`books.topics.${topic}`, topic.charAt(0).toUpperCase() + topic.slice(1))}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Collection Filter */}
          {collections.length > 0 && (
            <div className="flex-1 min-w-[140px]">
              <label className="text-xs font-medium mb-1 block text-muted-foreground">{t('books.collection')}</label>
              <select
                value={filters.collection || ''}
                onChange={(e) => updateFilter('collection', e.target.value || undefined)}
                className="w-full px-3 py-2 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
              >
                <option value="">{t('books.all_collections')}</option>
                {collections.map((collection) => (
                  <option key={collection} value={collection}>
                    {t(`books.collections.${collection}`, collection.charAt(0).toUpperCase() + collection.slice(1))}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Language Filter */}
          <div className="flex-1 min-w-[140px]">
            <label className="text-xs font-medium mb-1 block text-muted-foreground">{t('books.language')}</label>
            <select
              value={filters.language || ''}
              onChange={(e) => updateFilter('language', e.target.value || undefined)}
              className="w-full px-3 py-2 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
            >
              <option value="">{t('books.all_languages')}</option>
              <option value="en">English</option>
              <option value="nl">Dutch</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>

          {/* Format Filter */}
          <div className="flex-1 min-w-[140px]">
            <label className="text-xs font-medium mb-1 block text-muted-foreground">{t('books.format')}</label>
            <select
              value={filters.format || ''}
              onChange={(e) => updateFilter('format', e.target.value || undefined)}
              className="w-full px-3 py-2 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
            >
              <option value="">{t('books.all_formats')}</option>
              <option value="concise">{t('books.concise_only')}</option>
              <option value="detailed">{t('books.detailed_only')}</option>
            </select>
          </div>

          {/* Reading Time Filter */}
          <div className="flex-1 min-w-[140px]">
            <label className="text-xs font-medium mb-1 block text-muted-foreground">{t('books.reading_time')}</label>
            <select
              value={filters.readingTime || ''}
              onChange={(e) => updateFilter('readingTime', e.target.value || undefined)}
              className="w-full px-3 py-2 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
            >
              <option value="">{t('books.any_duration')}</option>
              <option value="short">{t('books.short')}</option>
              <option value="medium">{t('books.medium')}</option>
              <option value="long">{t('books.long')}</option>
            </select>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors border border-border rounded-lg bg-secondary"
            >
              <X className="w-4 h-4" />
              {t('books.clear_all_filters')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
