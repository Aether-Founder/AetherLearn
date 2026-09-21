'use client';

import { useState, useEffect } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useColorTheme } from '@/components/ColorThemeProvider';
import { allThemes } from '@/lib/themes';

const THEME_SELECTION_COMPLETED_KEY = 'aether-theme-selection-completed';
const THEME_SELECTION_SKIPPED_KEY = 'aether-theme-selection-skipped';

export function ThemeSelectionModal() {
  const { selectedTheme, setSelectedTheme } = useColorTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [neverShowAgain, setNeverShowAgain] = useState(false);

  useEffect(() => {
    // Check if user has already completed theme selection
    const completed = localStorage.getItem(THEME_SELECTION_COMPLETED_KEY);
    const skipped = localStorage.getItem(THEME_SELECTION_SKIPPED_KEY);
    
    // Only show if neither completed nor explicitly skipped
    if (!completed && !skipped) {
      setIsOpen(true);
    }
  }, []);

  const filteredThemes = allThemes.filter((theme) =>
    theme.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleThemeSelect = (theme: any) => {
    setSelectedTheme(theme);
  };

  const handleContinue = () => {
    localStorage.setItem(THEME_SELECTION_COMPLETED_KEY, 'true');
    setIsOpen(false);
  };

  const handleSkip = () => {
    if (neverShowAgain) {
      localStorage.setItem(THEME_SELECTION_SKIPPED_KEY, 'true');
    }
    setIsOpen(false);
  };

  const handleClose = () => {
    // Just close the dialog without marking as skipped
    // It will appear again on next visit
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <DialogTitle className="text-2xl">Kies je thema</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            Personaliseer je AetherLearn ervaring door een kleurenpalet te kiezen die bij jou past.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4 border-b border-border flex-shrink-0">
          <input
            type="text"
            placeholder="Zoek thema op naam..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-hide">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {filteredThemes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleThemeSelect(theme)}
                className="group relative flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all hover:border-primary/50 hover:bg-secondary/30"
                style={{
                  borderColor:
                    selectedTheme.id === theme.id ? 'var(--primary)' : 'var(--border)',
                  backgroundColor: selectedTheme.id === theme.id ? 'var(--secondary)' : undefined,
                }}
              >
                {selectedTheme.id === theme.id && (
                  <div className="absolute right-2 top-2">
                    <Check className="h-4 w-4" style={{ color: 'var(--primary)' }} />
                  </div>
                )}
                {theme.isDefault && (
                  <div className="absolute left-2 top-2 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                    Default
                  </div>
                )}
                <div
                  className="h-20 w-full rounded-md overflow-hidden"
                  style={{
                    backgroundColor: theme.colors.background,
                    border: `1px solid ${theme.colors.shadePrimary}`,
                  }}
                >
                  <div className="flex h-full flex-col">
                    <div
                      className="h-8 w-full flex items-center px-2 gap-1"
                      style={{ backgroundColor: theme.colors.main }}
                    >
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.colors.text }} />
                      <div className="w-8 h-2 rounded-full" style={{ backgroundColor: theme.colors.text, opacity: 0.7 }} />
                    </div>
                    <div className="flex-1 p-2 flex flex-col gap-1">
                      <div className="w-full h-2 rounded" style={{ backgroundColor: theme.colors.shadeSecondary }} />
                      <div className="w-3/4 h-2 rounded" style={{ backgroundColor: theme.colors.shadeSecondary, opacity: 0.6 }} />
                      <div className="w-1/2 h-2 rounded" style={{ backgroundColor: theme.colors.shadeSecondary, opacity: 0.4 }} />
                    </div>
                  </div>
                </div>
                <span className="text-center text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                  {theme.name}
                </span>
                {!theme.supportsModeSwitching && (
                  <span className="text-[10px] text-muted-foreground">
                    {theme.colors.background === '#ffffff' ||
                    theme.colors.background.startsWith('#f') ||
                    theme.colors.background.startsWith('#e')
                      ? 'Light'
                      : 'Dark'}
                  </span>
                )}
              </button>
            ))}
            {filteredThemes.length === 0 && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                Geen thema's gevonden met "{searchQuery}"
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border bg-background flex-shrink-0">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={neverShowAgain}
                onChange={(e) => setNeverShowAgain(e.target.checked)}
                className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-primary"
              />
              <span className="text-sm text-muted-foreground">Niet meer tonen</span>
            </label>
            <div className="flex gap-2">
              <button
                onClick={handleSkip}
                className="px-4 py-2 rounded-lg border border-border text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                Later kiezen
              </button>
              <button
                onClick={handleContinue}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Doorgaan
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}