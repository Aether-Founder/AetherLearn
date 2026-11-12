'use client';

import { useCallback, useRef, useState } from 'react';
import { useTranslation } from '@/lib/useTranslation';

function statusFor(pct: number, t: (k: string) => string) {
  if (pct >= 85) return { label: t('subject_status_mastered'), color: 'text-green-500' };
  if (pct >= 65) return { label: t('subject_status_reasonable'), color: 'text-yellow-500' };
  if (pct >= 40) return { label: t('subject_status_watch'), color: 'text-orange-500' };
  return { label: t('subject_status_risk'), color: 'text-red-500' };
}

export function SubjectProgressBar({ value }: { value: number }) {
  const { t } = useTranslation();
  const pct = Math.min(Math.max(value || 0, 0), 100);
  const barRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<{ x: number; pct: number } | null>(null);

  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = barRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const ratio = (e.clientX - rect.left) / rect.width;
    const p = Math.min(Math.max(ratio * 100, 0), 100);
    setHover({ x: e.clientX - rect.left, pct: Math.round(p) });
  }, []);

  const currentStatus = statusFor(pct, t);
  const hoverStatus = hover ? statusFor(hover.pct, t) : null;

  return (
    <div>
      <div
        ref={barRef}
        className="relative h-3 w-full cursor-crosshair rounded-full bg-secondary"
        onMouseMove={handleMove}
        onMouseLeave={() => setHover(null)}
      >
        <div
          className="h-full rounded-full bg-primary transition-[width]"
          style={{ width: `${pct}%` }}
        />
        {hover && (
          <div
            className="pointer-events-none absolute -top-9 z-10 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-xs shadow-md"
            style={{ left: `${(hover.x / (barRef.current?.getBoundingClientRect().width || 1)) * 100}%` }}
          >
            <span className={`font-semibold ${hoverStatus!.color}`}>{hover.pct}%</span>
            <span className="ml-1 text-muted-foreground">{hoverStatus!.label}</span>
          </div>
        )}
      </div>
      <div className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground">
        <span className={currentStatus.color}>{currentStatus.label}</span>
        <span>{pct}%</span>
      </div>
    </div>
  );
}
