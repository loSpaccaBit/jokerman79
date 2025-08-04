'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';
// Hooks
import { useLiveGamesGraphQL } from '@/hooks/useLiveGamesGraphQL';

// Components
import { GenericLiveStatsAdapter } from '@/components/_stats/GenericLiveStatsAdapter';

export default function LiveGamePage() {
    const params = useParams();
    const gameId = params.gameId as string;

    // Data fetching da Strapi per stream URL
    const { games, loading: gamesLoading } = useLiveGamesGraphQL();

    // Trova il gioco corrente da Strapi
    const game = useMemo(() => {
        return games?.find(g => g.gameId === gameId);
    }, [games, gameId]);

    return (
        <div className="min-h-screen p-4">
            <div>
                <GenericLiveStatsAdapter
                    gameId={gameId}
                    gameName={game?.name}
                    gameType={game?.gameType}
                    provider={gameId?.provider}
                    streamingUrl={game?.streamingUrl}
                />
            </div>
        </div>
    );
}