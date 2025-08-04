import React from 'react';
import { ProcessedGameResult, GameType } from '@/types/live-games';
import { 
  LiveStatsV2,
  GamePageTemplate,
  LiveStatsHeader,
  ResultsSection,
  AnalyticsSection,
  ResultCard,
  StatsGrid,
  QuickStats,
  GameHeader,
  PatternHistory,
  ResultDisplay,
  StatCounter,
  LiveIndicator,
  TimeBadge,
  GameTypeIcon
} from '../index';

// Example data for testing
const mockResults: ProcessedGameResult[] = [
  {
    id: '1',
    result: '32',
    timestamp: new Date().toISOString(),
    multiplier: 2,
    bonus: false,
    special: false
  },
  {
    id: '2', 
    result: '0',
    timestamp: new Date(Date.now() - 30000).toISOString(),
    bonus: false,
    special: true
  },
  {
    id: '3',
    result: 'CRAZY',
    timestamp: new Date(Date.now() - 60000).toISOString(),
    bonus: true,
    special: false,
    multiplier: 5
  }
];

// Example 1: Simple Full Page Usage
export function SimpleGamePage() {
  return (
    <LiveStatsV2
      gameType="ROULETTE"
      results={mockResults}
      gameStats={{
        isTableOpen: true,
        playerCount: 142,
        isLive: true
      }}
      layout="hero"
      customTitle="Roulette Europea Live"
    />
  );
}

// Example 2: Custom Layout with Individual Components
export function CustomGamePage() {
  return (
    <div className="p-6 space-y-6">
      <LiveStatsHeader
        gameType="CRAZYTIME"
        isTableOpen={true}
        playerCount={89}
        totalUpdates={mockResults.length}
        lastUpdate={new Date()}
        specialEvents={2}
        isLive={true}
        variant="hero"
        customTitle="Crazy Time Studio 1"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ResultsSection
            results={mockResults}
            variant="mixed"
            maxResults={15}
            showLatestHighlight={true}
            showPatternHistory={true}
          />
        </div>
        
        <div>
          <AnalyticsSection
            results={mockResults}
            gameType="CRAZYTIME"
            variant="compact"
          />
        </div>
      </div>
    </div>
  );
}

// Example 3: Minimal Dashboard
export function MinimalDashboard() {
  return (
    <GamePageTemplate
      gameType="LIGHTNING_ROULETTE"
      results={mockResults}
      layout="minimal"
      showAnalytics={false}
    />
  );
}

// Example 4: Individual Atomic Components
export function AtomicComponentsShowcase() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <GameTypeIcon gameType="ROULETTE" size="lg" variant="filled" showLabel />
        <LiveIndicator status="live" variant="detailed" lastUpdate={new Date()} />
        <TimeBadge timestamp={new Date()} variant="relative" />
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCounter
          value={142}
          label="Giocatori"
          variant="primary"
          icon={undefined}
          trend="up"
        />
        <StatCounter
          value="89%"
          label="Uptime"
          variant="success"
          trend="neutral"
        />
      </div>

      <div className="flex gap-4">
        <ResultDisplay
          result="32"
          size="lg"
          variant="highlighted"
          multiplier={2}
          isLatest={true}
          timestamp={new Date()}
        />
        <ResultDisplay
          result="0"
          size="lg"
          variant="default"
          showIcon={true}
          icon="⭐"
        />
      </div>
    </div>
  );
}

// Example 5: Molecular Components
export function MolecularComponentsShowcase() {
  return (
    <div className="p-6 space-y-6">
      <GameHeader
        gameType="SWEETBONANZA"
        isTableOpen={true}
        playerCount={67}
        totalUpdates={mockResults.length}
        lastUpdate={new Date()}
        variant="hero"
        showAvatar={true}
      />

      <QuickStats
        totalResults={mockResults.length}
        playerCount={67}
        lastUpdate={new Date()}
        isLive={true}
        specialEvents={2}
        variant="horizontal"
        size="md"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mockResults.map((result) => (
          <ResultCard
            key={result.id}
            result={result}
            variant="detailed"
            isLatest={result.id === '1'}
            showTime={true}
            showLiveIndicator={result.id === '1'}
          />
        ))}
      </div>

      <PatternHistory
        results={mockResults}
        variant="timeline"
        maxResults={10}
        showTitle={true}
      />

      <StatsGrid
        title="Game Statistics"
        stats={[
          { key: 'total', value: 45, label: 'Total Spins', variant: 'default' },
          { key: 'bonus', value: 3, label: 'Bonus Rounds', variant: 'primary' },
          { key: 'sugar', value: 8, label: 'Sugar Bombs', variant: 'success' }
        ]}
        columns={3}
        size="md"
      />
    </div>
  );
}

// Example 6: Different Layout Variants
export function LayoutVariants() {
  const layouts: Array<'default' | 'hero' | 'minimal' | 'dashboard'> = 
    ['default', 'hero', 'minimal', 'dashboard'];

  return (
    <div className="space-y-12">
      {layouts.map((layout) => (
        <div key={layout} className="border rounded-lg p-4">
          <h3 className="font-tanker text-xl mb-4 capitalize">{layout} Layout</h3>
          <GamePageTemplate
            gameType="DRAGONTIGER"
            results={mockResults}
            layout={layout}
            showAnalytics={layout !== 'minimal'}
            customTitle={`Dragon Tiger - ${layout} Style`}
          />
        </div>
      ))}
    </div>
  );
}

// Example 7: Game Type Specific Configurations
export function GameTypeSpecific() {
  const gameTypes: GameType[] = ['ROULETTE', 'CRAZYTIME', 'SWEETBONANZA', 'DRAGONTIGER'];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      {gameTypes.map((gameType) => (
        <div key={gameType} className="border rounded-lg p-4">
          <LiveStatsV2
            gameType={gameType}
            results={mockResults}
            layout="default"
            customTitle={`${gameType} Demo`}
            gameStats={{
              isTableOpen: true,
              playerCount: Math.floor(Math.random() * 200),
              isLive: true
            }}
          />
        </div>
      ))}
    </div>
  );
}