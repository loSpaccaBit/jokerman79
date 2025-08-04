// Lazy Import Utilities - Third-party Library Code Splitting
import { lazy, ComponentType } from 'react';

/**
 * Dynamic imports for heavy third-party libraries
 * These libraries are loaded only when needed
 */

// Recharts - Heavy charting library (100KB+)
export const loadRecharts = {
  async LineChart() {
    const { LineChart } = await import('recharts');
    return LineChart;
  },

  async BarChart() {
    const { BarChart } = await import('recharts');
    return BarChart;
  },

  async PieChart() {
    const { PieChart } = await import('recharts');
    return PieChart;
  },

  async ResponsiveContainer() {
    const { ResponsiveContainer } = await import('recharts');
    return ResponsiveContainer;
  },

  async XAxis() {
    const { XAxis } = await import('recharts');
    return XAxis;
  },

  async YAxis() {
    const { YAxis } = await import('recharts');
    return YAxis;
  },

  async CartesianGrid() {
    const { CartesianGrid } = await import('recharts');
    return CartesianGrid;
  },

  async Tooltip() {
    const { Tooltip } = await import('recharts');
    return Tooltip;
  },

  async Legend() {
    const { Legend } = await import('recharts');
    return Legend;
  },

  async Line() {
    const { Line } = await import('recharts');
    return Line;
  },

  async Bar() {
    const { Bar } = await import('recharts');
    return Bar;
  },

  async Cell() {
    const { Cell } = await import('recharts');
    return Cell;
  }
};

// HLS.js - Video streaming library (large)
export const loadHLS = async () => {
  const Hls = await import('hls.js');
  return Hls.default;
};

// Motion (Framer Motion) - Animation library
export const loadMotion = {
  async motion() {
    const { motion } = await import('motion');
    return motion;
  },

  async AnimatePresence() {
    const { AnimatePresence } = await import('motion');
    return AnimatePresence;
  },

  async useAnimation() {
    const { useAnimation } = await import('motion');
    return useAnimation;
  }
};

// React Table - Heavy table library
export const loadReactTable = {
  async useReactTable() {
    const { useReactTable } = await import('@tanstack/react-table');
    return useReactTable;
  },

  async createColumnHelper() {
    const { createColumnHelper } = await import('@tanstack/react-table');
    return createColumnHelper;
  },

  async getCoreRowModel() {
    const { getCoreRowModel } = await import('@tanstack/react-table');
    return getCoreRowModel;
  },

  async getFilteredRowModel() {
    const { getFilteredRowModel } = await import('@tanstack/react-table');
    return getFilteredRowModel;
  },

  async getSortedRowModel() {
    const { getSortedRowModel } = await import('@tanstack/react-table');
    return getSortedRowModel;
  },

  async getPaginationRowModel() {
    const { getPaginationRowModel } = await import('@tanstack/react-table');
    return getPaginationRowModel;
  }
};

// DnD Kit - Drag and drop library
export const loadDndKit = {
  async DndContext() {
    const { DndContext } = await import('@dnd-kit/core');
    return DndContext;
  },

  async useDraggable() {
    const { useDraggable } = await import('@dnd-kit/core');
    return useDraggable;
  },

  async useDroppable() {
    const { useDroppable } = await import('@dnd-kit/core');
    return useDroppable;
  },

  async SortableContext() {
    const { SortableContext } = await import('@dnd-kit/sortable');
    return SortableContext;
  },

  async useSortable() {
    const { useSortable } = await import('@dnd-kit/sortable');
    return useSortable;
  }
};

/**
 * Lazy loading React components with error boundaries
 */
interface LazyComponentOptions {
  fallback?: ComponentType;
  errorFallback?: ComponentType<{ error?: Error; retry?: () => void }>;
  preload?: boolean;
}

export class LazyComponentLoader {
  private static preloadPromises = new Map<string, Promise<any>>();

  /**
   * Create a lazy-loaded component with advanced options
   */
  static create<T extends ComponentType<any>>(
    importFn: () => Promise<{ default: T }>,
    options: LazyComponentOptions = {}
  ): ComponentType<React.ComponentProps<T>> {
    const LazyComponent = lazy(importFn);

    // Preload if requested
    if (options.preload) {
      const key = importFn.toString();
      if (!this.preloadPromises.has(key)) {
        this.preloadPromises.set(key, importFn());
      }
    }

    return LazyComponent;
  }

  /**
   * Preload a component without rendering it
   */
  static async preload<T>(
    importFn: () => Promise<{ default: T }>,
    key?: string
  ): Promise<{ default: T }> {
    const cacheKey = key || importFn.toString();
    
    if (!this.preloadPromises.has(cacheKey)) {
      console.log(`🚀 Preloading component: ${key || 'anonymous'}`);
      this.preloadPromises.set(cacheKey, importFn());
    }

    return this.preloadPromises.get(cacheKey)!;
  }

  /**
   * Clear preload cache
   */
  static clearCache() {
    this.preloadPromises.clear();
  }
}

/**
 * Bundle analyzer utilities
 */
export const bundleUtils = {
  /**
   * Measure the load time of a dynamic import
   */
  async measureImportTime<T>(
    importFn: () => Promise<T>,
    label: string
  ): Promise<{ result: T; loadTime: number }> {
    const startTime = performance.now();
    const result = await importFn();
    const loadTime = performance.now() - startTime;
    
    console.log(`📊 ${label} loaded in ${loadTime.toFixed(2)}ms`);
    
    return { result, loadTime };
  },

  /**
   * Check if a module is already loaded
   */
  isModuleLoaded(moduleName: string): boolean {
    return moduleName in (window as any).__NEXT_LOADED_MODULES__ || {};
  },

  /**
   * Get estimated bundle size impact
   */
  async estimateBundleImpact(importFn: () => Promise<any>): Promise<number> {
    const startSize = performance.memory?.usedJSHeapSize || 0;
    await importFn();
    const endSize = performance.memory?.usedJSHeapSize || 0;
    
    return endSize - startSize;
  }
};

/**
 * Smart preloading strategies
 */
export const preloadStrategies = {
  /**
   * Preload on user interaction (hover, focus)
   */
  onInteraction<T>(importFn: () => Promise<T>) {
    let loaded = false;
    
    const preload = () => {
      if (!loaded) {
        loaded = true;
        LazyComponentLoader.preload(importFn as any, 'interaction-triggered');
      }
    };

    return {
      onMouseEnter: preload,
      onFocus: preload,
      onTouchStart: preload
    };
  },

  /**
   * Preload on viewport intersection
   */
  onIntersection<T>(importFn: () => Promise<T>, options?: IntersectionObserverInit) {
    return (element: Element) => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            LazyComponentLoader.preload(importFn as any, 'intersection-triggered');
            observer.unobserve(element);
          }
        });
      }, options);

      observer.observe(element);
      
      return () => observer.unobserve(element);
    };
  },

  /**
   * Preload after initial page load
   */
  onIdle<T>(importFn: () => Promise<T>, delay: number = 2000) {
    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          LazyComponentLoader.preload(importFn as any, 'idle-triggered');
        });
      } else {
        setTimeout(() => {
          LazyComponentLoader.preload(importFn as any, 'idle-triggered');
        }, delay);
      }
    }
  },

  /**
   * Preload critical components immediately
   */
  immediate<T>(importFn: () => Promise<T>) {
    LazyComponentLoader.preload(importFn as any, 'immediate');
  }
};

export default {
  loadRecharts,
  loadHLS,
  loadMotion,
  loadReactTable,
  loadDndKit,
  LazyComponentLoader,
  bundleUtils,
  preloadStrategies
};