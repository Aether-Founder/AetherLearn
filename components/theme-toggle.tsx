'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useColorTheme } from '@/components/ColorThemeProvider';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { supportsModeSwitching } = useColorTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="p-1.5 rounded transition-colors">
        <div className="w-5 h-5" />
      </button>
    );
  }

  const isDisabled = !supportsModeSwitching;

  return (
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      disabled={isDisabled}
      className={`p-1.5 rounded transition-colors ${
        isDisabled
          ? 'opacity-50 cursor-not-allowed text-muted-foreground'
          : theme === 'light'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
      }`}
      aria-label={
        isDisabled
          ? 'Donker/licht modus is niet beschikbaar voor dit thema'
          : theme === 'light'
            ? 'Overschakelen naar donkere modus'
            : 'Overschakelen naar lichte modus'
      }
      title={
        isDisabled
          ? 'Donker/licht modus is niet beschikbaar voor dit thema'
          : theme === 'light'
            ? 'Overschakelen naar donkere modus'
            : 'Overschakelen naar lichte modus'
      }
    >
      {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
    </button>
  );
}
