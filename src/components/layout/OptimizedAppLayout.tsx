// Optimized App Layout - Performance Focused
'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Toaster } from '@/components/ui/sonner';
import { preloadStrategies, LazyComponentLoader } from '@/lib/lazy-imports';
import { globalPerformanceMonitor } from '@/lib/performance-monitor';
import { preloadLiveComponents } from '@/components/_live/DynamicComponents';
import { OptimizedLazyImage } from '@/components/ui/optimized-lazy-image';

// Dynamically loaded layout components
const DynamicHeader = LazyComponentLoader.create(
  () => import('./Header').catch(() => import('./MobileHeader')),
  { preload: true }
);

const DynamicFooter = LazyComponentLoader.create(
  () => import('./Footer'),
  { preload: false }
);

const DynamicSidebar = LazyComponentLoader.create(
  () => import('./SideBar'),
  { preload: false }
);

const DynamicCookieConsent = LazyComponentLoader.create(
  () => import('@/components/cookie-consent/CookieConsentBanner'),
  { preload: false }
);

const DynamicAgeVerification = LazyComponentLoader.create(
  () => import('@/components/age-verification/AgeVerificationModal'),
  { preload: false }
);

// Loading fallbacks
const HeaderSkeleton = () => (
  <header className="h-16 bg-background border-b animate-pulse">
    <div className="container mx-auto px-4 h-full flex items-center justify-between">
      <div className="h-8 w-32 bg-muted rounded" />
      <div className="flex space-x-4">
        <div className="h-8 w-20 bg-muted rounded" />
        <div className="h-8 w-20 bg-muted rounded" />
        <div className="h-8 w-8 bg-muted rounded-full" />
      </div>
    </div>
  </header>
);

const FooterSkeleton = () => (
  <footer className="mt-auto bg-muted/50 border-t py-8">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="h-5 w-24 bg-muted rounded animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              <div className="h-4 w-16 bg-muted rounded animate-pulse" />
              <div className="h-4 w-18 bg-muted rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </footer>
);

const SidebarSkeleton = () => (
  <aside className="w-64 h-full bg-card border-r animate-pulse">
    <div className="p-4 space-y-4">
      <div className="h-6 w-32 bg-muted rounded" />
      <div className="space-y-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-10 w-full bg-muted rounded" />
        ))}
      </div>
    </div>
  </aside>
);

interface OptimizedAppLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  enableLiveFeatures?: boolean;
  preloadAdminComponents?: boolean;
  performanceMode?: 'aggressive' | 'balanced' | 'conservative';
}

/**
 * Optimized App Layout with performance-first approach
 */
export const OptimizedAppLayout: React.FC<OptimizedAppLayoutProps> = ({
  children,
  showSidebar = false,
  enableLiveFeatures = false,
  preloadAdminComponents = false,
  performanceMode = 'balanced'
}) => {
  const [isClient, setIsClient] = useState(false);
  const [preloadingComplete, setPreloadingComplete] = useState(false);

  // Client-side hydration
  useEffect(() => {
    setIsClient(true);
    
    // Start performance monitoring
    if (globalPerformanceMonitor) {
      globalPerformanceMonitor.saveSnapshot('app-start');
    }

    // Performance-based preloading strategy
    const preloadComponents = async () => {
      const startTime = performance.now();
      
      try {
        const preloadPromises: Promise<any>[] = [];

        // Always preload critical components
        preloadPromises.push(
          LazyComponentLoader.preload(
            () => import('./Header').catch(() => import('./MobileHeader')),
            'header'
          )
        );

        // Conditional preloading based on performance mode
        if (performanceMode === 'aggressive') {
          // Preload everything
          preloadPromises.push(
            LazyComponentLoader.preload(() => import('./Footer'), 'footer'),
            LazyComponentLoader.preload(() => import('./SideBar'), 'sidebar')
          );

          if (enableLiveFeatures) {
            preloadPromises.push(preloadLiveComponents.all());
            // Temporaneamente disabilitato per usare il nuovo polling Evolution
            // preloadPromises.push(
            //   DynamicWebSocketManagerFactory.preloadManagers(['unified', 'pragmatic'])
            // );
          }

          if (preloadAdminComponents) {
            const { preloadAdminComponents: preloadAdmin } = await import('@/components/admin/DynamicAdminComponents');
            preloadPromises.push(preloadAdmin.all());
          }

        } else if (performanceMode === 'balanced') {
          // Preload based on user interaction patterns
          preloadStrategies.onIdle(() => import('./Footer'), 1000);
          
          if (showSidebar) {
            preloadPromises.push(
              LazyComponentLoader.preload(() => import('./SideBar'), 'sidebar')
            );
          }

          if (enableLiveFeatures) {
            preloadStrategies.onIdle(() => preloadLiveComponents.videoPlayers(), 2000);
            // Temporaneamente disabilitato per usare il nuovo polling Evolution
            // preloadStrategies.onIdle(() => 
            //   DynamicWebSocketManagerFactory.preloadManagers(['unified']), 3000
            // );
          }

        } else { // conservative
          // Minimal preloading, load on demand
          preloadStrategies.onIdle(() => import('./Footer'), 5000);
        }

        await Promise.allSettled(preloadPromises);
        
        const loadTime = performance.now() - startTime;
        console.log(`✅ Component preloading completed in ${loadTime.toFixed(2)}ms`);
        
        if (globalPerformanceMonitor) {
          globalPerformanceMonitor.trackComponentLoad('preload-batch', startTime);
        }

      } catch (error) {
        console.error('❌ Error during component preloading:', error);
      } finally {
        setPreloadingComplete(true);
      }
    };

    // Start preloading after a short delay to not block initial render
    const preloadTimer = setTimeout(preloadComponents, 100);

    return () => {
      clearTimeout(preloadTimer);
    };
  }, [performanceMode, enableLiveFeatures, preloadAdminComponents, showSidebar]);

  // Error fallback component
  const ErrorFallback = ({ error, resetErrorBoundary }: any) => (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-destructive">Errore dell'Applicazione</h1>
        <p className="text-muted-foreground max-w-md">
          Si è verificato un errore inaspettato. Ricarica la pagina per riprovare.
        </p>
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Ricarica Applicazione
        </button>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-muted-foreground">
              Dettagli errore (dev)
            </summary>
            <pre className="mt-2 p-4 bg-muted rounded text-xs overflow-auto">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );

  if (!isClient) {
    // Server-side render with minimal layout
    return (
      <div className="min-h-screen flex flex-col">
        <HeaderSkeleton />
        <main className="flex-1 container mx-auto px-4 py-8">
          {children}
        </main>
        <FooterSkeleton />
      </div>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onError={(error) => {
      console.error('App Layout Error:', error);
      if (globalPerformanceMonitor) {
        globalPerformanceMonitor.saveSnapshot('error-occurred');
      }
    }}>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <Suspense fallback={<HeaderSkeleton />}>
          <DynamicHeader />
        </Suspense>

        {/* Main Content Area */}
        <div className="flex flex-1">
          {/* Sidebar */}
          {showSidebar && (
            <Suspense fallback={<SidebarSkeleton />}>
              <DynamicSidebar />
            </Suspense>
          )}

          {/* Main Content */}
          <main className={`flex-1 ${showSidebar ? 'ml-0' : ''}`}>
            <div className="container mx-auto px-4 py-8">
              {children}
            </div>
          </main>
        </div>

        {/* Footer */}
        <Suspense fallback={<FooterSkeleton />}>
          <DynamicFooter />
        </Suspense>

        {/* Global Components */}
        <Suspense fallback={null}>
          <DynamicCookieConsent />
        </Suspense>

        <Suspense fallback={null}>
          <DynamicAgeVerification />
        </Suspense>

        {/* Toast notifications */}
        <Toaster 
          position="bottom-right"
          expand={false}
          richColors
          closeButton
        />

        {/* Performance indicator (dev only) */}
        {process.env.NODE_ENV === 'development' && (
          <PerformanceIndicator preloadingComplete={preloadingComplete} />
        )}
      </div>
    </ErrorBoundary>
  );
};

/**
 * Development performance indicator
 */
const PerformanceIndicator: React.FC<{ preloadingComplete: boolean }> = ({ 
  preloadingComplete 
}) => {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    if (preloadingComplete && globalPerformanceMonitor) {
      const summary = globalPerformanceMonitor.getPerformanceSummary();
      setMetrics(summary);
    }
  }, [preloadingComplete]);

  if (!metrics) return null;

  return (
    <div className="fixed bottom-4 left-4 p-2 bg-background border rounded shadow-sm text-xs max-w-xs">
      <div className="font-semibold mb-1">⚡ Performance</div>
      {metrics.coreWebVitals?.LCP && (
        <div>LCP: {metrics.coreWebVitals.LCP.toFixed(0)}ms</div>
      )}
      {metrics.bundleSize?.total && (
        <div>Bundle: {(metrics.bundleSize.total / 1024).toFixed(0)}KB</div>
      )}
      <div className={`mt-1 ${preloadingComplete ? 'text-green-600' : 'text-yellow-600'}`}>
        {preloadingComplete ? '✅ Optimized' : '⏳ Loading...'}
      </div>
    </div>
  );
};

/**
 * Layout wrapper with smart preloading based on route
 */
export const SmartAppLayout: React.FC<{
  children: React.ReactNode;
  route?: string;
}> = ({ children, route }) => {
  // Determine layout configuration based on route
  const getLayoutConfig = () => {
    const isAdminRoute = route?.startsWith('/admin');
    const isStatsRoute = route?.includes('/stats');
    const isLiveRoute = route?.includes('/live');

    return {
      showSidebar: isAdminRoute,
      enableLiveFeatures: isStatsRoute || isLiveRoute,
      preloadAdminComponents: isAdminRoute,
      performanceMode: isAdminRoute ? 'conservative' as const : 'balanced' as const
    };
  };

  const config = getLayoutConfig();

  return (
    <OptimizedAppLayout {...config}>
      {children}
    </OptimizedAppLayout>
  );
};

export default OptimizedAppLayout;