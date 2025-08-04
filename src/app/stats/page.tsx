"use client"

import { useMemo, useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Activity, Clock } from 'lucide-react';
import { HeroSection } from "@/components/layout/HeroSectionSearchBar";
import { PaginationSEO } from "@/components/seo/PaginationSEO";
import { SEOBreadcrumb } from "@/components/seo/SEOBreadcrumb";
import { useLiveGamesGraphQL } from '@/hooks/useLiveGamesGraphQL';
import { LiveGameCard } from '@/components/_stats/LiveGameCardFromStats';

function StatsContent() {
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Usa il hook GraphQL invece di fetch
    const {
        games,
        loading,
        error: gqlError
    } = useLiveGamesGraphQL({ autoFetch: true });

    const error = gqlError ? 'Impossibile caricare i giochi. Riprova più tardi.' : null;

    // Filtro dei giochi basato sulla ricerca
    const filteredGames = useMemo(() => {
        if (!searchQuery.trim()) return games;

        const query = searchQuery.toLowerCase();
        return games.filter(game =>
            game.name.toLowerCase().includes(query) ||
            game.category.toLowerCase().includes(query) ||
            game.gameType.toLowerCase().includes(query) ||
            (game.description && game.description.toLowerCase().includes(query))
        );
    }, [games, searchQuery]);

    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query);
    }, []);

    // Configurazione breadcrumb
    const breadcrumbItems = [
        { href: '/', label: 'Home' },
        { href: '/stats', label: 'Live Stats', isCurrentPage: true }
    ];

    const currentPage = 1;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://jokerman79.com';

    const getPageTitle = () => `Live Stats | ${filteredGames.length} Giochi Attivi`;
    const getPageDescription = () =>
        `Monitora ${filteredGames.length} giochi live in tempo reale. Risultati aggiornati istantaneamente via WebSocket da Pragmatic Play ed Evolution Gaming.`;

    return (
        <>
            {/* SEO Head Tags */}
            <PaginationSEO
                currentPage={currentPage}
                totalPages={1}
                baseUrl={baseUrl}
                title={getPageTitle()}
                description={getPageDescription()}
                itemType="statistiche live"
                totalItems={filteredGames.length}
            />

            {/* Main Layout */}
            <div className="min-h-screen bg-background">
                {/* Hero Section con SearchBar */}
                <HeroSection
                    title="Statistiche Live"
                    description="Risultati dei giochi live in tempo reale"
                    onSearch={handleSearch}
                    searchPlaceholder="Cerca giochi live..."
                    imageSrc="/assets/aimg/stats_avatar.png"
                    imageAlt="Slot Avatar"
                />

                {/* Breadcrumb */}
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 pt-4">
                    <SEOBreadcrumb items={breadcrumbItems} />
                </div>

                {/* Statistiche generali */}
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4">


                    {/* Content */}
                    {loading ? (
                        <div className="bg-card rounded-lg border shadow-sm p-6 sm:p-8 text-center">
                            <Activity className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50 animate-spin" />
                            <h3 className="text-base sm:text-lg font-medium mb-2">Caricamento giochi...</h3>
                            <p className="text-sm sm:text-base text-muted-foreground">
                                Recupero l&apos;elenco dei giochi disponibili
                            </p>
                        </div>
                    ) : error ? (
                        <div className="bg-card rounded-lg border shadow-sm p-6 sm:p-8 text-center">
                            <Clock className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50 text-red-500" />
                            <h3 className="text-base sm:text-lg font-medium mb-2">Errore caricamento</h3>
                            <p className="text-sm sm:text-base text-muted-foreground mb-4">
                                {error}
                            </p>
                            <Button onClick={() => window.location.reload()}>
                                Riprova
                            </Button>
                        </div>
                    ) : filteredGames.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                            {filteredGames.map((game) => (
                                <LiveGameCard key={game.gameId} game={game} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-card rounded-lg border shadow-sm p-6 sm:p-8 text-center">
                            <Clock className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                            <h3 className="text-base sm:text-lg font-medium mb-2">
                                {searchQuery ? 'Nessun risultato trovato' : 'Nessun gioco disponibile'}
                            </h3>
                            <p className="text-sm sm:text-base text-muted-foreground">
                                {searchQuery ?
                                    `Nessun gioco corrisponde alla ricerca "${searchQuery}".` :
                                    'Non ci sono giochi live configurati al momento.'
                                }
                            </p>
                            {searchQuery && (
                                <Button
                                    variant="outline"
                                    onClick={() => setSearchQuery('')}
                                    className="mt-3"
                                >
                                    Cancella ricerca
                                </Button>
                            )}
                        </div>
                    )}

                    {/* Footer info */}
                    <div className="mt-8 sm:mt-12 text-center text-xs text-muted-foreground">
                        <p>I dati sono aggiornati in tempo reale tramite WebSocket • Powered by Pragmatic Play & Evolution Gaming</p>
                    </div>
                </div>
            </div>
        </>
    );
}

// Componente wrapper
export default function StatsPage() {
    return <StatsContent />;
}