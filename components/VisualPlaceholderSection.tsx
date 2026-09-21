'use client';

import { useState, useEffect, useRef } from 'react';

interface VisualPlaceholderSectionProps {
  visualTag: string;
  pageId: string;
  title?: string;
}

export const VisualPlaceholderSection = function VisualPlaceholderSection({
  visualTag,
  pageId,
  title,
}: VisualPlaceholderSectionProps) {
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const loadVisual = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/content/visual/${pageId}/${visualTag}`);
        if (!response.ok) {
          throw new Error(`Failed to load visual: ${response.statusText}`);
        }
        const html = await response.text();
        setHtmlContent(html);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load visual');
      } finally {
        setIsLoading(false);
      }
    };

    loadVisual();
  }, [visualTag, pageId]);

  // Auto-resize iframe to fit content
  useEffect(() => {
    if (!iframeRef.current || !htmlContent) return;

    const iframe = iframeRef.current;
    const resizeObserver = new ResizeObserver(() => {
      if (iframe.contentDocument) {
        const height = iframe.contentDocument.body.scrollHeight;
        iframe.style.height = `${height}px`;
      }
    });

    iframe.addEventListener('load', () => {
      if (iframe.contentDocument) {
        const height = iframe.contentDocument.body.scrollHeight;
        iframe.style.height = `${height}px`;
        resizeObserver.observe(iframe.contentDocument.body);
      }
    });

    return () => {
      resizeObserver.disconnect();
    };
  }, [htmlContent]);

  if (isLoading) {
    return (
      <div className="w-full h-48 flex items-center justify-center bg-secondary/20 rounded-lg border border-border">
        <div className="text-sm text-muted-foreground">Loading visual...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-48 flex items-center justify-center bg-destructive/10 rounded-lg border border-destructive/20">
        <div className="text-sm text-destructive">
          Failed to load visual: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="html-sandbox-host w-full my-4">
      {title && (
        <h3 className="text-xl font-serif font-medium text-foreground mb-3">{title}</h3>
      )}
      <iframe
        ref={iframeRef}
        className="html-sandbox-frame w-full border-0 rounded-lg"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        title={visualTag}
        srcDoc={htmlContent || undefined}
      />
    </div>
  );
};
