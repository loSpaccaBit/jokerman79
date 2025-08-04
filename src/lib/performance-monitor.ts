// Performance Monitoring and Bundle Analysis Utilities
'use client';

interface PerformanceMetrics {
  bundleSize: {
    total: number;
    chunks: Record<string, number>;
    compressed: number;
  };
  loadingTimes: {
    initial: number;
    components: Record<string, number>;
    webSockets: Record<string, number>;
  };
  memoryUsage: {
    before: number;
    after: number;
    difference: number;
  };
  coreWebVitals: {
    LCP?: number; // Largest Contentful Paint
    FID?: number; // First Input Delay
    CLS?: number; // Cumulative Layout Shift
    FCP?: number; // First Contentful Paint
    TTFB?: number; // Time to First Byte
  };
}

/**
 * Performance Monitor Class
 * Tracks bundle size optimizations and performance improvements
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Partial<PerformanceMetrics> = {};
  private startTime: number = 0;
  private observers: PerformanceObserver[] = [];

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeMetrics();
      this.setupWebVitalsObservers();
    }
  }

  /**
   * Initialize performance metrics tracking
   */
  private initializeMetrics() {
    this.startTime = performance.now();
    
    // Track initial memory usage
    if ('memory' in performance) {
      this.metrics.memoryUsage = {
        before: (performance as Performance & { memory: { usedJSHeapSize: number } }).memory.usedJSHeapSize,
        after: 0,
        difference: 0
      };
    }

    // Track navigation timing
    if ('navigation' in performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      this.metrics.loadingTimes = {
        initial: navigation.loadEventEnd - navigation.fetchStart,
        components: {},
        webSockets: {}
      };
    }
  }

  /**
   * Setup Core Web Vitals observers
   */
  private setupWebVitalsObservers() {
    // Largest Contentful Paint (LCP)
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
        this.metrics.coreWebVitals = {
          ...this.metrics.coreWebVitals,
          LCP: lastEntry.startTime
        };
        console.log(`📊 LCP: ${lastEntry.startTime.toFixed(2)}ms`);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);
    } catch {
      console.warn('LCP observer not supported');
    }

    // First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const fidEntry = entry as PerformanceEntry & { processingStart: number; startTime: number };
          this.metrics.coreWebVitals = {
            ...this.metrics.coreWebVitals,
            FID: fidEntry.processingStart - fidEntry.startTime
          };
          console.log(`📊 FID: ${(fidEntry.processingStart - fidEntry.startTime).toFixed(2)}ms`);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);
    } catch {
      console.warn('FID observer not supported');
    }

    // Cumulative Layout Shift (CLS)
    try {
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const clsEntry = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
          if (!clsEntry.hadRecentInput) {
            clsValue += clsEntry.value;
          }
        });
        this.metrics.coreWebVitals = {
          ...this.metrics.coreWebVitals,
          CLS: clsValue
        };
        console.log(`📊 CLS: ${clsValue.toFixed(4)}`);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);
    } catch {
      console.warn('CLS observer not supported');
    }

    // First Contentful Paint (FCP)
    try {
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const fcpEntry = entry as PerformanceEntry & { startTime: number };
          this.metrics.coreWebVitals = {
            ...this.metrics.coreWebVitals,
            FCP: fcpEntry.startTime
          };
          console.log(`📊 FCP: ${fcpEntry.startTime.toFixed(2)}ms`);
        });
      });
      fcpObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(fcpObserver);
    } catch {
      console.warn('FCP observer not supported');
    }
  }

  /**
   * Track component loading time
   */
  trackComponentLoad(componentName: string, startTime: number) {
    const loadTime = performance.now() - startTime;
    
    if (!this.metrics.loadingTimes) {
      this.metrics.loadingTimes = { initial: 0, components: {}, webSockets: {} };
    }
    
    this.metrics.loadingTimes.components[componentName] = loadTime;
    console.log(`🧩 Component "${componentName}" loaded in ${loadTime.toFixed(2)}ms`);
    
    return loadTime;
  }

  /**
   * Track WebSocket connection time
   */
  trackWebSocketConnection(providerName: string, startTime: number) {
    const connectionTime = performance.now() - startTime;
    
    if (!this.metrics.loadingTimes) {
      this.metrics.loadingTimes = { initial: 0, components: {}, webSockets: {} };
    }
    
    this.metrics.loadingTimes.webSockets[providerName] = connectionTime;
    console.log(`🔌 WebSocket "${providerName}" connected in ${connectionTime.toFixed(2)}ms`);
    
    return connectionTime;
  }

  /**
   * Track bundle loading performance
   */
  trackBundleLoad(chunkName: string, size: number) {
    if (!this.metrics.bundleSize) {
      this.metrics.bundleSize = { total: 0, chunks: {}, compressed: 0 };
    }
    
    this.metrics.bundleSize.chunks[chunkName] = size;
    this.metrics.bundleSize.total += size;
    
    console.log(`📦 Bundle chunk "${chunkName}": ${(size / 1024).toFixed(2)}KB`);
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): PerformanceMetrics {
    // Update final memory usage
    if ('memory' in performance && this.metrics.memoryUsage) {
      this.metrics.memoryUsage.after = (performance as Performance & { memory: { usedJSHeapSize: number } }).memory.usedJSHeapSize;
      this.metrics.memoryUsage.difference = 
        this.metrics.memoryUsage.after - this.metrics.memoryUsage.before;
    }

    return this.metrics as PerformanceMetrics;
  }

  /**
   * Generate performance report
   */
  generateReport(): string {
    const summary = this.getPerformanceSummary();
    
    let report = '📊 PERFORMANCE OPTIMIZATION REPORT\n';
    report += '=====================================\n\n';

    // Core Web Vitals
    if (summary.coreWebVitals) {
      report += '🎯 Core Web Vitals:\n';
      if (summary.coreWebVitals.LCP) {
        const lcpStatus = summary.coreWebVitals.LCP <= 2500 ? '✅ Good' : 
                         summary.coreWebVitals.LCP <= 4000 ? '⚠️ Needs Improvement' : '❌ Poor';
        report += `   LCP: ${summary.coreWebVitals.LCP.toFixed(2)}ms ${lcpStatus}\n`;
      }
      if (summary.coreWebVitals.FID) {
        const fidStatus = summary.coreWebVitals.FID <= 100 ? '✅ Good' : 
                         summary.coreWebVitals.FID <= 300 ? '⚠️ Needs Improvement' : '❌ Poor';
        report += `   FID: ${summary.coreWebVitals.FID.toFixed(2)}ms ${fidStatus}\n`;
      }
      if (summary.coreWebVitals.CLS) {
        const clsStatus = summary.coreWebVitals.CLS <= 0.1 ? '✅ Good' : 
                         summary.coreWebVitals.CLS <= 0.25 ? '⚠️ Needs Improvement' : '❌ Poor';
        report += `   CLS: ${summary.coreWebVitals.CLS.toFixed(4)} ${clsStatus}\n`;
      }
      if (summary.coreWebVitals.FCP) {
        const fcpStatus = summary.coreWebVitals.FCP <= 1800 ? '✅ Good' : 
                         summary.coreWebVitals.FCP <= 3000 ? '⚠️ Needs Improvement' : '❌ Poor';
        report += `   FCP: ${summary.coreWebVitals.FCP.toFixed(2)}ms ${fcpStatus}\n`;
      }
      report += '\n';
    }

    // Bundle Size Analysis
    if (summary.bundleSize) {
      report += '📦 Bundle Analysis:\n';
      report += `   Total Size: ${(summary.bundleSize.total / 1024).toFixed(2)}KB\n`;
      
      const sortedChunks = Object.entries(summary.bundleSize.chunks)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10);
      
      report += '   Top Chunks:\n';
      sortedChunks.forEach(([name, size]) => {
        report += `     ${name}: ${(size / 1024).toFixed(2)}KB\n`;
      });
      report += '\n';
    }

    // Component Loading Times
    if (summary.loadingTimes?.components) {
      report += '🧩 Component Loading Times:\n';
      Object.entries(summary.loadingTimes.components)
        .sort(([,a], [,b]) => b - a)
        .forEach(([name, time]) => {
          const status = time <= 100 ? '✅' : time <= 300 ? '⚠️' : '❌';
          report += `   ${name}: ${time.toFixed(2)}ms ${status}\n`;
        });
      report += '\n';
    }

    // WebSocket Performance
    if (summary.loadingTimes?.webSockets) {
      report += '🔌 WebSocket Connection Times:\n';
      Object.entries(summary.loadingTimes.webSockets)
        .forEach(([name, time]) => {
          const status = time <= 1000 ? '✅' : time <= 2000 ? '⚠️' : '❌';
          report += `   ${name}: ${time.toFixed(2)}ms ${status}\n`;
        });
      report += '\n';
    }

    // Memory Usage
    if (summary.memoryUsage) {
      report += '💾 Memory Usage:\n';
      report += `   Before: ${(summary.memoryUsage.before / 1024 / 1024).toFixed(2)}MB\n`;
      report += `   After: ${(summary.memoryUsage.after / 1024 / 1024).toFixed(2)}MB\n`;
      report += `   Difference: ${(summary.memoryUsage.difference / 1024 / 1024).toFixed(2)}MB\n`;
      report += '\n';
    }

    // Optimization Recommendations
    report += '💡 Optimization Recommendations:\n';
    
    if (summary.coreWebVitals?.LCP && summary.coreWebVitals.LCP > 2500) {
      report += '   • Consider lazy loading non-critical images\n';
      report += '   • Optimize largest contentful element\n';
    }
    
    if (summary.coreWebVitals?.FID && summary.coreWebVitals.FID > 100) {
      report += '   • Reduce JavaScript execution time\n';
      report += '   • Consider code splitting for heavy interactions\n';
    }
    
    if (summary.bundleSize && summary.bundleSize.total > 500 * 1024) {
      report += '   • Bundle size is large, consider more aggressive code splitting\n';
    }
    
    const slowComponents = Object.entries(summary.loadingTimes?.components || {})
      .filter(([, time]) => time > 300);
    
    if (slowComponents.length > 0) {
      report += '   • Optimize slow loading components:\n';
      slowComponents.forEach(([name]) => {
        report += `     - ${name}\n`;
      });
    }

    return report;
  }

  /**
   * Save performance data to localStorage for comparison
   */
  saveSnapshot(label: string) {
    const summary = this.getPerformanceSummary();
    const snapshot = {
      label,
      timestamp: Date.now(),
      data: summary
    };
    
    const existingSnapshots = JSON.parse(
      localStorage.getItem('jokerman79-performance-snapshots') || '[]'
    );
    
    existingSnapshots.push(snapshot);
    
    // Keep only last 10 snapshots
    if (existingSnapshots.length > 10) {
      existingSnapshots.shift();
    }
    
    localStorage.setItem('jokerman79-performance-snapshots', JSON.stringify(existingSnapshots));
    console.log(`📸 Performance snapshot saved: ${label}`);
  }

  /**
   * Compare with previous snapshot
   */
  compareWithSnapshot(snapshotLabel: string): string | null {
    const snapshots = JSON.parse(
      localStorage.getItem('jokerman79-performance-snapshots') || '[]'
    );
    
    const snapshot = snapshots.find((s: { label: string; data: PerformanceMetrics }) => s.label === snapshotLabel);
    if (!snapshot) {
      return `Snapshot "${snapshotLabel}" not found`;
    }
    
    const current = this.getPerformanceSummary();
    const previous = snapshot.data;
    
    let comparison = `📊 PERFORMANCE COMPARISON: ${snapshotLabel}\n`;
    comparison += '==========================================\n\n';
    
    // Compare Core Web Vitals
    if (current.coreWebVitals && previous.coreWebVitals) {
      comparison += '🎯 Core Web Vitals Changes:\n';
      
      if (current.coreWebVitals.LCP && previous.coreWebVitals.LCP) {
        const diff = current.coreWebVitals.LCP - previous.coreWebVitals.LCP;
        const icon = diff < 0 ? '✅' : diff > 0 ? '❌' : '➖';
        comparison += `   LCP: ${diff.toFixed(2)}ms ${icon}\n`;
      }
      
      if (current.coreWebVitals.FID && previous.coreWebVitals.FID) {
        const diff = current.coreWebVitals.FID - previous.coreWebVitals.FID;
        const icon = diff < 0 ? '✅' : diff > 0 ? '❌' : '➖';
        comparison += `   FID: ${diff.toFixed(2)}ms ${icon}\n`;
      }
      
      comparison += '\n';
    }
    
    // Compare bundle sizes
    if (current.bundleSize && previous.bundleSize) {
      const sizeDiff = current.bundleSize.total - previous.bundleSize.total;
      const icon = sizeDiff < 0 ? '✅' : sizeDiff > 0 ? '❌' : '➖';
      comparison += `📦 Bundle Size Change: ${(sizeDiff / 1024).toFixed(2)}KB ${icon}\n\n`;
    }
    
    return comparison;
  }

  /**
   * Cleanup observers
   */
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

/**
 * Performance monitoring utilities
 */
export const performanceUtils = {
  // Measure function execution time
  measureFunction: async <T>(fn: () => Promise<T> | T, label: string): Promise<{ result: T; time: number }> => {
    const start = performance.now();
    const result = await fn();
    const time = performance.now() - start;
    console.log(`⏱️ ${label}: ${time.toFixed(2)}ms`);
    return { result, time };
  },

  // Monitor bundle chunk loading
  monitorChunkLoading: () => {
    if (typeof window !== 'undefined') {
      const originalFetch = window.fetch;
      window.fetch = function(...args) {
        const url = args[0] as string;
        if (url.includes('/_next/static/chunks/')) {
          const start = performance.now();
          return originalFetch.apply(this, args).then(response => {
            const loadTime = performance.now() - start;
            const chunkName = url.split('/').pop() || 'unknown-chunk';
            console.log(`📦 Chunk loaded: ${chunkName} in ${loadTime.toFixed(2)}ms`);
            return response;
          });
        }
        return originalFetch.apply(this, args);
      };
    }
  },

  // Get performance metrics for reporting
  getWebVitals: (): Promise<Record<string, number>> => {
    return new Promise((resolve) => {
      const vitals: Record<string, number> = {};
      let collected = 0;
      const total = 3; // LCP, FID, CLS

      const checkComplete = () => {
        collected++;
        if (collected >= total) {
          resolve(vitals);
        }
      };

      // Get LCP
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
        vitals.LCP = lastEntry.startTime;
        checkComplete();
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // Timeout fallback
      setTimeout(() => resolve(vitals), 5000);
    });
  }
};

// Initialize global performance monitor
export const globalPerformanceMonitor = typeof window !== 'undefined' 
  ? PerformanceMonitor.getInstance() 
  : null;

export default PerformanceMonitor;