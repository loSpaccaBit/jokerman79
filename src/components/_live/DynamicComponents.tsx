// Dynamic Live Components - Code Splitting Implementation
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Play, Loader2 } from 'lucide-react';

/**
 * Loading fallback components for better UX during code splitting
 */
const StreamPlayerSkeleton = () => (
  <Card className="w-full h-64 md:h-96">
    <CardContent className="p-6">
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-sm text-muted-foreground">Caricamento player video...</span>
        </div>
        <Skeleton className="w-full h-48 rounded-lg" />
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const GameStatsSkeleton = () => (
  <Card className="w-full">
    <CardContent className="p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm text-muted-foreground">Caricamento statistiche...</span>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-8 w-1/2" />
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const ProviderConnectorSkeleton = () => (
  <Card className="w-full">
    <CardContent className="p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Play className="h-5 w-5" />
        <span className="text-sm text-muted-foreground">Inizializzazione provider...</span>
      </div>
      <Skeleton className="h-32 w-full rounded-lg" />
    </CardContent>
  </Card>
);

const ErrorFallback = ({ error, retry }: { error?: string; retry?: () => void }) => (
  <Card className="w-full">
    <CardContent className="p-6">
      <div className="flex flex-col items-center space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Errore caricamento componente</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {error || 'Si è verificato un errore durante il caricamento'}
          </p>
          {retry && (
            <button 
              onClick={retry}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Riprova
            </button>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

/**
 * Dynamically loaded live streaming components
 * These components are loaded only when needed, reducing initial bundle size
 */

// HLS Video Player - Heavy component with hls.js dependency
export const DynamicLiveStreamPlayer = dynamic(
  () => import('./LiveStreamPlayer').then(mod => ({
    default: mod.default
  })),
  {
    loading: () => <StreamPlayerSkeleton />,
    ssr: false // HLS.js works only on client side
  }
);

// Simple HLS Player - Alternative lighter player
export const DynamicSimpleHLSPlayer = dynamic(
  () => import('./SimpleHLSPlayer').then(mod => ({
    default: mod.default
  })),
  {
    loading: () => <StreamPlayerSkeleton />,
    ssr: false
  }
);

// Fallback Video Player - Used when HLS fails
export const DynamicFallbackVideoPlayer = dynamic(
  () => import('./FallbackVideoPlayer').then(mod => ({
    default: mod.default
  })),
  {
    loading: () => <StreamPlayerSkeleton />,
    ssr: false
  }
);

// Stream Link Player - For external stream URLs
export const DynamicStreamLinkPlayer = dynamic(
  () => import('./StreamLinkPlayer').then(mod => ({
    default: mod.default
  })),
  {
    loading: () => <StreamPlayerSkeleton />,
    ssr: false
  }
);

// Game Statistics Component - Heavy with recharts
export const DynamicGameStatsComponent = dynamic(
  () => import('./GameStatsComponent').then(mod => ({
    default: mod.default
  })),
  {
    loading: () => <GameStatsSkeleton />,
    ssr: true // Can be server-side rendered
  }
);

// Fixed Game Stats Component 
export const DynamicGameStatsComponentFixed = dynamic(
  () => import('./GameStatsComponentFixed').then(mod => ({
    default: mod.default
  })),
  {
    loading: () => <GameStatsSkeleton />,
    ssr: true
  }
);

// Provider Game Connector - WebSocket heavy component
export const DynamicProviderGameConnector = dynamic(
  () => import('./ProviderGameConnector').then(mod => ({
    default: mod.default
  })),
  {
    loading: () => <ProviderConnectorSkeleton />,
    ssr: false // WebSocket connections are client-side only
  }
);

/**
 * Smart component loader that chooses the best player based on conditions
 */
interface SmartVideoPlayerProps {
  streamUrl?: string;
  gameId?: string;
  provider?: 'pragmatic' | 'evolution';
  fallbackUrl?: string;
  autoPlay?: boolean;
  controls?: boolean;
  className?: string;
}

export const SmartVideoPlayer = ({
  streamUrl,
  gameId,
  provider,
  fallbackUrl,
  autoPlay = false,
  controls = true,
  className
}: SmartVideoPlayerProps) => {
  // Determine which player to load based on URL and provider
  const getPlayerComponent = () => {
    if (!streamUrl) {
      return DynamicFallbackVideoPlayer;
    }

    // HLS streams
    if (streamUrl.includes('.m3u8')) {
      return DynamicLiveStreamPlayer;
    }

    // External stream links
    if (streamUrl.startsWith('http') && !streamUrl.includes('.m3u8')) {
      return DynamicStreamLinkPlayer;
    }

    // Default fallback
    return DynamicSimpleHLSPlayer;
  };

  const PlayerComponent = getPlayerComponent();

  return (
    <PlayerComponent
      streamUrl={streamUrl}
      gameId={gameId}
      provider={provider}
      fallbackUrl={fallbackUrl}
      autoPlay={autoPlay}
      controls={controls}
      className={className}
    />
  );
};

/**
 * Preloader for critical live components
 * Call this function to preload components that will likely be used
 */
export const preloadLiveComponents = {
  async videoPlayers() {
    console.log('🚀 Preloading video player components...');
    const promises = [
      import('./LiveStreamPlayer'),
      import('./SimpleHLSPlayer'),
      import('./FallbackVideoPlayer')
    ];
    
    const results = await Promise.allSettled(promises);
    console.log(`✅ Video players preloaded: ${results.filter(r => r.status === 'fulfilled').length}/3`);
  },

  async gameStats() {
    console.log('🚀 Preloading game statistics components...');
    const promises = [
      import('./GameStatsComponent'),
      import('./GameStatsComponentFixed')
    ];
    
    const results = await Promise.allSettled(promises);
    console.log(`✅ Game stats preloaded: ${results.filter(r => r.status === 'fulfilled').length}/2`);
  },

  async providerConnectors() {
    console.log('🚀 Preloading provider connector components...');
    const promise = import('./ProviderGameConnector');
    
    try {
      await promise;
      console.log('✅ Provider connectors preloaded');
    } catch (error) {
      console.error('❌ Failed to preload provider connectors:', error);
    }
  },

  async all() {
    console.log('🚀 Preloading all live components...');
    await Promise.allSettled([
      this.videoPlayers(),
      this.gameStats(),
      this.providerConnectors()
    ]);
    console.log('✅ All live components preload completed');
  }
};

export default {
  DynamicLiveStreamPlayer,
  DynamicSimpleHLSPlayer,
  DynamicFallbackVideoPlayer,
  DynamicStreamLinkPlayer,
  DynamicGameStatsComponent,
  DynamicGameStatsComponentFixed,
  DynamicProviderGameConnector,
  SmartVideoPlayer,
  preloadLiveComponents
};