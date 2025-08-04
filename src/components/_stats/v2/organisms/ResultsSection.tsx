import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ProcessedGameResult } from '@/types/live-games';
import { ResultCard, PatternHistory } from '../molecules';
import { AnimatedSection } from '@/components/animations/AnimatedSection';
import { AnimatedGrid } from '@/components/animations/AnimatedGrid';
import { Activity, Clock } from 'lucide-react';

export interface ResultsSectionProps {
  results: ProcessedGameResult[];
  variant?: 'grid' | 'timeline' | 'cards' | 'mixed';
  maxResults?: number;
  className?: string;
  title?: string;
  showTitle?: boolean;
  showLatestHighlight?: boolean;
  showPatternHistory?: boolean;
  gridColumns?: 3 | 4 | 5 | 6;
  resultCardVariant?: 'compact' | 'detailed' | 'hero';
}

export function ResultsSection({
  results,
  variant = 'grid',
  maxResults = 20,
  className,
  title = 'Ultimi Risultati',
  showTitle = true,
  showLatestHighlight = true,
  showPatternHistory = true,
  gridColumns = 4,
  resultCardVariant = 'compact'
}: ResultsSectionProps) {
  const displayResults = results.slice(0, maxResults);
  const latestResult = results[0];

  const gridClasses = {
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-4 lg:grid-cols-5',
    6: 'grid-cols-3 md:grid-cols-4 lg:grid-cols-6'
  };

  if (variant === 'timeline') {
    return (
      <AnimatedSection delay={0.2} className={className}>
        <PatternHistory
          results={displayResults}
          maxResults={maxResults}
          variant="timeline"
          title={title}
          showTitle={showTitle}
        />
      </AnimatedSection>
    );
  }

  if (variant === 'cards') {
    return (
      <AnimatedSection delay={0.2} className={className}>
        <Card className="border-primary/20">
          {showTitle && (
            <CardHeader className="pb-3">
              <CardTitle className="font-tanker text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                {title}
              </CardTitle>
            </CardHeader>
          )}
          
          <CardContent>
            <AnimatedGrid 
              className={cn('grid gap-4', gridClasses[gridColumns])}
              staggerDelay={0.1}
            >
              {displayResults.map((result, index) => (
                <ResultCard
                  key={result.id}
                  result={result}
                  variant={resultCardVariant}
                  isLatest={index === 0}
                  showTime={true}
                  showLiveIndicator={index === 0}
                />
              ))}
            </AnimatedGrid>
          </CardContent>
        </Card>
      </AnimatedSection>
    );
  }

  if (variant === 'mixed') {
    return (
      <AnimatedSection delay={0.2} className={cn('space-y-6', className)}>
        {/* Latest Result Highlight */}
        {showLatestHighlight && latestResult && (
          <div>
            <h3 className="font-tanker text-lg mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Ultimo Risultato
            </h3>
            <ResultCard
              result={latestResult}
              variant="hero"
              isLatest={true}
              showTime={true}
              showLiveIndicator={true}
            />
          </div>
        )}

        {/* Results Grid */}
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="font-tanker text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Cronologia Risultati
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <AnimatedGrid 
              className={cn('grid gap-3', gridClasses[gridColumns])}
              staggerDelay={0.1}
            >
              {displayResults.slice(1, maxResults).map((result, index) => (
                <ResultCard
                  key={result.id}
                  result={result}
                  variant="compact"
                  isLatest={false}
                  showTime={false}
                  showLiveIndicator={false}
                />
              ))}
            </AnimatedGrid>
          </CardContent>
        </Card>

        {/* Pattern History */}
        {showPatternHistory && (
          <PatternHistory
            results={displayResults}
            maxResults={15}
            variant="compact"
            title="Pattern Recenti"
            showTitle={true}
          />
        )}
      </AnimatedSection>
    );
  }

  // Grid variant (default) - Following Jokerman79 homepage grid pattern
  return (
    <AnimatedSection delay={0.2} className={className}>
      <div className="space-y-6">
        {/* Latest Result Highlight */}
        {showLatestHighlight && latestResult && (
          <div>
            <h3 className="font-tanker text-lg mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Ultimo Risultato
            </h3>
            <ResultCard
              result={latestResult}
              variant="hero"
              isLatest={true}
              showTime={true}
              showLiveIndicator={true}
            />
          </div>
        )}

        {/* Main Results Grid - Following homepage slot grid pattern */}
        {displayResults.length > 1 && (
          <div>
            <h3 className="font-tanker text-lg mb-4 flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              {title}
            </h3>
            
            <AnimatedGrid 
              className={cn('grid gap-4', gridClasses[gridColumns])}
              staggerDelay={0.15}
            >
              {displayResults.slice(1).map((result, index) => (
                <ResultCard
                  key={result.id}
                  result={result}
                  variant={resultCardVariant}
                  isLatest={false}
                  showTime={true}
                  showLiveIndicator={false}
                />
              ))}
            </AnimatedGrid>
          </div>
        )}

        {/* Pattern History Compact */}
        {showPatternHistory && displayResults.length > 0 && (
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="font-tanker text-base">Pattern Recenti</CardTitle>
            </CardHeader>
            <CardContent>
              <PatternHistory
                results={displayResults}
                maxResults={20}
                variant="compact"
                showTitle={false}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </AnimatedSection>
  );
}