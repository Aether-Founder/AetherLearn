'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Theme, getThemeById, getDefaultTheme } from '@/lib/themes';

interface ColorThemeContextType {
  selectedTheme: Theme;
  setSelectedTheme: (theme: Theme) => void;
  supportsModeSwitching: boolean;
}

const ColorThemeContext = createContext<ColorThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'aether-selected-theme';

export function ColorThemeProvider({ children }: { children: ReactNode }) {
  const [selectedTheme, setSelectedThemeState] = useState<Theme>(getDefaultTheme());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load saved theme from localStorage
    const savedThemeId = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedThemeId) {
      const theme = getThemeById(savedThemeId);
      if (theme) {
        setSelectedThemeState(theme);
      }
    }
  }, []);

  const setSelectedTheme = (theme: Theme) => {
    setSelectedThemeState(theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme.id);
    // Also store theme colors for immediate application on page load
    localStorage.setItem('aether-theme-colors', JSON.stringify(theme.colors));
  };

  // Apply CSS variables based on selected theme
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    const colors = selectedTheme.colors;

    // Function to determine if text should be white or black based on background luminance
    const getContrastColor = (backgroundColor: string): string => {
      let lightness: number;
      
      // Parse OKLCH color to get lightness (L) value
      // OKLCH format: oklch(L C H)
      const oklchMatch = backgroundColor.match(/oklch\(([\d.]+)\)/);
      if (oklchMatch) {
        lightness = parseFloat(oklchMatch[1]);
      } 
      // Parse hex color to calculate luminance
      else if (backgroundColor.startsWith('#')) {
        const hex = backgroundColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        // Calculate luminance using standard formula
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
        // Convert to 0-1 range (similar to OKLCH)
        lightness = luminance / 255;
      } else {
        // Fallback to dark (use white text)
        lightness = 0;
      }
      
      // If lightness > 0.5, background is light, use black text
      // If lightness <= 0.5, background is dark, use white text
      return lightness > 0.5 ? 'oklch(0.176 0.031 265)' : 'oklch(0.981 0.003 247)';
    };

    // Function to determine primary-foreground color (always white for selected buttons)
    const getPrimaryForeground = (backgroundColor: string): string => {
      let lightness: number;
      
      // Parse OKLCH color to get lightness (L) value
      const oklchMatch = backgroundColor.match(/oklch\(([\d.]+)\)/);
      if (oklchMatch) {
        lightness = parseFloat(oklchMatch[1]);
      } 
      // Parse hex color to calculate luminance
      else if (backgroundColor.startsWith('#')) {
        const hex = backgroundColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
        lightness = luminance / 255;
      } else {
        // Fallback to light (use black text)
        lightness = 1;
      }
      
      // Primary foreground should always be white for selected buttons on dark backgrounds
      // and black for light backgrounds
      return lightness > 0.5 ? 'oklch(0.176 0.031 265)' : 'oklch(0.981 0.003 247)';
    };

    // For Aether theme (supports mode switching), we don't override the existing CSS variables
    // They will be controlled by the existing dark/light mode system
    if (selectedTheme.supportsModeSwitching) {
      // Clear theme-specific variables to let the default system take over
      root.style.removeProperty('--theme-background');
      root.style.removeProperty('--theme-main');
      root.style.removeProperty('--theme-text');
      root.style.removeProperty('--theme-shade-primary');
      root.style.removeProperty('--theme-shade-secondary');
      root.style.removeProperty('--primary-foreground');
      // Remove data-theme attribute
      root.removeAttribute('data-theme');
    } else {
      // Map MonkeyType colors to our CSS variables
      root.style.setProperty('--theme-background', colors.background);
      root.style.setProperty('--theme-main', colors.main);
      
      // Automatically set text color based on background luminance
      const textColor = getContrastColor(colors.background);
      root.style.setProperty('--theme-text', textColor);
      
      // Set primary-foreground based on primary color luminance (for selected buttons)
      const primaryForeground = getPrimaryForeground(colors.main);
      root.style.setProperty('--primary-foreground', primaryForeground);
      
      root.style.setProperty('--theme-shade-primary', colors.shadePrimary);
      root.style.setProperty('--theme-shade-secondary', colors.shadeSecondary);
      // Set data-theme attribute to activate custom theme CSS
      root.setAttribute('data-theme', 'custom');
    }
  }, [selectedTheme, mounted]);

  if (!mounted) {
    return null;
  }

  return (
    <ColorThemeContext.Provider
      value={{
        selectedTheme,
        setSelectedTheme,
        supportsModeSwitching: selectedTheme.supportsModeSwitching,
      }}
    >
      {children}
    </ColorThemeContext.Provider>
  );
}

export function useColorTheme() {
  const context = useContext(ColorThemeContext);
  if (context === undefined) {
    throw new Error('useColorTheme must be used within a ColorThemeProvider');
  }
  return context;
}
