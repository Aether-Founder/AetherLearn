/**
 * Offline Content Cache Service
 * Automatically caches visited content for offline access
 */

interface CacheEntry {
  url: string;
  content: any;
  timestamp: number;
  contentType: 'studyset' | 'note' | 'subject' | 'chapter' | 'leerset_page';
  metadata?: {
    title: string;
    description?: string;
    lastModified?: string;
  };
}

class ContentCacheService {
  private static instance: ContentCacheService;
  private cache: Map<string, CacheEntry> = new Map();
  private readonly CACHE_PREFIX = 'aether_content_cache_';
  private readonly MAX_CACHE_SIZE = 50; // Maximum number of items to cache
  private readonly CACHE_EXPIRY_DAYS = 7; // Cache expires after 7 days

  private constructor() {
    this.loadFromStorage();
  }

  static getInstance(): ContentCacheService {
    if (!ContentCacheService.instance) {
      ContentCacheService.instance = new ContentCacheService();
    }
    return ContentCacheService.instance;
  }

  /**
   * Cache content for offline access
   */
  async cacheContent(
    url: string,
    content: any,
    contentType: CacheEntry['contentType'],
    metadata?: CacheEntry['metadata']
  ): Promise<void> {
    const entry: CacheEntry = {
      url,
      content,
      timestamp: Date.now(),
      contentType,
      metadata,
    };

    this.cache.set(url, entry);
    this.enforceCacheLimit();
    this.saveToStorage();
  }

  /**
   * Get cached content
   */
  getCachedContent(url: string): CacheEntry | null {
    const entry = this.cache.get(url);
    if (!entry) return null;

    // Check if cache is expired
    const expiryTime = entry.timestamp + this.CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    if (Date.now() > expiryTime) {
      this.cache.delete(url);
      this.saveToStorage();
      return null;
    }

    return entry;
  }

  /**
   * Check if content is cached
   */
  isCached(url: string): boolean {
    return this.cache.has(url);
  }

  /**
   * Get all cached content of a specific type
   */
  getCachedContentByType(contentType: CacheEntry['contentType']): CacheEntry[] {
    return Array.from(this.cache.values()).filter(
      (entry) => entry.contentType === contentType
    );
  }

  /**
   * Clear specific cache entry
   */
  clearCacheEntry(url: string): void {
    this.cache.delete(url);
    this.saveToStorage();
  }

  /**
   * Clear all cache
   */
  clearAllCache(): void {
    this.cache.clear();
    this.saveToStorage();
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache(): void {
    const now = Date.now();
    const expiryTime = now - this.CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

    for (const [url, entry] of this.cache.entries()) {
      if (entry.timestamp < expiryTime) {
        this.cache.delete(url);
      }
    }

    this.saveToStorage();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    totalEntries: number;
    totalSize: number;
    entriesByType: Record<string, number>;
    oldestEntry: number | null;
    newestEntry: number | null;
  } {
    const entries = Array.from(this.cache.values());
    const entriesByType: Record<string, number> = {};

    entries.forEach((entry) => {
      entriesByType[entry.contentType] = (entriesByType[entry.contentType] || 0) + 1;
    });

    const timestamps = entries.map((e) => e.timestamp);
    const oldestEntry = timestamps.length > 0 ? Math.min(...timestamps) : null;
    const newestEntry = timestamps.length > 0 ? Math.max(...timestamps) : null;

    // Estimate size (rough calculation)
    const totalSize = JSON.stringify(entries).length;

    return {
      totalEntries: entries.length,
      totalSize,
      entriesByType,
      oldestEntry,
      newestEntry,
    };
  }

  /**
   * Enforce cache size limit
   */
  private enforceCacheLimit(): void {
    if (this.cache.size <= this.MAX_CACHE_SIZE) return;

    // Sort entries by timestamp (oldest first)
    const entries = Array.from(this.cache.entries()).sort(
      (a, b) => a[1].timestamp - b[1].timestamp
    );

    // Remove oldest entries to maintain limit
    const entriesToRemove = entries.slice(0, entries.length - this.MAX_CACHE_SIZE);
    entriesToRemove.forEach(([url]) => this.cache.delete(url));
  }

  /**
   * Save cache to localStorage
   */
  private saveToStorage(): void {
    try {
      const cacheData = Array.from(this.cache.entries());
      localStorage.setItem(this.CACHE_PREFIX + 'data', JSON.stringify(cacheData));
    } catch (error) {
      console.error('Failed to save cache to storage:', error);
    }
  }

  /**
   * Load cache from localStorage
   */
  private loadFromStorage(): void {
    try {
      const cacheData = localStorage.getItem(this.CACHE_PREFIX + 'data');
      if (cacheData) {
        const entries = JSON.parse(cacheData);
        this.cache = new Map(entries);
        this.clearExpiredCache();
      }
    } catch (error) {
      console.error('Failed to load cache from storage:', error);
    }
  }
}

export const contentCacheService = ContentCacheService.getInstance();