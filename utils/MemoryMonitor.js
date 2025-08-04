const EventEmitter = require('events');

/**
 * Memory monitoring and management system
 */
class MemoryMonitor extends EventEmitter {
    constructor(options = {}) {
        super();
        this.interval = options.interval || 30000; // 30 seconds
        this.thresholds = {
            warning: options.warningThreshold || 0.7, // 70%
            critical: options.criticalThreshold || 0.85, // 85%
            emergency: options.emergencyThreshold || 0.95 // 95%
        };
        
        this.gcEnabled = options.enableGC !== false;
        this.maxHeapSize = options.maxHeapSize || this.getMaxHeapSize();
        
        this.stats = {
            samples: [],
            maxSamples: options.maxSamples || 1440, // 24 hours of samples at 1 minute intervals
            warningCount: 0,
            criticalCount: 0,
            emergencyCount: 0,
            gcCount: 0,
            lastGC: null
        };
        
        this.isMonitoring = false;
        this.monitorTimer = null;
        
        // Bind methods
        this.monitor = this.monitor.bind(this);
        this.forceGC = this.forceGC.bind(this);
    }
    
    /**
     * Start monitoring
     */
    start() {
        if (this.isMonitoring) {
            return;
        }
        
        this.isMonitoring = true;
        this.monitorTimer = setInterval(this.monitor, this.interval);
        
        // Initial sample
        this.monitor();
        
        this.emit('started');
    }
    
    /**
     * Stop monitoring
     */
    stop() {
        if (!this.isMonitoring) {
            return;
        }
        
        this.isMonitoring = false;
        
        if (this.monitorTimer) {
            clearInterval(this.monitorTimer);
            this.monitorTimer = null;
        }
        
        this.emit('stopped');
    }
    
    /**
     * Monitor memory usage
     */
    monitor() {
        const memUsage = process.memoryUsage();
        const timestamp = Date.now();
        
        const sample = {
            timestamp,
            rss: memUsage.rss,
            heapUsed: memUsage.heapUsed,
            heapTotal: memUsage.heapTotal,
            external: memUsage.external,
            arrayBuffers: memUsage.arrayBuffers,
            heapUsagePercent: (memUsage.heapUsed / this.maxHeapSize) * 100
        };
        
        // Add to samples array
        this.stats.samples.push(sample);
        
        // Keep only max samples
        if (this.stats.samples.length > this.stats.maxSamples) {
            this.stats.samples.shift();
        }
        
        // Check thresholds
        this.checkThresholds(sample);
        
        this.emit('sample', sample);
        
        return sample;
    }
    
    /**
     * Check memory thresholds and emit warnings
     */
    checkThresholds(sample) {
        const usagePercent = sample.heapUsagePercent / 100;
        
        if (usagePercent >= this.thresholds.emergency) {
            this.stats.emergencyCount++;
            this.emit('emergency', sample);
            
            // Force garbage collection in emergency
            if (this.gcEnabled) {
                this.forceGC('emergency');
            }
            
        } else if (usagePercent >= this.thresholds.critical) {
            this.stats.criticalCount++;
            this.emit('critical', sample);
            
            // Suggest garbage collection
            if (this.gcEnabled) {
                this.forceGC('critical');
            }
            
        } else if (usagePercent >= this.thresholds.warning) {
            this.stats.warningCount++;
            this.emit('warning', sample);
        }
    }
    
    /**
     * Force garbage collection
     */
    forceGC(reason = 'manual') {
        if (!global.gc) {
            this.emit('gc-unavailable', { reason });
            return false;
        }
        
        try {\n            const beforeGC = process.memoryUsage();\n            global.gc();\n            const afterGC = process.memoryUsage();\n            \n            const freedMemory = beforeGC.heapUsed - afterGC.heapUsed;\n            \n            this.stats.gcCount++;\n            this.stats.lastGC = Date.now();\n            \n            this.emit('gc', {\n                reason,\n                beforeGC,\n                afterGC,\n                freedMemory,\n                freedPercent: ((freedMemory / beforeGC.heapUsed) * 100).toFixed(2)\n            });\n            \n            return true;\n        } catch (error) {\n            this.emit('gc-error', { reason, error: error.message });\n            return false;\n        }\n    }\n    \n    /**\n     * Get current memory statistics\n     */\n    getCurrentStats() {\n        const memUsage = process.memoryUsage();\n        const lastSample = this.stats.samples[this.stats.samples.length - 1];\n        \n        return {\n            current: {\n                rss: memUsage.rss,\n                heapUsed: memUsage.heapUsed,\n                heapTotal: memUsage.heapTotal,\n                external: memUsage.external,\n                arrayBuffers: memUsage.arrayBuffers,\n                heapUsagePercent: ((memUsage.heapUsed / this.maxHeapSize) * 100).toFixed(2)\n            },\n            thresholds: this.thresholds,\n            maxHeapSize: this.maxHeapSize,\n            isMonitoring: this.isMonitoring,\n            gcEnabled: this.gcEnabled && !!global.gc,\n            stats: {\n                samples: this.stats.samples.length,\n                warningCount: this.stats.warningCount,\n                criticalCount: this.stats.criticalCount,\n                emergencyCount: this.stats.emergencyCount,\n                gcCount: this.stats.gcCount,\n                lastGC: this.stats.lastGC\n            },\n            trend: lastSample ? this.calculateTrend() : null\n        };\n    }\n    \n    /**\n     * Calculate memory usage trend\n     */\n    calculateTrend() {\n        if (this.stats.samples.length < 2) {\n            return null;\n        }\n        \n        const recentSamples = this.stats.samples.slice(-10); // Last 10 samples\n        const firstSample = recentSamples[0];\n        const lastSample = recentSamples[recentSamples.length - 1];\n        \n        const heapChange = lastSample.heapUsed - firstSample.heapUsed;\n        const timeChange = lastSample.timestamp - firstSample.timestamp;\n        \n        const trendMBPerMinute = (heapChange / (1024 * 1024)) / (timeChange / 60000);\n        \n        return {\n            direction: heapChange > 0 ? 'increasing' : heapChange < 0 ? 'decreasing' : 'stable',\n            changePercent: ((heapChange / firstSample.heapUsed) * 100).toFixed(2),\n            mbPerMinute: trendMBPerMinute.toFixed(2),\n            samplesAnalyzed: recentSamples.length\n        };\n    }\n    \n    /**\n     * Get memory usage history\n     */\n    getHistory(minutes = 60) {\n        const cutoffTime = Date.now() - (minutes * 60 * 1000);\n        return this.stats.samples.filter(sample => sample.timestamp >= cutoffTime);\n    }\n    \n    /**\n     * Get formatted memory usage report\n     */\n    getReport() {\n        const stats = this.getCurrentStats();\n        const history = this.getHistory(60); // Last hour\n        \n        return {\n            timestamp: new Date().toISOString(),\n            summary: {\n                heapUsed: `${(stats.current.heapUsed / (1024 * 1024)).toFixed(2)} MB`,\n                heapTotal: `${(stats.current.heapTotal / (1024 * 1024)).toFixed(2)} MB`,\n                heapUsagePercent: `${stats.current.heapUsagePercent}%`,\n                rss: `${(stats.current.rss / (1024 * 1024)).toFixed(2)} MB`,\n                external: `${(stats.current.external / (1024 * 1024)).toFixed(2)} MB`\n            },\n            status: this.getMemoryStatus(parseFloat(stats.current.heapUsagePercent)),\n            alerts: {\n                warnings: stats.stats.warningCount,\n                critical: stats.stats.criticalCount,\n                emergency: stats.stats.emergencyCount\n            },\n            gc: {\n                available: stats.gcEnabled,\n                count: stats.stats.gcCount,\n                lastGC: stats.stats.lastGC ? new Date(stats.stats.lastGC).toISOString() : null\n            },\n            trend: stats.trend,\n            historySamples: history.length\n        };\n    }\n    \n    /**\n     * Get memory status based on usage percentage\n     */\n    getMemoryStatus(usagePercent) {\n        if (usagePercent >= this.thresholds.emergency * 100) {\n            return 'EMERGENCY';\n        } else if (usagePercent >= this.thresholds.critical * 100) {\n            return 'CRITICAL';\n        } else if (usagePercent >= this.thresholds.warning * 100) {\n            return 'WARNING';\n        } else {\n            return 'NORMAL';\n        }\n    }\n    \n    /**\n     * Get maximum heap size\n     */\n    getMaxHeapSize() {\n        // Try to get from V8 if available\n        try {\n            const v8 = require('v8');\n            const heapStats = v8.getHeapStatistics();\n            return heapStats.heap_size_limit;\n        } catch (error) {\n            // Fallback to estimated max heap size (default Node.js limit)\n            return 1.4 * 1024 * 1024 * 1024; // ~1.4GB\n        }\n    }\n    \n    /**\n     * Destroy monitor\n     */\n    destroy() {\n        this.stop();\n        this.stats.samples = [];\n        this.removeAllListeners();\n    }\n}\n\nmodule.exports = MemoryMonitor;