"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ProviderBonus } from "@/types/bonus";

interface BonusCardProps {
    variant?: "full" | "grid";
    bonus: ProviderBonus; // OBBLIGATORIO - nessun dato mock!
}

export function BonusCard({ variant = "full", bonus }: BonusCardProps) {
    const isGrid = variant === "grid";

    // Guard per bonus undefined - non dovrebbe mai succedere
    if (!bonus) {
        return (
            <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Bonus non disponibile</p>
            </div>
        );
    }

    const bonusData = bonus;

    const getTypeLabel = (type: string) => {
        const labels = {
            'welcome': 'Benvenuto',
            'deposit': 'Deposito',
            'free-spins': 'Free Spins',
            'cashback': 'Cashback',
            'loyalty': 'Fedeltà',
            'tournament': 'Torneo'
        };
        return labels[type as keyof typeof labels] || type;
    };

    const isExpired = bonusData.validUntil ? new Date(bonusData.validUntil) < new Date() : false;

    return (
        <Card className={`overflow-hidden hover:shadow-lg transition-all duration-300 ${isGrid ? 'h-full flex flex-col hover:scale-[1.02]' : ''
            } ${isExpired ? 'opacity-60' : ''}`}>
            <CardHeader className={isGrid ? "pb-3 px-4 pt-4" : "pb-4"}>
                <div className="flex items-center justify-between">
                    <CardTitle className={`font-bold leading-tight ${isGrid ? "text-lg md:text-xl" : "text-xl md:text-2xl lg:text-3xl"
                        }`}>
                        {bonusData.title}
                    </CardTitle>
                    {/* Badge solo per bonus esclusivi */}
                    {bonusData.isExclusive && (
                        <Badge variant="secondary" className={`font-tanker ${isGrid ? "text-xs" : "text-sm md:text-base"
                            }`}>
                            🌟 Esclusivo
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent className={`${isGrid ? 'flex-1 px-4 space-y-3' : 'space-y-6'}`}>
                <div className={`flex gap-4 items-start ${isGrid ? 'flex-col' : 'flex-col gap-6'
                    }`}>
                    {/* Immagine */}
                    <div className={`flex-shrink-0 ${isGrid
                        ? 'w-full h-24'
                        : 'w-full md:w-40 lg:w-44'
                        }`}>
                        <div className={`relative bg-transparent border border-gray-200/30 dark:border-gray-600/30 rounded-lg overflow-hidden p-4 backdrop-blur-sm ${isGrid ? 'h-full' : 'aspect-square'
                            }`}>
                            {bonusData.provider?.logo && bonusData.provider.logo.trim() !== '' ? (
                                <Image
                                    src={bonusData.provider.logo}
                                    alt={`Bonus ${bonusData.provider?.name || 'Casino'}`}
                                    fill
                                    className="object-contain p-2 filter drop-shadow-md"
                                    sizes={isGrid
                                        ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        : "(max-width: 768px) 100vw, (max-width: 1024px) 160px, 176px"
                                    }
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <p className="text-center text-sm font-semibold text-primary bg-primary/10 px-3 py-2 rounded-md backdrop-blur-sm">
                                        {bonusData.provider?.name || 'Casino'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={`flex-1 w-full ${isGrid ? 'space-y-3' : 'space-y-4'}`}>
                        <div className={`${!isGrid ? 'flex-1' : ''}`}>
                            <div className={isGrid ? "space-y-1" : "space-y-2"}>
                                <h3 className={`font-tanker text-primary leading-tight ${isGrid ? "text-xl md:text-2xl" : "text-2xl md:text-3xl lg:text-4xl"
                                    }`}>
                                    {bonusData.amount}
                                </h3>
                                {isExpired && (
                                    <p className="text-red-500 font-medium text-sm md:text-base">
                                        Bonus Scaduto
                                    </p>
                                )}
                            </div>

                            {/* Descrizione bonus */}
                            <div className={`bg-accent/30 rounded-lg border border-accent ${isGrid ? 'p-3 mt-3' : 'p-4 mt-4'
                                }`}>
                                <h4 className={`font-tanker text-accent-foreground mb-2 leading-tight ${isGrid ? 'text-base md:text-lg' : 'text-xl md:text-2xl'
                                    }`}>
                                    {bonusData.provider?.name || 'Casino Online'}
                                </h4>
                                <p className={`text-accent-foreground font-medium leading-relaxed ${isGrid ? 'text-sm md:text-base' : 'text-base md:text-lg lg:text-xl'
                                    }`}>
                                    {bonusData.description}
                                </p>
                            </div>

                            {/* Terms and Conditions */}
                            <div className={`space-y-2 ${isGrid ? 'text-xs md:text-sm mt-3' : 'text-sm md:text-base mt-4'} text-muted-foreground leading-relaxed`}>
                                {bonusData.code && <p className="font-medium">Codice: <span className="font-mono font-semibold text-foreground">{bonusData.code}</span></p>}
                                {bonusData.terms && bonusData.terms.length > 0 && (
                                    <div className="space-y-1">
                                        {bonusData.terms.slice(0, isGrid ? 2 : 4).map((term, index) => (
                                            <p key={index} className={`${isGrid ? 'text-xs' : 'text-sm'} leading-relaxed`}>{term}</p>
                                        ))}
                                        {bonusData.terms.length > (isGrid ? 2 : 4) && (
                                            <p className={`${isGrid ? 'text-xs' : 'text-sm'} font-medium text-primary`}>
                                                +{bonusData.terms.length - (isGrid ? 2 : 4)} altri termini
                                            </p>
                                        )}
                                    </div>
                                )}
                                {bonusData.validUntil && !isExpired && (
                                    <p className="font-medium">Valido fino al: <span className="text-foreground">{new Date(bonusData.validUntil).toLocaleDateString('it-IT')}</span></p>
                                )}
                            </div>

                            {/* Features compatte solo in grid */}
                            {isGrid && (
                                <div className="flex flex-wrap gap-2 mt-4">
                                    <Badge variant="outline" className="text-xs md:text-sm px-2 py-1 font-medium">
                                        AAMS
                                    </Badge>
                                    <Badge variant="outline" className="text-xs md:text-sm px-2 py-1 font-medium">
                                        {bonusData.isActive ? 'Attivo' : 'Non Attivo'}
                                    </Badge>
                                </div>
                            )}
                        </div>

                        {/* Bottoni per variant full - direttamente nel contenuto */}
                        {!isGrid && (
                            <div className="mt-6 w-full">
                                <div className="flex flex-col gap-4 w-full">
                                    <Button
                                        size="lg"
                                        className="font-satoshi touch-manipulation w-full h-12 text-base md:text-lg"
                                        onClick={() => window.open(bonusData.url, '_blank')}
                                        disabled={isExpired || !bonusData.isActive}
                                    >
                                        {isExpired ? 'Bonus Scaduto' : 'Richiedi Bonus'}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="font-satoshi touch-manipulation w-full h-12 text-base md:text-lg"
                                    >
                                        Leggi Recensione
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>

            {/* Bottoni solo per variant grid - Senza CardAction per evitare interferenze */}
            {isGrid && (
                <div className="mt-auto px-4 pb-4 pt-3 w-full">
                    <div className="flex flex-col gap-3 w-full">
                        <Button
                            size="default"
                            className="font-satoshi touch-manipulation w-full h-10 text-sm md:text-base"
                            onClick={() => window.open(bonusData.url, '_blank')}
                            disabled={isExpired || !bonusData.isActive}
                        >
                            {isExpired ? 'Bonus Scaduto' : 'Richiedi Bonus'}
                        </Button>
                        <Button
                            variant="outline"
                            size="default"
                            className="font-satoshi touch-manipulation w-full h-10 text-sm md:text-base"
                        >
                            Leggi Recensione
                        </Button>
                    </div>
                </div>
            )}
        </Card>
    );
}