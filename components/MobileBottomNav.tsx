'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Calendar, BookOpen, BarChart3, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/useTranslation';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const navItems = [
    { href: '/', icon: Home, label: t('nav_home') },
    { href: '/calendar', icon: Calendar, label: t('nav_calendar') },
    { href: '/study', icon: BookOpen, label: t('nav_study') },
    { href: '/analytics', icon: BarChart3, label: t('nav_analytics') },
    { href: '/profile', icon: User, label: t('nav_profile') },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-lg border-t border-border md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 min-w-[60px]',
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              )}
            >
              <Icon className={cn('h-5 w-5 transition-transform', isActive && 'scale-110')} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
      {/* Safe area for iPhone home indicator */}
      <div className="h-[env(safe-area-inset-bottom)] bg-background" />
    </nav>
  );
}
