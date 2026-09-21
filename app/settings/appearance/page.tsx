'use client';

import { useState } from 'react';
import { Palette, Check, Search, User, Layout, BarChart3, Shield, Sparkles, Accessibility } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useColorTheme } from '@/components/ColorThemeProvider';
import { allThemes } from '@/lib/themes';
import { useTranslation } from '@/lib/useTranslation';
import Link from 'next/link';

export default function AppearanceSettingsPage() {
  const { t } = useTranslation();
  const { selectedTheme, setSelectedTheme, supportsModeSwitching } = useColorTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredThemes = allThemes.filter((theme) =>
    theme.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="mt-10 flex gap-8 max-w-7xl mx-auto px-4">
        <aside className="w-56 shrink-0 sticky top-10">
          <nav className="space-y-1">
            <Link href="/instellingen">
              <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors text-muted-foreground hover:bg-secondary hover:text-foreground">
                <User className="h-4 w-4" />
                Profiel
              </button>
            </Link>
            <Link href="/instellingen">
              <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors bg-primary text-primary-foreground">
                <Palette className="h-4 w-4" />
                Uiterlijk
              </button>
            </Link>
            <Link href="/instellingen">
              <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors text-muted-foreground hover:bg-secondary hover:text-foreground">
                <Layout className="h-4 w-4" />
                Navigatie
              </button>
            </Link>
            <Link href="/instellingen">
              <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors text-muted-foreground hover:bg-secondary hover:text-foreground">
                <BarChart3 className="h-4 w-4" />
                Statistieken
              </button>
            </Link>
            <Link href="/instellingen">
              <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors text-muted-foreground hover:bg-secondary hover:text-foreground">
                <Shield className="h-4 w-4" />
                Account
              </button>
            </Link>
            <Link href="/instellingen">
              <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors text-muted-foreground hover:bg-secondary hover:text-foreground">
                <Sparkles className="h-4 w-4" />
                AI
              </button>
            </Link>
            <Link href="/instellingen">
              <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors text-muted-foreground hover:bg-secondary hover:text-foreground">
                <Accessibility className="h-4 w-4" />
                Toegankelijkheid
              </button>
            </Link>
          </nav>
        </aside>

        <main className="flex-1">
          <div className="mb-8">
            <h1 className="text-3xl font-display font-semibold text-foreground">Thema</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Kies je kleurenpalet voor de hele applicatie
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Kies een thema</CardTitle>
              <CardDescription>
                {supportsModeSwitching
                  ? 'Aether thema ondersteunt donker/licht modus. Andere thema\'s hebben een vaste modus.'
                  : 'Het geselecteerde thema heeft een vaste modus, donker/licht schakelaar is uitgeschakeld.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Zoek thema op naam..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {filteredThemes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme)}
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
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
