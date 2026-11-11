'use client';

import { useTranslation } from '@/lib/useTranslation';
import { cn } from '@/lib/utils';

interface TranslationTextProps {
  id: string;
  fallback?: string;
  params?: Record<string, string | number>;
  className?: string;
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div';
}

export function TranslationText({
  id,
  fallback,
  params,
  className,
  as: Component = 'span',
}: TranslationTextProps) {
  const { t, translationsReady } = useTranslation();

  if (!translationsReady) {
    // Show skeleton shimmer while translations are loading
    return (
      <Component className={cn('animate-pulse bg-muted rounded', className)}>
        <span className="invisible">{fallback || id}</span>
      </Component>
    );
  }

  const translatedText = t(id, fallback, params);

  return <Component className={className}>{translatedText}</Component>;
}
