'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Home, Calendar, BookOpen, BarChart3, User, Settings, FileText } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/useTranslation';

export function MobileNavigation() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useTranslation();

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/study-sets', icon: BookOpen, label: t('dashboard_study_sets') },
    { href: '/calendar', icon: Calendar, label: t('calendar_title') },
    { href: '/agenda', icon: Calendar, label: 'Agenda' },
    { href: '/study', icon: BookOpen, label: t('shell_nav_study') },
    { href: '/analytics', icon: BarChart3, label: 'Analytics' },
    { href: '/statistics', icon: BarChart3, label: t('nav_statistics') },
    { href: '/profile', icon: User, label: t('profile_title') },
    { href: '/settings', icon: Settings, label: t('nav_settings') },
    { href: '/subjects', icon: BookOpen, label: t('nav_subjects') },
    { href: '/notes', icon: FileText, label: t('nav_notes') },
  ];

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80">
          <nav className="flex flex-col gap-4 mt-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
