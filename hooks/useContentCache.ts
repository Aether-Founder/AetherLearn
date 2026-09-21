/**
 * React hook for content caching
 */

import { useEffect, useRef, useState } from 'react';
import { contentCacheService } from '@/lib/offline/contentCache';

export function useContentCache(
  url: string,
  content: any,
  contentType: 'studyset' | 'note' | 'subject' | 'chapter' | 'leerset_page',
  metadata?: { title: string; description?: string; lastModified?: string }
) {
  const hasCached = useRef(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    // Only cache once per URL to avoid redundant caching
    if (hasCached.current) return;

    const cacheContent = async () => {
      try {
        await contentCacheService.cacheContent(url, content, contentType, metadata);
        hasCached.current = true;
      } catch (error) {
        console.error('Failed to cache content:', error);
      }
    };

    // Cache content when it's available
    if (content) {
      cacheContent();
    }
  }, [url, content, contentType, metadata, isClient]);

  const getCached = () => {
    return contentCacheService.getCachedContent(url);
  };

  const isCached = () => {
    return contentCacheService.isCached(url);
  };

  return {
    getCached,
    isCached,
  };
}