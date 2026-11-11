'use client';

import { useEffect, useState, useRef } from 'react';
import {
  FileText,
  GraduationCap,
  BookOpen,
  Brain,
  Clock,
  FileCheck,
  ListTodo,
  HelpCircle,
} from 'lucide-react';
import { useTranslation } from '@/lib/useTranslation';
import { useAnalytics } from '@/lib/analytics';

export type ViewMode =
  | 'book'
  | 'study'
  | 'simple'
  | 'samenvatting'
  | 'quiz'
  | 'alles-leren-2-dagen'
  | 'complete-oefentoets'
  | 'alle-leerdoelen-opdrachten'
  | 'vragenlijst';

interface ModeSwitcherProps {
  currentMode: ViewMode;
  availableModes?: ViewMode[];
  onModeChange: (mode: ViewMode) => void;
}

export function ModeSwitcher({ currentMode, availableModes, onModeChange }: ModeSwitcherProps) {
  const { t } = useTranslation();
  const { track } = useAnalytics();
  const [mounted, setMounted] = useState(false);
  const [pillStyle, setPillStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Map<ViewMode, HTMLButtonElement>>(new Map());

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update pill position when mode changes
  useEffect(() => {
    if (!mounted || !containerRef.current) return;

    const button = buttonRefs.current.get(currentMode);
    if (!button) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();

    setPillStyle({
      left: buttonRect.left - containerRect.left,
      width: buttonRect.width,
      top: buttonRect.top - containerRect.top,
      height: buttonRect.height,
    });
  }, [currentMode, mounted]);

  // Recalculate on window resize
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;

      const button = buttonRefs.current.get(currentMode);
      if (!button) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();

      setPillStyle({
        left: buttonRect.left - containerRect.left,
        width: buttonRect.width,
        top: buttonRect.top - containerRect.top,
        height: buttonRect.height,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentMode]);

  const handleModeChange = (mode: ViewMode) => {
    track('mode_switch', { from: currentMode, to: mode });
    onModeChange(mode);
  };

  if (!mounted) {
    return <div className="skeleton-line h-8 w-40 rounded-md" />;
  }

  const modes: { id: ViewMode; label: string; icon: React.ReactNode; description: string }[] = [
    {
      id: 'simple',
      label: t('simple_mode', 'Uitleg'),
      icon: <FileText className="w-4 h-4" />,
      description: t('simple_mode_description', 'Volledige tekstweergave'),
    },
    {
      id: 'study',
      label: t('study_mode', 'Leren'),
      icon: <GraduationCap className="w-4 h-4" />,
      description: t('study_mode_description', 'Leren, oefentoets en spelletjes'),
    },
    {
      id: 'samenvatting',
      label: t('summary_mode', 'Samenvatting'),
      icon: <BookOpen className="w-4 h-4" />,
      description: t('summary_mode_description', 'Samenvatting van de stof'),
    },
    {
      id: 'quiz',
      label: t('quiz_mode', 'Quiz'),
      icon: <Brain className="w-4 h-4" />,
      description: t('quiz_mode_description', 'Test je kennis'),
    },
    {
      id: 'alles-leren-2-dagen',
      label: 'Alles leren in 2 dagen',
      icon: <Clock className="w-4 h-4" />,
      description: 'Intensief tweedaags stappenplan',
    },
    {
      id: 'complete-oefentoets',
      label: 'Complete Oefentoets',
      icon: <FileCheck className="w-4 h-4" />,
      description: 'Professioneel proefwerk',
    },
    {
      id: 'alle-leerdoelen-opdrachten',
      label: 'Alle Leerdoelen Opdrachten',
      icon: <ListTodo className="w-4 h-4" />,
      description: 'Leerdoelen en taken per paragraaf',
    },
    {
      id: 'vragenlijst',
      label: 'Vragenlijst',
      icon: <HelpCircle className="w-4 h-4" />,
      description: 'Allesomvattende examenvragen',
    },
  ];

  const visibleModes =
    availableModes && availableModes.length > 0
      ? modes.filter((mode) => availableModes.includes(mode.id))
      : modes;

  if (visibleModes.length <= 1) {
    return null;
  }

  return (
    <div ref={containerRef} className="flex items-center gap-0.5 p-0.5 bg-secondary/50 rounded border border-border relative">
      {/* Sliding pill indicator */}
      <div
        className="absolute bg-background border border-border shadow-sm rounded transition-all duration-300 ease-out"
        style={pillStyle}
      />
      {visibleModes.map((mode) => (
        <button
          key={mode.id}
          ref={(el) => {
            if (el) buttonRefs.current.set(mode.id, el);
          }}
          onClick={() => handleModeChange(mode.id)}
          className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium relative z-10 ${
            currentMode === mode.id
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          title={mode.description}
        >
          {mode.icon}
          <span className="hidden sm:inline">{mode.label}</span>
        </button>
      ))}
    </div>
  );
}
