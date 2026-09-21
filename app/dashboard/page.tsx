'use client';

import { useEffect, useState } from 'react';
import MinimalDashboard from '@/components/dashboard/MinimalDashboard';
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import { Monitor, Layout } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const [view, setView] = useState<'full' | 'minimal'>('full');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedView = localStorage.getItem('aether_dashboard_view') as 'full' | 'minimal' | null;
    if (savedView === 'full' || savedView === 'minimal') {
      setView(savedView);
    }
  }, []);

  const toggleView = () => {
    const newView = view === 'full' ? 'minimal' : 'full';
    setView(newView);
    localStorage.setItem('aether_dashboard_view', newView);
  };

  if (!mounted) {
    return null;
  }

  if (view === 'minimal') {
    return (
      <div className="relative">
        <button
          onClick={toggleView}
          className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
          title="Wissel naar volledig dashboard"
        >
          <Layout className="h-5 w-5 text-muted-foreground" />
        </button>
        <MinimalDashboard />
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={toggleView}
        className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
        title="Wissel naar minimaal dashboard"
      >
        <Monitor className="h-5 w-5 text-muted-foreground" />
      </button>
      <DashboardOverview />
    </div>
  );
}
