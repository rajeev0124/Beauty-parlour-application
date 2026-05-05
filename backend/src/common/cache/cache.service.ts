import { Injectable, Logger } from '@nestjs/common';

interface CacheEntry<T> {
  value: T;
  expiry: number;
  hits: number;
}

/**
 * In-memory caching service with TTL support
 * Features: Auto-expiry, hit tracking, size limits, pattern-based invalidation
 * Can be replaced with Redis for distributed caching
 */
@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private cache = new Map<string, CacheEntry<any>>();
  private readonly maxSize = 1000; // Max cache entries
  private readonly defaultTTL = 300000; // 5 minutes

  /**
   * Get a value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    entry.hits++;
    return entry.value as T;
  }

  /**
   * Set a value in cache with optional TTL
   */
  set<T>(key: string, value: T, ttlMs?: number): void {
    // Evict old entries if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictLeastUsed();
    }

    this.cache.set(key, {
      value,
      expiry: Date.now() + (ttlMs || this.defaultTTL),
      hits: 0,
    });
  }

  /**
   * Delete a specific key
   */
  del(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Delete all keys matching a pattern
   */
  delPattern(pattern: string): number {
    const regex = new RegExp(pattern.replace('*', '.*'));
    let count = 0;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }

    this.logger.debug(`Invalidated ${count} cache entries matching ${pattern}`);
    return count;
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
    this.logger.log('Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    keys: string[];
  } {
    let totalHits = 0;
    const keys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      totalHits += entry.hits;
      keys.push(key);
    }

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.cache.size > 0 ? totalHits / this.cache.size : 0,
      keys,
    };
  }

  /**
   * Get or set pattern - fetch from cache or compute and store
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttlMs?: number,
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    this.set(key, value, ttlMs);
    return value;
  }

  /**
   * Evict least used entries when cache is full
   */
  private evictLeastUsed(): void {
    let minHits = Infinity;
    let minKey = '';

    for (const [key, entry] of this.cache.entries()) {
      if (entry.hits < minHits) {
        minHits = entry.hits;
        minKey = key;
      }
    }

    if (minKey) {
      this.cache.delete(minKey);
    }
  }

  /**
   * Common cache key generators
   */
  static keys = {
    services: () => 'services:all',
    service: (id: string) => `service:${id}`,
    products: () => 'products:all',
    product: (id: string) => `product:${id}`,
    categories: (type: string) => `categories:${type}`,
    staff: () => 'staff:all',
    staffMember: (id: string) => `staff:${id}`,
    userProfile: (id: string) => `user:profile:${id}`,
    dashboard: (period: string) => `dashboard:${period}`,
    reports: (type: string, params: string) => `reports:${type}:${params}`,
  };
}
