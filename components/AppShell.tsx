'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  ChevronDown,
  Search,
  Settings,
  User,
  Moon,
  Sun,
  Plus,
  FileText,
  FilePlus2,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useUser, useUserProfile } from '@/hooks/useAuth';
import { useTranslation } from '@/lib/useTranslation';
import { useTheme } from 'next-themes';
import { useNavbarPreferences, type NavPage } from '@/hooks/useNavbarPreferences';
import { MobileNavigation } from './MobileNavigation';
import { MobileBottomNav } from './MobileBottomNav';
import { useColorTheme } from './ColorThemeProvider';

export function SearchField({
  value,
  onChange,
  placeholder,
  className = '',
  showMoreResults = false,
}: {
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  className?: string;
  showMoreResults?: boolean;
}) {
  const { t } = useTranslation();
  const [inner, setInner] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const val = value ?? inner;

  if (!mounted) {
    return (
      <div className={'relative ' + className}>
        <div className="h-9 w-full rounded-md border border-input bg-background px-3" />
      </div>
    );
  }

  return (
    <div className={'relative ' + className}>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
      />
      <input
        value={val}
        onChange={(e) => (onChange ? onChange(e.target.value) : setInner(e.target.value))}
        placeholder={placeholder ?? t('search_placeholder_sets')}
        aria-label={t('search_aria')}
        className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-foreground/40"
      />
      {showMoreResults && val.length >= 2 && (
        <Link
          href="/search"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-primary hover:underline"
        >
          {t('shell_more_results')}
        </Link>
      )}
    </div>
  );
}

function useOutside<T extends HTMLElement>(onClose: () => void) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [onClose]);
  return ref;
}

function MoreMenu({ items }: { items: Array<{ href: string; label: string }> }) {
  const [mounted, setMounted] = useState(false);
  const ref = useOutside<HTMLDivElement>(() => {});
  const pathname = usePathname();
  const { t } = useTranslation();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || items.length === 0) {
    return null;
  }

  return (
    <div className="relative group" ref={ref}>
      <button
        type="button"
        className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        aria-label={t('nav_more')}
      >
        {t('nav_more')}
        <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      <div className="absolute left-0 top-full z-40 mt-2 w-52 rounded-md border border-border bg-background p-1 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        {items.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className={`block rounded-[6px] px-3 py-2 text-xs transition-colors hover:bg-secondary hover:text-foreground ${
              pathname === m.href ? 'text-foreground' : 'text-muted-foreground'
            }`}
          >
            {m.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function BijhoudenMenu({ items }: { items: Array<{ href: string; label: string }> }) {
  const [mounted, setMounted] = useState(false);
  const ref = useOutside<HTMLDivElement>(() => {});
  const pathname = usePathname();
  const { t } = useTranslation();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || items.length === 0) {
    return null;
  }

  return (
    <div className="relative group" ref={ref}>
      <button
        type="button"
        className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        {t('shell_nav_track')}
        <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      <div className="absolute left-0 top-full z-40 mt-2 w-48 rounded-md border border-border bg-background p-1 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        {items.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className={`block rounded-[6px] px-3 py-2 text-xs transition-colors hover:bg-secondary hover:text-foreground ${
              pathname === m.href ? 'text-foreground' : 'text-muted-foreground'
            }`}
          >
            {m.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function QuickCreateMenu() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ref = useOutside<HTMLDivElement>(() => setOpen(false));
  const { t } = useTranslation();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="relative ml-2" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-secondary text-primary hover:bg-secondary/80 transition-colors"
        aria-label={t('shell_quick_create')}
      >
        <Plus className="h-5 w-5" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-48 rounded-md border border-border bg-background p-1 shadow-xl">
          <Link
            href="/create/learning-list"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-[6px] px-3 py-2 text-xs transition-colors hover:bg-secondary hover:text-foreground text-muted-foreground"
          >
            <FilePlus2 className="h-4 w-4" />+ {t('shell_add_learning_list')}
          </Link>
          <button
            type="button"
            onClick={async () => {
              const {
                data: { user },
              } = await (await import('@/lib/supabase/client')).supabase.auth.getUser();
              if (user) {
                const { useWorkspaceStore } = await import('@/store/useWorkspaceStore');
                const workspace = useWorkspaceStore.getState();
                const newId = workspace.createItemOptimistic({
                  user_id: user.id,
                  name: t('canvas_new_note'),
                  type: 'page',
                  parent_id: null,
                  content: '',
                  order_index: 0,
                  workspace_id: workspace.currentWorkspaceId,
                });
                workspace.setSelectedId(newId);
              }
              setOpen(false);
              window.location.href = '/notes';
            }}
            className="flex items-center gap-2 rounded-[6px] px-3 py-2 text-xs transition-colors hover:bg-secondary hover:text-foreground text-muted-foreground w-full text-left"
          >
            <FileText className="h-4 w-4" />
            {t('shell_create_note')}
          </button>
        </div>
      )}
    </div>
  );
}

function UserMenu() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ref = useOutside<HTMLDivElement>(() => setOpen(false));
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { supportsModeSwitching } = useColorTheme();
  const pathname = usePathname();
  const { user } = useUser();
  const { profile } = useUserProfile();

  useEffect(() => {
    setMounted(true);
  }, []);

  const getInitials = () => {
    const name = profile?.full_name || profile?.username || user?.email || 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!mounted) {
    return <div className="h-9 w-9 rounded-full border border-border bg-muted" />;
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="grid h-9 w-9 place-items-center rounded-full border border-border text-sm font-medium transition-colors hover:border-foreground/40 overflow-hidden"
        title={t('shell_profile_menu')}
      >
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
        ) : (
          <span>{getInitials()}</span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-48 rounded-md border border-border bg-background p-1 shadow-xl">
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-xs transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Settings className="h-3.5 w-3.5" />
            {t('nav_settings')}
          </Link>
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-xs transition-colors hover:bg-secondary hover:text-foreground"
          >
            <User className="h-3.5 w-3.5" />
            {t('shell_edit_profile')}
          </Link>
          {supportsModeSwitching && (
            <button
              type="button"
              onClick={() => {
                setTheme(theme === 'dark' ? 'light' : 'dark');
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs transition-colors hover:bg-secondary hover:text-foreground"
            >
              {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              {theme === 'dark' ? t('light_mode') : t('dark_mode')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function AppShell({
  children,
  search,
  onSearch,
  hideFooter = false,
}: {
  children: ReactNode;
  search?: string;
  onSearch?: (value: string) => void;
  hideFooter?: boolean;
}) {
  const pathname = usePathname();
  const { user } = useUser();
  const { profile } = useUserProfile();
  const { t } = useTranslation();
  const { visibility, PAGE_LABELS, PAGE_HREFS, getVisiblePages } = useNavbarPreferences();
  const [mounted, setMounted] = useState(false);
  const [overflowItems, setOverflowItems] = useState<Array<{ href: string; label: string }>>([]);
  const navRef = useRef<HTMLDivElement>(null);
  const [navWidth, setNavWidth] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const visiblePages = getVisiblePages();
  const allNav = useMemo(
    () =>
      visiblePages.map((page) => ({
        href: PAGE_HREFS[page],
        label: PAGE_LABELS[page],
      })),
    [visiblePages, PAGE_HREFS, PAGE_LABELS]
  );

  const hiddenNav = useMemo(
    () =>
      Object.entries(visibility)
        .filter(([key, visible]) => !visible)
        .map(([key]) => ({
          href: PAGE_HREFS[key as NavPage],
          label: PAGE_LABELS[key as NavPage],
        })),
    [visibility, PAGE_HREFS, PAGE_LABELS]
  );

  // Disable overflow calculation to show all visible items as buttons
  useEffect(() => {
    setOverflowItems([]);
  }, [mounted]);

  const displayName =
    profile?.full_name ||
    profile?.username ||
    user?.user_metadata?.full_name ||
    user?.email ||
    'Aether';

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
          <div className="flex h-16 justify-center px-6">
            <div className="flex h-full max-w-[1920px] w-full items-center gap-3">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-md bg-muted" />
                <div className="h-8 w-24 rounded-md bg-muted" />
              </div>
              <div className="ml-auto h-9 w-48 rounded-md bg-muted" />
            </div>
          </div>
        </header>
        <main className="flex-1 w-full px-6 pb-24">
          {children}
        </main>
      </div>
    );
  }

  // Filter out dashboard ('/') from top navbar as requested
  const visibleNav = allNav.filter((item) => !overflowItems.some((oi) => oi.href === item.href) && item.href !== '/');

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <style jsx global>{`
        .mask-linear-fade {
          mask-image: linear-gradient(to right, black 90%, transparent 100%);
          -webkit-mask-image: linear-gradient(to right, black 90%, transparent 100%);
        }
        ::-webkit-scrollbar {
          display: none;
        }
        * {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
      `}</style>
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="flex h-16 justify-center px-6">
          <div className="flex h-full max-w-[1920px] w-full items-center justify-center gap-3">
            <div className="flex items-center gap-2.5">
              <MobileNavigation />
              <Link href="/" className="flex items-center gap-1">
                <Image
                  src="/assets/favicon.png"
                  alt={t('logo_alt')}
                  width={64}
                  height={64}
                  className="h-4 w-4 rounded-md object-contain"
                  unoptimized
                />
                <div className="hidden sm:block flex flex-col">
                  <span className="font-display text-2xl font-semibold tracking-tight leading-none">
                    {t('brand')}
                  </span>
                  <span className="font-display text-sm font-medium tracking-tight leading-none" style={{ paddingTop: '8px' }}>
                    Learn
                  </span>
                </div>
              </Link>
            </div>

            <nav ref={navRef} className="hidden items-center gap-0.5 lg:flex">
              <div className="flex items-center gap-0.5">
                {visibleNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative px-3 py-2 text-sm font-medium transition-colors hover:text-foreground ${
                      isActive(item.href) ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="group">
                  <BijhoudenMenu
                    items={[
                      { href: PAGE_HREFS.inbox, label: PAGE_LABELS.inbox },
                      { href: PAGE_HREFS.foutenlogboek, label: PAGE_LABELS.foutenlogboek },
                      { href: PAGE_HREFS.planner, label: PAGE_LABELS.planner },
                      { href: PAGE_HREFS.books, label: PAGE_LABELS.books },
                    ]}
                  />
                </div>
                {overflowItems.length > 0 && <MoreMenu items={overflowItems} />}
              </div>
              <QuickCreateMenu />
            </nav>

            <div className="flex items-center gap-3">
              <SearchField
                {...(search !== undefined ? { value: search } : {})}
                {...(onSearch ? { onChange: onSearch } : {})}
                className="hidden w-52 xl:block"
                showMoreResults={true}
              />
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      <main
        className="flex-1 w-full px-6 pb-20 md:pb-24"
      >
        {children}
      </main>

      <MobileBottomNav />

      {!hideFooter && (
        <footer className="border-t border-border hidden md:block">
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-8 text-xs text-muted-foreground w-full max-w-[1920px] mx-auto">
            <Link href="/" className="flex items-center gap-1">
              <Image
                src="/assets/favicon.png"
                alt=""
                width={64}
                height={64}
                className="h-4 w-4 rounded-md object-contain"
                aria-hidden="true"
              />
              <div className="hidden sm:block flex flex-col">
                <span className="font-display text-2xl font-semibold tracking-tight leading-none">
                  {t('brand')}
                </span>
                <span className="font-display text-sm font-medium tracking-tight leading-none" style={{ paddingTop: '8px' }}>
                  Learn
                </span>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                {t('home_footer_terms')}
              </Link>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  actionPosition = 'right',
  compact = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  actionPosition?: 'left' | 'right';
  compact?: boolean;
}) {
  return (
    <section
      className={`flex flex-wrap items-center justify-start gap-6 ${
        compact ? 'pb-4' : 'border-b border-border py-10'
      }`}
    >
      {action && actionPosition === 'left' && <div className="flex-shrink-0">{action}</div>}
      <div className="text-left">
        {eyebrow && (
          <p className="text-[11px] tracking-[0.18em] text-muted-foreground">{eyebrow}</p>
        )}
        <h1
          className={`font-display font-semibold leading-[1.1] ${
            compact ? 'mt-1 text-2xl' : 'mt-3 text-4xl'
          }`}
        >
          {title}
        </h1>
        {description && (
          <p
            className={`text-sm leading-relaxed text-muted-foreground ${
              compact ? 'mt-1 line-clamp-1' : 'mt-3'
            }`}
          >
            {description}
          </p>
        )}
      </div>
      {action && actionPosition === 'right' && <div className="ml-auto">{action}</div>}
    </section>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4 border-b border-border pb-3">
      <h2 className="font-display text-2xl font-semibold">{children}</h2>
      {action}
    </div>
  );
}

export function Meter({ value }: { value: number }) {
  return (
    <div className="h-[3px] w-full overflow-hidden rounded-full bg-secondary">
      <div
        className="h-full rounded-full bg-foreground/70 transition-all"
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  );
}
