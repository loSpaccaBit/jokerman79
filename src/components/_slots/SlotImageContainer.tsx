import React from 'react';
import { AccessibleImage } from '@/components/shared/AccessibleImage';
import { SlotBadges } from './SlotBadges';
import { SlotRTPBadge } from './SlotRTPBadge';
import { SlotDemo } from '@/types/slots';

interface SlotImageContainerProps {
    slot: SlotDemo;
    containerClasses: string;
    imageSizes: string;
}

/**
 * Componente per l'immagine della slot con overlay e badge
 */
export const SlotImageContainer = React.memo(({
    slot,
    containerClasses,
    imageSizes
}: SlotImageContainerProps) => {
    if (!slot) return null;

    // Se non c'è immagine da Strapi, mostra placeholder
    if (!slot.image || slot.image.trim() === '') {
        return (
            <div className={`${containerClasses} bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center`}>
                <div className="text-center p-4">
                    <p className="text-sm text-muted-foreground">{slot.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{slot.provider}</p>
                </div>
                {/* Overlay gradiente */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
                    <SlotBadges slot={slot} />
                    <SlotRTPBadge rtp={slot.rtp || 0} />
                </div>
            </div>
        );
    }

    return (
        <div className={containerClasses}>
            <AccessibleImage
                src={slot.image} // SOLO immagini da Strapi
                alt={`${slot.name} - Slot demo gratuita del provider ${slot.provider}${slot.rtp ? ` con RTP ${slot.rtp}%` : ''}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes={imageSizes}
                priority={slot.isPopular} // Priorità per slot popolari
                loading={slot.isPopular ? 'eager' : 'lazy'}
            />

            {/* Overlay gradiente */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
                <SlotBadges slot={slot} />
                <SlotRTPBadge rtp={slot.rtp || 0} />
            </div>
        </div>
    );
});

SlotImageContainer.displayName = 'SlotImageContainer';
