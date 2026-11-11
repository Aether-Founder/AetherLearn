'use client';

import { LANGUAGE_REGISTRY } from '@/lib/i18n-config';
import { type Language } from '@/lib/i18n-config';

interface LanguageSelectionProps {
  selectedLanguage: Language;
  onLanguageChange: (language: Language) => void;
  showAll?: boolean;
  className?: string;
}

/**
 * Language selection component for onboarding.
 * Shows a grid of language options with native names.
 *
 * Usage:
 * ```tsx
 * <LanguageSelection
 *   selectedLanguage={language}
 *   onLanguageChange={setLanguage}
 *   showAll={false} // Only show Tier 1 languages
 * />
 * ```
 */
export function LanguageSelection({
  selectedLanguage,
  onLanguageChange,
  showAll = false,
  className = '',
}: LanguageSelectionProps) {
  // Tier 1 languages (complete coverage, most common)
  const tier1Languages: Language[] = ['nl', 'en', 'es', 'fr', 'de', 'pt'];

  // Tier 2 languages (core features)
  const tier2Languages: Language[] = ['ru', 'zh', 'ja', 'ko', 'it', 'ar'];

  // Tier 3 languages (UI only)
  const tier3Languages: Language[] = ['hi', 'tr', 'id', 'vi', 'th', 'pl', 'uk'];

  const languagesToShow = showAll
    ? LANGUAGE_REGISTRY
    : LANGUAGE_REGISTRY.filter(lang => tier1Languages.includes(lang.code as Language));

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {languagesToShow.map((lang) => (
          <button
            key={lang.code}
            type="button"
            onClick={() => onLanguageChange(lang.code as Language)}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              selectedLanguage === lang.code
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50 hover:bg-secondary/30'
            }`}
          >
            <span className="text-base font-medium">{lang.nativeName}</span>
            {selectedLanguage === lang.code && (
              <span className="ml-2 text-primary">✓</span>
            )}
          </button>
        ))}
      </div>

      {!showAll && (
        <button
          type="button"
          onClick={() => {/* TODO: Show all languages */}}
          className="text-sm text-muted-foreground hover:text-foreground underline"
        >
          Show all languages
        </button>
      )}
    </div>
  );
}
