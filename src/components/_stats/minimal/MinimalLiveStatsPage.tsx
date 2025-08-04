import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { ProcessedGameResult, GameProvider, GameType } from '@/types/live-games';
import { useCasinoMicroservice } from '@/hooks/useCasinoMicroservice';
import { detectGameType } from '@/lib/game-renderers/game-renderer-factory';

// Minimal components
import { LiveGameHeader } from './LiveGameHeader';
import { CurrentGameStats } from './CurrentGameStats';
import { HistoricalStatsGrid } from './HistoricalStatsGrid';
import { LiveStreamPlayer } from '@/components/_live/LiveStreamPlayer';

interface MinimalLiveStatsPageProps {
  gameId: string;
  gameName?: string;
  gameType?: string;
  provider?: GameProvider;
  streamingUrl?: string;
  className?: string;
  externalResults?: ProcessedGameResult[]; // Allow external results to be passed in
  externalLastUpdate?: Date;
}

export function MinimalLiveStatsPage({
  gameId,
  gameName,
  gameType: providedGameType,
  provider = 'evolution',
  streamingUrl,
  className,
  externalResults,
  externalLastUpdate
}: MinimalLiveStatsPageProps) {
  const [processedResults, setProcessedResults] = useState<ProcessedGameResult[]>([]);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>();

  // Auto-detect provider
  const detectedProvider: GameProvider = provider || (
    gameId.startsWith('pragmatic_') || /^\d+$/.test(gameId) ? 'pragmatic' : 'evolution'
  );

  // Casino microservice hook
  const {
    connected,
    gameUpdates,
    subscribeToGame,
    unsubscribeFromGame
  } = useCasinoMicroservice();

  // Subscribe to game updates
  useEffect(() => {
    if (gameId && connected) {
      console.log(`🎯 Subscribing to ${detectedProvider} game: ${gameId}`);
      subscribeToGame(gameId);
    }
    return () => {
      if (gameId && connected) {
        console.log(`🎯 Unsubscribing from ${detectedProvider} game: ${gameId}`);
        unsubscribeFromGame(gameId);
      }
    };
  }, [gameId, connected, detectedProvider, subscribeToGame, unsubscribeFromGame]);

  // Enhanced universal data processor with intelligent scoring
  const findResultArrays = useCallback((obj: any, path: string = '', depth: number = 0): any[] => {
    const results: any[] = [];
    
    // Prevent infinite recursion
    if (depth > 15 || !obj || typeof obj !== 'object') return results;

    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (Array.isArray(value) && value.length > 0) {
        console.log(`🔍 Found array at ${currentPath} with ${value.length} items:`, value);
        
        // Score arrays based on how likely they are to contain game results
        let arrayScore = 0;
        
        // Higher score for arrays with result-like names
        const resultKeywords = ['result', 'history', 'game', 'outcome', 'winner', 'data', 'event'];
        if (resultKeywords.some(keyword => key.toLowerCase().includes(keyword))) {
          arrayScore += 10;
        }
        
        // Score based on array content
        const firstItem = value[0];
        if (typeof firstItem === 'string' || typeof firstItem === 'number') {
          arrayScore += 5; // Simple values often are results
        } else if (firstItem && typeof firstItem === 'object') {
          // Check if objects have result-like properties
          const itemKeys = Object.keys(firstItem);
          if (itemKeys.some(k => ['result', 'outcome', 'winner', 'value'].includes(k.toLowerCase()))) {
            arrayScore += 8;
          }
          arrayScore += 2; // Objects could be results
        }
        
        // Prioritize reasonable array sizes
        if (value.length <= 50) arrayScore += 3;
        if (value.length <= 20) arrayScore += 2;
        
        // Add all items from this array as potential results with metadata
        const flattenedResults = value.map((item, index) => ({
          originalItem: item,
          arrayPath: currentPath,
          arrayIndex: index,
          timestamp: new Date().toISOString(),
          arrayScore: arrayScore,
          arrayLength: value.length
        }));
        
        results.push(...flattenedResults);
      } else if (value && typeof value === 'object') {
        // Recursively search nested objects
        results.push(...findResultArrays(value, currentPath, depth + 1));
      }
    }
    
    // Sort by score to prioritize most likely result arrays
    return results.sort((a, b) => (b.arrayScore || 0) - (a.arrayScore || 0));
  }, []);

  // Enhanced universal result extractor with advanced field prioritization
  const extractResultValue = useCallback((item: any): string | number => {
    // Direct primitive values
    if (typeof item === 'string' && item.trim() !== '') {
      return item.trim();
    }
    if (typeof item === 'number' && !isNaN(item)) {
      return item;
    }
    
    // Object inspection with intelligent field prioritization
    if (item && typeof item === 'object' && !Array.isArray(item)) {
      // Priority 1: Direct result fields (highest priority)
      const resultFields = ['result', 'outcome', 'winner', 'value'];
      for (const field of resultFields) {
        const value = item[field];
        if (value !== undefined && value !== null && value !== '') {
          console.log(`🎯 Found result in priority field '${field}':`, value);
          // If nested object, extract recursively
          if (typeof value === 'object') {
            const extracted = extractResultValue(value);
            if (extracted !== 'Unknown') return extracted;
          } else {
            return value;
          }
        }
      }
      
      // Priority 2: Game-specific fields
      const gameFields = ['number', 'card', 'color', 'suit', 'segment', 'symbol'];
      for (const field of gameFields) {
        const value = item[field];
        if (value !== undefined && value !== null && value !== '') {
          console.log(`🎯 Found result in game field '${field}':`, value);
          return value;
        }
      }
      
      // Priority 3: Name/identifier fields
      const nameFields = ['name', 'label', 'text', 'content', 'title'];
      for (const field of nameFields) {
        const value = item[field];
        if (typeof value === 'string' && value.trim() !== '') {
          console.log(`🎯 Found result in name field '${field}':`, value);
          return value.trim();
        } else if (typeof value === 'number' && !isNaN(value)) {
          return value;
        }
      }
      
      // Priority 4: Any meaningful primitive field (excluding metadata)
      const entries = Object.entries(item);
      for (const [key, value] of entries) {
        // Skip obvious metadata fields
        if (['timestamp', 'id', 'gameId', 'provider', 'type', 'data', 'index'].includes(key.toLowerCase())) {
          continue;
        }
        
        if (typeof value === 'string' && value.trim() !== '') {
          console.log(`🎯 Found result in field '${key}':`, value);
          return value.trim();
        } else if (typeof value === 'number' && !isNaN(value)) {
          console.log(`🎯 Found result in field '${key}':`, value);
          return value;
        }
      }
      
      // Priority 5: Array content (take first meaningful item)
      for (const [key, value] of entries) {
        if (Array.isArray(value) && value.length > 0) {
          const firstItem = value[0];
          if (typeof firstItem === 'string' || typeof firstItem === 'number') {
            console.log(`🎯 Found result in array field '${key}':`, firstItem);
            return firstItem;
          }
        }
      }
    }
    
    // Handle arrays directly - take first meaningful value
    if (Array.isArray(item) && item.length > 0) {
      return extractResultValue(item[0]);
    }
    
    // Fallback: convert to string but avoid unhelpful values
    const stringified = String(item);
    if (stringified === '[object Object]' || stringified === 'undefined' || stringified === 'null') {
      return 'Unknown';
    }
    
    return stringified;
  }, []);

  const processGameResults = useCallback((rawResults: any[]): ProcessedGameResult[] => {
    return rawResults.map((resultData, index) => {
      const extractedResult = extractResultValue(resultData.originalItem);
      
      const processedResult: ProcessedGameResult = {
        id: `${gameId}-${resultData.arrayPath}-${resultData.arrayIndex}-${Date.now()}-${index}`,
        result: extractedResult,
        timestamp: resultData.timestamp,
        bonus: false,
        special: false
      };

      // Generic multiplier detection
      const originalItem = resultData.originalItem;
      if (originalItem && typeof originalItem === 'object') {
        // Look for multiplier in any field
        const multiplierFields = ['multiplier', 'mult', 'x', 'times', 'factor'];
        for (const field of multiplierFields) {
          if (originalItem[field] && typeof originalItem[field] === 'number' && originalItem[field] > 1) {
            processedResult.multiplier = originalItem[field];
            break;
          }
        }

        // Look for special/bonus flags
        const specialFields = ['special', 'bonus', 'isSpecial', 'isBonus'];
        for (const field of specialFields) {
          if (originalItem[field] === true) {
            if (field.includes('bonus')) {
              processedResult.bonus = true;
            } else {
              processedResult.special = true;
            }
          }
        }
      }

      // Generic special event detection based on result content
      const resultStr = String(extractedResult).toUpperCase();
      const bonusKeywords = ['BONUS', 'CRAZY', 'DISCO', 'FREE', 'WILD', 'JACKPOT'];
      const specialKeywords = ['SPECIAL', 'SUGAR', 'MAGIC', 'SUPER'];
      
      if (bonusKeywords.some(keyword => resultStr.includes(keyword))) {
        processedResult.bonus = true;
      }
      if (specialKeywords.some(keyword => resultStr.includes(keyword))) {
        processedResult.special = true;
      }

      console.log(`✅ Processed result:`, processedResult);
      return processedResult;
    });
  }, [gameId, extractResultValue]);

  // Use external results if provided, otherwise process incoming updates
  useEffect(() => {
    if (externalResults && externalResults.length > 0) {
      console.log(`📊 Using ${externalResults.length} external results`);
      setProcessedResults(externalResults);
      if (externalLastUpdate) {
        setLastUpdateTime(externalLastUpdate);
      }
      return;
    }

    // Only process game updates if no external results provided
    if (gameUpdates.length === 0) return;

    // Filter updates for our specific gameId
    const relevantUpdates = gameUpdates.filter(update => update.gameId === gameId);
    if (relevantUpdates.length === 0) return;

    // Process all relevant updates, not just the latest
    const allFoundArrays: any[] = [];
    for (const update of relevantUpdates) {
      console.log(`🔄 Processing update for ${gameId}:`, update.data);
      const foundArrays = findResultArrays(update.data);
      allFoundArrays.push(...foundArrays);
    }

    if (allFoundArrays.length > 0) {
      const newResults = processGameResults(allFoundArrays);
      
      if (newResults.length > 0) {
        console.log(`📈 Found ${newResults.length} new results:`, newResults);
        
        setProcessedResults(prev => {
          // Avoid duplicates by checking result value and timestamp similarity
          const existingResultValues = new Set(prev.map(r => `${r.result}-${Math.floor(new Date(r.timestamp).getTime() / 1000)}`));
          
          const uniqueNewResults = newResults.filter(newResult => {
            const resultKey = `${newResult.result}-${Math.floor(new Date(newResult.timestamp).getTime() / 1000)}`;
            return !existingResultValues.has(resultKey);
          });
          
          if (uniqueNewResults.length > 0) {
            console.log(`✅ Adding ${uniqueNewResults.length} unique results`);
            const combined = [...uniqueNewResults, ...prev];
            return combined.slice(0, 100); // Keep last 100 results
          }
          
          return prev;
        });
        setLastUpdateTime(new Date());
      }
    }
  }, [gameUpdates, gameId, findResultArrays, processGameResults, externalResults, externalLastUpdate]);

  // Determine game type
  const finalGameType = useMemo(() => {
    if (providedGameType) {
      return providedGameType.toUpperCase() as GameType;
    }
    return detectGameType(gameId, detectedProvider) || 'ROULETTE';
  }, [providedGameType, gameId, detectedProvider]);

  // Calculate current stats
  const latestResult = processedResults[0];
  const timeSinceLastResult = lastUpdateTime 
    ? Math.floor((Date.now() - lastUpdateTime.getTime()) / 1000)
    : undefined;

  // Calculate trend (simplified)
  const trend = useMemo(() => {
    if (processedResults.length < 2) return 'neutral';
    const recent = processedResults.slice(0, 5);
    const specialCount = recent.filter(r => r.bonus || r.special).length;
    return specialCount > 2 ? 'up' : specialCount === 0 ? 'down' : 'neutral';
  }, [processedResults]);

  return (
    <div className={cn('min-h-screen bg-background', className)}>
      {/* Header - Fixed positioning for better UX */}
      <div className="sticky top-0 z-40 sticky-header">
        <div className="max-w-7xl mx-auto p-4">
          <LiveGameHeader
            gameId={gameId}
            gameName={gameName}
            gameType={finalGameType}
            isLive={connected && processedResults.length > 0}
            playerCount={undefined} // Will be added when available from microservice
            lastUpdate={lastUpdateTime}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Primary Section: Stream + Current Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stream Player - Takes 2/3 on desktop */}
          {streamingUrl && (
            <div className="lg:col-span-2">
              <LiveStreamPlayer
                streamUrl={streamingUrl}
                title={gameName || `Gioco ${gameId}`}
              />
            </div>
          )}

          {/* Current Game Stats - Takes 1/3 on desktop, full on mobile */}
          <div className={cn(
            streamingUrl ? "lg:col-span-1" : "lg:col-span-3"
          )}>
            <CurrentGameStats
              latestResult={latestResult?.result}
              roundId={latestResult?.id}
              timeSinceLastResult={timeSinceLastResult}
              trend={trend}
              multiplier={latestResult?.multiplier}
              isSpecial={latestResult?.bonus || latestResult?.special}
            />
          </div>
        </div>

        {/* Secondary Section: Historical Data */}
        {processedResults.length > 0 ? (
          <HistoricalStatsGrid results={processedResults} />
        ) : (
          /* Empty State - Following Jokerman79 pattern */
          <div className="text-center py-16 space-y-4">
            <div className="text-6xl mb-4 opacity-20">🎯</div>
            <h3 className="font-tanker text-2xl text-muted-foreground">
              In attesa di dati live...
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              I risultati appariranno qui non appena il tavolo sarà attivo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}