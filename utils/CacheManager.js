const EventEmitter = require('events');

/**
 * Advanced caching system with LRU eviction, TTL, and memory management
 */
class CacheManager extends EventEmitter {
    constructor(options = {}) {
        super();
        this.maxSize = options.maxSize || 1000;
        this.defaultTTL = options.defaultTTL || 300000; // 5 minutes
        this.cleanupInterval = options.cleanupInterval || 60000; // 1 minute
        this.maxMemoryUsage = options.maxMemoryUsage || 100 * 1024 * 1024; // 100MB
        
        // Cache storage with access tracking
        this.cache = new Map();
        this.accessTimes = new Map();
        this.expireTimes = new Map();
        
        // Statistics
        this.stats = {
            hits: 0,
            misses: 0,
            evictions: 0,
            cleanups: 0,
            memoryUsage: 0,
            startTime: Date.now()
        };
        
        // Start cleanup interval
        this.cleanupTimer = setInterval(() => this.cleanup(), this.cleanupInterval);
        
        // Bind methods
        this.cleanup = this.cleanup.bind(this);
    }
    
    /**
     * Get item from cache
     */
    get(key) {
        const now = Date.now();
        
        // Check if key exists and not expired
        if (!this.cache.has(key)) {
            this.stats.misses++;
            return null;
        }
        
        const expireTime = this.expireTimes.get(key);
        if (expireTime && now > expireTime) {
            this.delete(key);
            this.stats.misses++;
            return null;
        }
        
        // Update access time for LRU
        this.accessTimes.set(key, now);
        this.stats.hits++;
        
        const value = this.cache.get(key);
        this.emit('hit', { key, value });
        
        return value;
    }
    
    /**
     * Set item in cache with optional TTL
     */
    set(key, value, ttl = null) {
        const now = Date.now();
        const effectiveTTL = ttl || this.defaultTTL;
        
        // Check memory usage before adding
        const estimatedSize = this.estimateSize(value);
        if (this.stats.memoryUsage + estimatedSize > this.maxMemoryUsage) {
            this.evictByMemory();
        }
        
        // Check size limit
        if (this.cache.size >= this.maxSize) {
            this.evictLRU();
        }
        
        // Store item
        this.cache.set(key, value);
        this.accessTimes.set(key, now);
        this.expireTimes.set(key, now + effectiveTTL);
        
        // Update memory usage
        this.stats.memoryUsage += estimatedSize;
        
        this.emit('set', { key, value, ttl: effectiveTTL });
        
        return true;
    }
    
    /**
     * Delete item from cache
     */
    delete(key) {
        if (!this.cache.has(key)) {
            return false;
        }
        
        const value = this.cache.get(key);
        const estimatedSize = this.estimateSize(value);
        
        this.cache.delete(key);
        this.accessTimes.delete(key);
        this.expireTimes.delete(key);
        
        this.stats.memoryUsage -= estimatedSize;
        
        this.emit('delete', { key, value });
        
        return true;
    }
    
    /**
     * Check if key exists and is not expired
     */
    has(key) {
        if (!this.cache.has(key)) {
            return false;
        }
        
        const expireTime = this.expireTimes.get(key);
        if (expireTime && Date.now() > expireTime) {
            this.delete(key);
            return false;
        }
        
        return true;
    }
    
    /**
     * Clear all cache
     */
    clear() {
        const size = this.cache.size;
        this.cache.clear();
        this.accessTimes.clear();
        this.expireTimes.clear();
        this.stats.memoryUsage = 0;
        
        this.emit('clear', { clearedItems: size });
    }
    
    /**
     * Evict least recently used item
     */
    evictLRU() {
        if (this.cache.size === 0) return;
        
        let oldestKey = null;
        let oldestTime = Date.now();
        
        for (const [key, time] of this.accessTimes) {
            if (time < oldestTime) {
                oldestTime = time;
                oldestKey = key;
            }
        }
        
        if (oldestKey) {
            this.delete(oldestKey);
            this.stats.evictions++;
            this.emit('eviction', { key: oldestKey, reason: 'LRU' });
        }
    }
    
    /**
     * Evict items to free memory
     */
    evictByMemory() {
        const targetReduction = this.maxMemoryUsage * 0.2; // Free 20%
        let freedMemory = 0;
        
        // Sort by access time (oldest first)
        const sortedEntries = Array.from(this.accessTimes.entries())
            .sort((a, b) => a[1] - b[1]);
        
        for (const [key] of sortedEntries) {
            if (freedMemory >= targetReduction) break;
            
            const value = this.cache.get(key);
            const size = this.estimateSize(value);
            
            this.delete(key);
            freedMemory += size;
            this.stats.evictions++;
            this.emit('eviction', { key, reason: 'memory' });
        }
    }
    
    /**
     * Clean up expired items
     */
    cleanup() {
        const now = Date.now();
        let cleaned = 0;
        
        for (const [key, expireTime] of this.expireTimes) {
            if (now > expireTime) {
                this.delete(key);
                cleaned++;
            }
        }
        
        this.stats.cleanups++;
        
        if (cleaned > 0) {
            this.emit('cleanup', { cleanedItems: cleaned });
        }
    }
    
    /**
     * Estimate memory usage of a value
     */
    estimateSize(value) {
        if (value === null || value === undefined) return 8;
        if (typeof value === 'boolean') return 4;
        if (typeof value === 'number') return 8;
        if (typeof value === 'string') return value.length * 2;
        if (Buffer.isBuffer(value)) return value.length;
        if (Array.isArray(value)) {
            return value.reduce((sum, item) => sum + this.estimateSize(item), 0);
        }
        if (typeof value === 'object') {
            return JSON.stringify(value).length * 2;
        }
        return 64; // Default estimate
    }
    
    /**
     * Get cache statistics
     */
    getStats() {
        const uptime = Date.now() - this.stats.startTime;
        const hitRate = this.stats.hits + this.stats.misses > 0 ? 
            (this.stats.hits / (this.stats.hits + this.stats.misses)) * 100 : 0;
        
        return {
            ...this.stats,
            size: this.cache.size,
            maxSize: this.maxSize,
            hitRate: `${hitRate.toFixed(2)}%`,
            uptime: uptime,
            memoryUsagePercent: `${((this.stats.memoryUsage / this.maxMemoryUsage) * 100).toFixed(2)}%`
        };
    }
    
    /**
     * Get all cache keys
     */
    keys() {
        return Array.from(this.cache.keys());
    }
    
    /**
     * Get cache info for specific key
     */
    getKeyInfo(key) {
        if (!this.cache.has(key)) {
            return null;
        }
        
        return {
            key,
            accessTime: this.accessTimes.get(key),
            expireTime: this.expireTimes.get(key),
            size: this.estimateSize(this.cache.get(key)),
            isExpired: Date.now() > this.expireTimes.get(key)
        };
    }
    
    /**
     * Destroy cache manager
     */
    destroy() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = null;
        }
        
        this.clear();
        this.removeAllListeners();
    }
}

module.exports = CacheManager;