import { ProjectAnalysis, CachedAnalysis } from '../types/llmTypes.js';

/**
 * Project Analysis Cache for Two-Phase LLM Generation
 * 
 * Manages analysis state between Phase 1 (analysis + prompt generation)
 * and Phase 2 (LLM processing + synthesis)
 */
export class ProjectAnalysisCache {
    private cache: Map<string, CachedAnalysis> = new Map();
    private readonly ttl: number = 3600000; // 1 hour TTL
    private readonly maxCacheSize: number = 100; // Maximum cached analyses
    
    /**
     * Store project analysis with generated ID
     * Returns analysis ID for use in Phase 2
     */
    async store(analysis: ProjectAnalysis): Promise<string> {
        const id = this.generateAnalysisId(analysis);
        
        // Cleanup if cache is getting too large
        if (this.cache.size >= this.maxCacheSize) {
            this.cleanupOldest();
        }
        
        this.cache.set(id, {
            analysis,
            timestamp: Date.now(),
            expires: Date.now() + this.ttl
        });
        
        // Periodic cleanup of expired entries
        this.cleanupExpired();
        
        console.log(`Analysis cached with ID: ${id} (expires in ${this.ttl / 1000}s)`);
        
        return id;
    }
    
    /**
     * Retrieve cached analysis by ID
     * Throws error if not found or expired
     */
    async retrieve(id: string): Promise<ProjectAnalysis> {
        const cached = this.cache.get(id);
        
        if (!cached) {
            throw new Error(
                `Analysis ${id} not found in cache. ` +
                `Please restart from Phase 1 (analyze) to generate new prompts.`
            );
        }
        
        if (cached.expires < Date.now()) {
            this.cache.delete(id);
            throw new Error(
                `Analysis ${id} expired (TTL: ${this.ttl / 1000}s). ` +
                `Please restart from Phase 1 (analyze) to generate fresh analysis.`
            );
        }
        
        console.log(`Analysis retrieved: ${id} (${this.formatTimeRemaining(cached.expires)})`);
        
        return cached.analysis;
    }
    
    /**
     * Check if analysis exists and is valid
     */
    async exists(id: string): Promise<boolean> {
        const cached = this.cache.get(id);
        
        if (!cached) {
            return false;
        }
        
        if (cached.expires < Date.now()) {
            this.cache.delete(id);
            return false;
        }
        
        return true;
    }
    
    /**
     * Extend TTL for an existing analysis
     */
    async extend(id: string, additionalTime: number = this.ttl): Promise<boolean> {
        const cached = this.cache.get(id);
        
        if (!cached || cached.expires < Date.now()) {
            return false;
        }
        
        cached.expires = Date.now() + additionalTime;
        this.cache.set(id, cached);
        
        console.log(`Analysis ${id} TTL extended by ${additionalTime / 1000}s`);
        
        return true;
    }
    
    /**
     * Clear specific analysis from cache
     */
    async clear(id: string): Promise<boolean> {
        const existed = this.cache.has(id);
        this.cache.delete(id);
        
        if (existed) {
            console.log(`Analysis ${id} cleared from cache`);
        }
        
        return existed;
    }
    
    /**
     * Get cache statistics
     */
    getStats(): {
        totalEntries: number;
        validEntries: number;
        expiredEntries: number;
        oldestEntry?: Date;
        newestEntry?: Date;
    } {
        const now = Date.now();
        let validCount = 0;
        let expiredCount = 0;
        let oldest: number | undefined;
        let newest: number | undefined;
        
        for (const cached of this.cache.values()) {
            if (cached.expires > now) {
                validCount++;
            } else {
                expiredCount++;
            }
            
            if (!oldest || cached.timestamp < oldest) {
                oldest = cached.timestamp;
            }
            
            if (!newest || cached.timestamp > newest) {
                newest = cached.timestamp;
            }
        }
        
        return {
            totalEntries: this.cache.size,
            validEntries: validCount,
            expiredEntries: expiredCount,
            ...(oldest && { oldestEntry: new Date(oldest) }),
            ...(newest && { newestEntry: new Date(newest) })
        };
    }
    
    /**
     * Cleanup all expired entries
     */
    private cleanupExpired(): void {
        const now = Date.now();
        let cleanedCount = 0;
        
        for (const [id, cached] of this.cache.entries()) {
            if (cached.expires < now) {
                this.cache.delete(id);
                cleanedCount++;
            }
        }
        
        if (cleanedCount > 0) {
            console.log(`Cleaned up ${cleanedCount} expired cache entries`);
        }
    }
    
    /**
     * Cleanup oldest entries when cache is full
     */
    private cleanupOldest(): void {
        const entries = Array.from(this.cache.entries());
        
        // Sort by timestamp (oldest first)
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
        
        // Remove oldest 25% of entries
        const toRemove = Math.ceil(entries.length * 0.25);
        
        for (let i = 0; i < toRemove; i++) {
            const [id] = entries[i];
            this.cache.delete(id);
        }
        
        console.log(`Cleaned up ${toRemove} oldest cache entries to make space`);
    }
    
    /**
     * Generate unique analysis ID
     */
    private generateAnalysisId(analysis: ProjectAnalysis): string {
        // Create deterministic hash from project path
        const projectHash = this.hashString(analysis.rootPath);
        
        // Add timestamp and random component for uniqueness
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        
        return `analysis_${projectHash}_${timestamp}_${random}`;
    }
    
    /**
     * Simple string hash function
     */
    private hashString(str: string): string {
        let hash = 0;
        
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        return Math.abs(hash).toString(36);
    }
    
    /**
     * Format remaining time for display
     */
    private formatTimeRemaining(expires: number): string {
        const remaining = expires - Date.now();
        
        if (remaining <= 0) {
            return 'expired';
        }
        
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        
        if (minutes > 0) {
            return `${minutes}m ${seconds}s remaining`;
        } else {
            return `${seconds}s remaining`;
        }
    }
    
    /**
     * Auto-cleanup expired entries every 5 minutes
     * Call this periodically in a background process
     */
    startPeriodicCleanup(): NodeJS.Timeout {
        return setInterval(() => {
            this.cleanupExpired();
        }, 5 * 60 * 1000); // 5 minutes
    }
    
    /**
     * Clear all cache entries
     */
    clearAll(): void {
        const count = this.cache.size;
        this.cache.clear();
        console.log(`Cleared all ${count} cache entries`);
    }
}