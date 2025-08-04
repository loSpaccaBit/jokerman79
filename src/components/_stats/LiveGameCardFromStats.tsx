"use client"

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Activity } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { LiveGame } from '@/hooks/useLiveGamesGraphQL';

interface LiveGameCardProps {
    game: LiveGame;
}

export function LiveGameCard({ game }: LiveGameCardProps) {
    return (
        <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border hover:border-primary/50">
            <CardContent className="p-0">
                {/* Immagine del gioco */}
                <div className="relative aspect-[4/3] bg-gradient-to-br from-muted/50 to-muted overflow-hidden">
                    {game.image?.url ? (
                        <Image
                            src={game.image.url.startsWith('http') ? game.image.url : `${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}${game.image.url}`}
                            alt={game.image.alternativeText || game.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/20">
                            <div className="text-center text-primary/60">
                                <div className="text-4xl mb-2">🎮</div>
                                <div className="text-sm font-medium">{game.name}</div>
                            </div>
                        </div>
                    )}
                    
                    {/* Status badge */}
                    <div className="absolute top-2 right-2">
                        <Badge 
                            variant={game.isActive ? "default" : "secondary"}
                            className={`text-xs ${game.isActive ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500'}`}
                        >
                            {game.isActive ? (
                                <>
                                    <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
                                    LIVE
                                </>
                            ) : (
                                'OFFLINE'
                            )}
                        </Badge>
                    </div>

                    {/* Provider badge */}
                    <div className="absolute top-2 left-2">
                        <Badge variant="outline" className="text-xs bg-background/80 backdrop-blur-sm">
                            {game.provider?.toUpperCase() || 'PRAGMATIC'}
                        </Badge>
                    </div>
                </div>

                {/* Contenuto */}
                <div className="p-4 space-y-3">
                    {/* Nome del gioco */}
                    <div>
                        <h3 className="font-semibold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                            {game.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                                {game.category}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                                {game.gameType}
                            </Badge>
                        </div>
                    </div>

                    {/* Descrizione breve */}
                    {game.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                            {game.description}
                        </p>
                    )}

                    {/* Info rapide */}
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Tavoli:</span>
                        <span className="font-medium">{game.tableIds?.length || 0}</span>
                    </div>

                    {/* Azioni */}
                    <div className="pt-2">
                        <Button asChild className="w-full" size="sm">
                            <Link href={`/stats/live/${game.gameId}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                Visualizza Live
                            </Link>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
