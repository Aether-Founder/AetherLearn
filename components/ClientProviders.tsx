'use client';

import { useEffect } from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ColorThemeProvider } from '@/components/ColorThemeProvider';
import { SupabaseProvider } from '@/components/providers/SupabaseProvider';
import { I18nProvider } from '@/components/I18nProvider';
import { SyncManager } from '@/lib/offline/sync';
import { Toaster } from 'sonner';
import { ThemeSelectionModal } from '@/components/ThemeSelectionModal';

// Force client-side rendering
export const dynamic = 'force-dynamic';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    SyncManager.init();
  }, []);

  return (
    <SupabaseProvider>
      <ColorThemeProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <I18nProvider>
            {children}
            <ThemeSelectionModal />
            <Toaster richColors position="bottom-right" />
          </I18nProvider>
        </ThemeProvider>
      </ColorThemeProvider>
    </SupabaseProvider>
  );
}
