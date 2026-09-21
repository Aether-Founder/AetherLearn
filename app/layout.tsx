import { Inter, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import { ClientProviders } from '@/components/ClientProviders';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { InstallPrompt } from '@/components/InstallPrompt';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
});

const cormorant = Cormorant_Garamond({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
  fallback: ['Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
});

export const metadata = {
  title: 'AetherLearn',
  description: 'Leer slimmer met flashcards, spaced repetition en AI-ondersteuning',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/aetherlearn/favicon.png',
    apple: '/icons/aetherlearn/icon-192x192.png',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export const viewport = {
  themeColor: '#0f172a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icons/aetherlearn/favicon.png" />
        <link rel="apple-touch-icon" href="/icons/aetherlearn/icon-192x192.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('aether-selected-theme');
                  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  const isAetherTheme = !theme || theme === 'aether';
                  
                  if (isAetherTheme) {
                    const savedTheme = localStorage.getItem('theme') || systemTheme;
                    if (savedTheme === 'dark') {
                      document.documentElement.classList.add('dark');
                    }
                    // Clear any inline styles from custom themes
                    const root = document.documentElement;
                    root.style.removeProperty('--theme-background');
                    root.style.removeProperty('--theme-main');
                    root.style.removeProperty('--theme-text');
                    root.style.removeProperty('--theme-shade-primary');
                    root.style.removeProperty('--theme-shade-secondary');
                    root.style.removeProperty('--primary-foreground');
                  } else {
                    // Custom theme - set data-theme attribute and apply colors
                    document.documentElement.setAttribute('data-theme', 'custom');
                    
                    // Apply custom theme colors immediately
                    const themeColors = localStorage.getItem('aether-theme-colors');
                    if (themeColors) {
                      const colors = JSON.parse(themeColors);
                      const root = document.documentElement;
                      root.style.setProperty('--theme-background', colors.background);
                      root.style.setProperty('--theme-main', colors.main);
                      root.style.setProperty('--theme-text', colors.text);
                      root.style.setProperty('--theme-shade-primary', colors.shadePrimary);
                      root.style.setProperty('--theme-shade-secondary', colors.shadeSecondary);
                      
                      // Calculate and set text color based on background luminance
                      const bgColor = colors.background;
                      let textLightness;
                      
                      if (bgColor.startsWith('oklch')) {
                        const bgMatch = bgColor.match(/oklch\(([\d.]+)\)/);
                        if (bgMatch) {
                          textLightness = parseFloat(bgMatch[1]);
                        } else {
                          textLightness = 0.5;
                        }
                      } else if (bgColor.startsWith('#')) {
                        const hex = bgColor.replace('#', '');
                        const r = parseInt(hex.substr(0, 2), 16);
                        const g = parseInt(hex.substr(2, 2), 16);
                        const b = parseInt(hex.substr(4, 2), 16);
                        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
                        textLightness = luminance / 255;
                      } else {
                        textLightness = 0.5;
                      }
                      
                      const textColor = textLightness > 0.5 ? 'oklch(0.176 0.031 265)' : 'oklch(0.981 0.003 247)';
                      root.style.setProperty('--theme-text', textColor);
                      
                      // Calculate and set primary-foreground based on main color luminance
                      const mainColor = colors.main;
                      let mainLightness;
                      
                      if (mainColor.startsWith('oklch')) {
                        const mainMatch = mainColor.match(/oklch\(([\d.]+)\)/);
                        if (mainMatch) {
                          mainLightness = parseFloat(mainMatch[1]);
                        } else {
                          mainLightness = 0.5;
                        }
                      } else if (mainColor.startsWith('#')) {
                        const hex = mainColor.replace('#', '');
                        const r = parseInt(hex.substr(0, 2), 16);
                        const g = parseInt(hex.substr(2, 2), 16);
                        const b = parseInt(hex.substr(4, 2), 16);
                        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
                        mainLightness = luminance / 255;
                      } else {
                        mainLightness = 0.5;
                      }
                      
                      const primaryForeground = mainLightness > 0.5 ? 'oklch(0.176 0.031 265)' : 'oklch(0.981 0.003 247)';
                      root.style.setProperty('--primary-foreground', primaryForeground);
                    }
                  }
                } catch (e) {
                  // Theme initialization error - silently ignore
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} ${cormorant.variable} font-sans`}>
        <ClientProviders>
          <OfflineIndicator />
          {children}
          <InstallPrompt />
        </ClientProviders>
      </body>
    </html>
  );
}
