import React, { useState, useEffect, useCallback } from 'react';
import { MinimalLiveStatsPage } from './minimal/MinimalLiveStatsPage';
import { useCasinoMicroservice } from '@/hooks/useCasinoMicroservice';
import { ProcessedGameResult, GameProvider } from '@/types/live-games';

interface GenericLiveStatsAdapterProps {
  gameId: string;
  gameName?: string;
  gameType?: string;
  provider?: GameProvider;
  streamingUrl?: string;
  className?: string;
}

export function GenericLiveStatsAdapter({
  gameId,
  gameName,
  gameType,
  provider = 'evolution',
  streamingUrl,
  className
}: GenericLiveStatsAdapterProps) {
  const [processedResults, setProcessedResults] = useState<ProcessedGameResult[]>([]);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>();
  const [hasSubscribed, setHasSubscribed] = useState(false);
  const [waitingForData, setWaitingForData] = useState(false);
  const [dataTimeout, setDataTimeout] = useState(false);

  // Auto-detect provider
  const detectedProvider: GameProvider = provider || (
    gameId.startsWith('pragmatic_') || /^\d+$/.test(gameId) ? 'pragmatic' : 'evolution'
  );

  // Casino microservice hook
  const {
    connected,
    gameUpdates,
    subscribeToGame,
    unsubscribeFromGame,
    globalLoading,
    isLoading
  } = useCasinoMicroservice();

  // Subscribe to game updates
  useEffect(() => {
    if (gameId && connected && !hasSubscribed) {
      console.log(`🎯 [Generic] Subscribing to ${detectedProvider} game: ${gameId}`);
      setHasSubscribed(true);
      setWaitingForData(true);
      setDataTimeout(false);
      subscribeToGame(gameId); // Fix: only pass gameId, not provider
      
      // Set timeout for data arrival (15 seconds)
      const timeoutId = setTimeout(() => {
        if (waitingForData) {
          console.warn(`⏰ [Generic] Data timeout for game ${gameId}`);
          setDataTimeout(true);
        }
      }, 15000);

      return () => {
        clearTimeout(timeoutId);
      };
    }
    return () => {
      if (gameId && hasSubscribed) {
        console.log(`🎯 [Generic] Unsubscribing from ${detectedProvider} game: ${gameId}`);
        unsubscribeFromGame(gameId); // Fix: only pass gameId, not provider
        setHasSubscribed(false);
        setWaitingForData(false);
        setDataTimeout(false);
      }
    };
  }, [gameId, connected, detectedProvider, subscribeToGame, unsubscribeFromGame, hasSubscribed, waitingForData]);

  // Universal data processor - finds ANY array in ANY structure with intelligent filtering
  const findAllArrays = useCallback((obj: any, path: string = '', depth: number = 0): any[] => {
    const results: any[] = [];
    
    // Prevent infinite recursion
    if (depth > 15) return results;
    
    if (!obj || typeof obj !== 'object') return results;

    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (Array.isArray(value)) {
        // ANY array with content is potentially a result array
        if (value.length > 0) {
          console.log(`🔍 [Generic] Found array at ${currentPath} with ${value.length} items:`, value);
          
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
          
          // Prioritize shorter arrays (results arrays usually aren't huge)
          if (value.length <= 50) arrayScore += 3;
          if (value.length <= 20) arrayScore += 2;
          
          // Process each item in the array with metadata
          const processedItems = value.map((item, index) => ({
            value: item,
            path: currentPath,
            index: index,
            timestamp: new Date().toISOString(),
            arrayScore: arrayScore,
            arrayLength: value.length
          }));
          
          results.push(...processedItems);
        }
      } else if (value && typeof value === 'object') {
        // Recursively search nested objects
        results.push(...findAllArrays(value, currentPath, depth + 1));
      }
    }
    
    // Sort results by score (highest first) to prioritize most likely result arrays
    return results.sort((a, b) => (b.arrayScore || 0) - (a.arrayScore || 0));
  }, []);

  // Universal value extractor - extracts meaningful values from ANY structure with advanced logic
  const extractMeaningfulValue = useCallback((item: any): string | number => {
    // Direct primitive values
    if (typeof item === 'string' && item.trim() !== '') {
      return item.trim();
    }
    if (typeof item === 'number' && !isNaN(item)) {
      return item;
    }
    
    // Object inspection with comprehensive field mapping
    if (item && typeof item === 'object' && !Array.isArray(item)) {
      // Priority 1: Direct result fields (highest priority)
      const resultFields = ['result', 'outcome', 'winner', 'value'];
      for (const field of resultFields) {
        const value = item[field];
        if (value !== undefined && value !== null && value !== '') {
          // If it's an object itself, extract from it
          if (typeof value === 'object') {
            const extracted = extractMeaningfulValue(value);
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
          return value;
        }
      }
      
      // Priority 3: Identifier fields
      const idFields = ['name', 'label', 'text', 'content', 'title', 'id'];
      for (const field of idFields) {
        const value = item[field];
        if (typeof value === 'string' && value.trim() !== '') {
          return value.trim();
        } else if (typeof value === 'number' && !isNaN(value)) {
          return value;
        }
      }
      
      // Priority 4: Any meaningful primitive field
      const entries = Object.entries(item);
      for (const [key, value] of entries) {
        // Skip metadata fields
        if (['timestamp', 'id', 'gameId', 'provider', 'type', 'data'].includes(key.toLowerCase())) {
          continue;
        }
        
        if (typeof value === 'string' && value.trim() !== '') {
          return value.trim();
        } else if (typeof value === 'number' && !isNaN(value)) {
          return value;
        }
      }
      
      // Priority 5: Nested object extraction (limited depth)
      for (const [key, value] of entries) {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          const extracted = extractMeaningfulValue(value);
          if (extracted !== 'Unknown' && String(extracted).trim() !== '') {
            return extracted;
          }
        }
      }
      
      // Priority 6: Array content (take first meaningful item)
      for (const [key, value] of entries) {
        if (Array.isArray(value) && value.length > 0) {
          const firstItem = value[0];
          if (typeof firstItem === 'string' || typeof firstItem === 'number') {
            return firstItem;
          }
        }
      }
    }
    
    // Handle arrays - take first meaningful value
    if (Array.isArray(item) && item.length > 0) {
      return extractMeaningfulValue(item[0]);
    }
    
    // Fallback: stringify but avoid unhelpful values
    const stringified = String(item);
    if (stringified === '[object Object]' || stringified === 'undefined' || stringified === 'null') {
      return 'Unknown';
    }
    
    return stringified;
  }, []);

  // Universal property detector
  const detectProperties = useCallback((item: any) => {
    const properties = {
      multiplier: undefined as number | undefined,
      bonus: false,
      special: false
    };

    if (item && typeof item === 'object') {
      // Multiplier detection - look for any numeric field that could be a multiplier
      const multiplierFields = ['multiplier', 'mult', 'x', 'times', 'factor', 'boost'];
      for (const field of multiplierFields) {
        const value = item[field];
        if (typeof value === 'number' && value > 1 && value <= 1000) { // reasonable multiplier range
          properties.multiplier = value;
          break;
        }
      }

      // Boolean flag detection
      const booleanFields = ['bonus', 'special', 'isBonus', 'isSpecial', 'free', 'wild'];
      for (const field of booleanFields) {
        if (item[field] === true) {
          if (field.includes('bonus') || field.includes('free') || field.includes('wild')) {
            properties.bonus = true;
          } else {
            properties.special = true;
          }
        }
      }
    }

    return properties;
  }, []);

  // Process any data structure into game results
  const processGenericResults = useCallback((rawData: any[]): ProcessedGameResult[] => {
    return rawData.map((item, index) => {
      const extractedValue = extractMeaningfulValue(item.value);
      const properties = detectProperties(item.value);
      
      const result: ProcessedGameResult = {
        id: `${gameId}-${item.path}-${item.index}-${Date.now()}-${index}`,
        result: extractedValue,
        timestamp: item.timestamp,
        bonus: properties.bonus,
        special: properties.special
      };

      if (properties.multiplier) {
        result.multiplier = properties.multiplier;
      }

      // Content-based detection as fallback
      const valueStr = String(extractedValue).toUpperCase();
      
      // Common bonus indicators
      const bonusPatterns = [
        'BONUS', 'FREE', 'WILD', 'JACKPOT', 'MEGA', 'SUPER', 'ULTRA',
        'CRAZY', 'DISCO', 'FUNKY', 'MONOPOLY', 'CASH', 'COIN', 'PACHINKO'
      ];
      
      // Common special indicators  
      const specialPatterns = [
        'SPECIAL', 'MAGIC', 'MYSTERY', 'SUGAR', 'BOMB', 'SCATTER'
      ];

      if (bonusPatterns.some(pattern => valueStr.includes(pattern))) {
        result.bonus = true;
      }
      
      if (specialPatterns.some(pattern => valueStr.includes(pattern))) {
        result.special = true;
      }

      console.log(`✨ [Generic] Processed result:`, result);
      return result;
    });
  }, [gameId, extractMeaningfulValue, detectProperties]);

  // Process updates
  useEffect(() => {
    if (gameUpdates.length === 0) return;

    const relevantUpdates = gameUpdates.filter(update => update.gameId === gameId);
    if (relevantUpdates.length === 0) return;

    // Process all updates
    const allFoundData: any[] = [];
    for (const update of relevantUpdates) {
      console.log(`🔄 [Generic] Processing update for ${gameId}:`, update.data);
      const foundArrays = findAllArrays(update.data);
      allFoundData.push(...foundArrays);
    }

    if (allFoundData.length > 0) {
      const newResults = processGenericResults(allFoundData);
      
      if (newResults.length > 0) {
        console.log(`📈 [Generic] Found ${newResults.length} potential results:`, newResults);
        
        // Enhanced result validation - filter out invalid and prioritize likely results
        const validResults = newResults.filter(result => {
          const value = String(result.result).trim();
          
          // Basic validity checks
          if (value === '' || value === 'Unknown' || value === 'undefined' || value === 'null') {
            return false;
          }
          
          // Length checks
          if (value.length > 100) return false; // Too long
          if (value.length < 1) return false; // Too short
          
          // Avoid obviously invalid values
          const invalidPatterns = [
            /^[{}\[\](),;:]+$/, // Only punctuation
            /^[\/\\]+$/, // Only slashes
            /^\d{13,}$/, // Very long numbers (probably timestamps)
            /^https?:\/\//, // URLs
            /^[a-f0-9]{32,}$/i, // Hash values
          ];
          
          if (invalidPatterns.some(pattern => pattern.test(value))) {
            return false;
          }
          
          // Prefer results from higher-scored arrays
          const minScore = Math.max(0, Math.max(...newResults.map(r => r.id.includes('arrayScore') ? 
            parseInt(r.id.split('-')[4]) || 0 : 0)) - 5);
          
          return true; // All checks passed
        });

        if (validResults.length > 0) {
          setProcessedResults(prev => {
            // Simple deduplication based on result value and recent timestamp
            const recentTimestamp = Date.now() - 5000; // 5 seconds ago
            const existingValues = new Set(
              prev
                .filter(r => new Date(r.timestamp).getTime() > recentTimestamp)
                .map(r => String(r.result))
            );
            
            const uniqueResults = validResults.filter(result => 
              !existingValues.has(String(result.result))
            );
            
            if (uniqueResults.length > 0) {
              console.log(`✅ [Generic] Adding ${uniqueResults.length} unique valid results`);
              setWaitingForData(false); // Data has arrived!
              const combined = [...uniqueResults, ...prev];
              return combined.slice(0, 100);
            }
            
            return prev;
          });
          
          setLastUpdateTime(new Date());
        }
      }
    }
  }, [gameUpdates, gameId, findAllArrays, processGenericResults]);

  // Show loader while initializing WebSocket
  if (globalLoading && !connected) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Connessione in corso...</p>
          {isLoading('initialization') && <p className="text-xs text-muted-foreground mt-2">Inizializzazione WebSocket</p>}
          {isLoading('providers') && <p className="text-xs text-muted-foreground mt-2">Caricamento providers</p>}
        </div>
      </div>
    );
  }

  // Show loader while waiting for game data
  if (connected && waitingForData && processedResults.length === 0) {
    if (dataTimeout) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-yellow-600 text-xl">⏰</span>
            </div>
            <p className="text-muted-foreground">Nessun dato ricevuto</p>
            <p className="text-xs text-muted-foreground mt-2">
              Game ID: {gameId} ({detectedProvider})
            </p>
            <p className="text-xs text-yellow-600 mt-2">
              Il gioco potrebbe non essere attivo al momento
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">In attesa di dati del gioco...</p>
          <p className="text-xs text-muted-foreground mt-2">
            Game ID: {gameId} ({detectedProvider})
          </p>
          {hasSubscribed && (
            <p className="text-xs text-success mt-1">✅ Iscritto agli aggiornamenti</p>
          )}
        </div>
      </div>
    );
  }

  // Pass everything to the minimal component with external results
  return (
    <MinimalLiveStatsPage
      gameId={gameId}
      gameName={gameName}
      gameType={gameType}
      provider={detectedProvider}
      streamingUrl={streamingUrl}
      className={className}
      externalResults={processedResults}
      externalLastUpdate={lastUpdateTime}
    />
  );
}