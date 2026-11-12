'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, X, BookOpen, FileText, Calendar, Tag } from 'lucide-react';
import { useTranslation } from '@/lib/useTranslation';

interface ContentSearchFilterProps {
  onSearch: (query: string) => void;
  onFilter: (filters: ContentFilters) => void;
  onReset: () => void;
}

export interface ContentFilters {
  type?: string;
  category?: string;
  dateRange?: string;
  tags?: string[];
}

export function ContentSearchFilter({ onSearch, onFilter, onReset }: ContentSearchFilterProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ContentFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const handleFilterChange = (key: keyof ContentFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const handleReset = () => {
    setSearchQuery('');
    setFilters({});
    onReset();
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined && v !== '');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Zoek en Filter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('shell_search_content')}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {Object.values(filters).filter((v) => v !== undefined && v !== '').length}
              </Badge>
            )}
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <X className="w-4 h-4 mr-2" />
              Reset
            </Button>
          )}
        </div>

        {showFilters && (
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Type
              </label>
              <Select
                value={filters.type || 'all'}
                onValueChange={(value) => handleFilterChange('type', value === 'all' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('shell_all_types')}</SelectItem>
                  <SelectItem value="studyset">{t('shell_study_sets')}</SelectItem>
                  <SelectItem value="homework">{t('shell_homework')}</SelectItem>
                  <SelectItem value="event">{t('shell_events')}</SelectItem>
                  <SelectItem value="note">{t('shell_notes')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Categorie
              </label>
              <Select
                value={filters.category || 'all'}
                onValueChange={(value) =>
                  handleFilterChange('category', value === 'all' ? '' : value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('shell_all_categories')}</SelectItem>
                  <SelectItem value="math">{t('shell_math')}</SelectItem>
                  <SelectItem value="physics">{t('shell_physics')}</SelectItem>
                  <SelectItem value="chemistry">{t('shell_chemistry')}</SelectItem>
                  <SelectItem value="biology">{t('shell_biology')}</SelectItem>
                  <SelectItem value="history">{t('shell_history')}</SelectItem>
                  <SelectItem value="language">{t('shell_languages')}</SelectItem>
                  <SelectItem value="other">{t('shell_other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Tijdperiode
              </label>
              <Select
                value={filters.dateRange || 'all'}
                onValueChange={(value) =>
                  handleFilterChange('dateRange', value === 'all' ? '' : value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('shell_all_times')}</SelectItem>
                  <SelectItem value="today">{t('shell_today')}</SelectItem>
                  <SelectItem value="week">{t('shell_this_week')}</SelectItem>
                  <SelectItem value="month">{t('shell_this_month')}</SelectItem>
                  <SelectItem value="year">{t('shell_this_year')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {['exam', 'practice', 'review', 'important', 'draft'].map((tag) => (
                  <Badge
                    key={tag}
                    variant={filters.tags?.includes(tag) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => {
                      const currentTags = filters.tags || [];
                      const newTags = currentTags.includes(tag)
                        ? currentTags.filter((t) => t !== tag)
                        : [...currentTags, tag];
                      handleFilterChange('tags', newTags.join(','));
                    }}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
