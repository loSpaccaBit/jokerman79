"use client";

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { SlotImageContainer } from './SlotImageContainer';
import { SlotFeatures } from './SlotFeatures';
import { SlotGridInfo } from './SlotGridInfo';
import { SlotActionButton } from './SlotActionButton';
import { useSlotCardLogic } from '@/hooks/useSlotCardLogic';
import { SlotDemo } from '@/types/slots';

interface SlotDemoCardProps {
    variant?: 'full' | 'grid';
    slot: SlotDemo;
}

/**
 * Componente card ottimizzato per visualizzare le informazioni di una slot demo
 * Supporta due varianti: full (dettagliata) e grid (compatta)
 */
const SlotDemoCard = React.memo(({ variant = 'full', slot }: SlotDemoCardProps) => {
    // Chiama sempre l'hook prima di qualsiasi return
    const {
        isGrid,
        imageSizes,
        cardClasses,
        imageContainerClasses,
        contentClasses,
        titleClasses,
        descriptionClasses,
        visibleFeatures,
        remainingFeaturesCount,
        detailUrl
    } = useSlotCardLogic(slot, variant);

    // Guard per slot undefined
    if (!slot) {
        return (
            <div
                className="h-64 bg-muted rounded-lg flex items-center justify-center"
                role="status"
                aria-label="Slot non disponibile"
            >
                <p className="text-muted-foreground">Slot non disponibile</p>
            </div>
        );
    }

    return (
        <Link
            href={detailUrl}
            className="group"
            aria-label={`Vai alla demo di ${slot.name} di ${slot.provider}`}
        >
            <Card className={cardClasses}>
                {/* Contenitore immagine con overlay */}
                <SlotImageContainer
                    slot={slot}
                    containerClasses={imageContainerClasses}
                    imageSizes={imageSizes}
                />

                {/* Contenuto principale */}
                <CardContent className={contentClasses}>
                    {/* Titolo */}
                    <CardTitle className={titleClasses}>
                        {slot.name || 'Slot Demo'}
                    </CardTitle>

                    {/* Descrizione */}
                    <p className={descriptionClasses}>
                        {slot.description || 'Descrizione non disponibile'}
                    </p>

                    {/* Informazioni aggiuntive per variant grid */}
                    {isGrid && (
                        <SlotGridInfo
                            volatility={slot.volatility || 'medium'}
                            paylines={slot.paylines || 0}
                        />
                    )}

                    {/* Features per variant full */}
                    <SlotFeatures
                        features={slot.features || []}
                        visibleFeatures={visibleFeatures}
                        remainingCount={remainingFeaturesCount}
                        isGrid={isGrid}
                    />
                </CardContent>

                {/* Pulsante azione (solo in variant full) */}
                <SlotActionButton
                    isGrid={isGrid}
                    slotName={slot.name || 'Slot Demo'}
                />
            </Card>
        </Link>
    );
});

SlotDemoCard.displayName = 'SlotDemoCard';

export default SlotDemoCard;