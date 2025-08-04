import React from 'react';
import { Badge } from '@/components/ui/badge';
import { SlotDemo } from '@/types/slots';

interface SlotBadgesProps {
    slot: SlotDemo;
}

/**
 * Componente per renderizzare i badge della slot (NEW, HOT, Provider)
 */
export const SlotBadges = React.memo(({ slot }: SlotBadgesProps) => {
    if (!slot) return null;

    return (
        <div className="absolute top-3 left-3 flex gap-2">
            {slot.isNew && (
                <Badge className="bg-red-500 hover:bg-red-600 text-white font-tanker text-xs">
                    NEW
                </Badge>
            )}
            {slot.isPopular && (
                <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black font-tanker text-xs">
                    🔥 HOT
                </Badge>
            )}
            <Badge variant="secondary" className="text-xs">
                {slot.provider || 'Unknown'}
            </Badge>
        </div>
    );
});

SlotBadges.displayName = 'SlotBadges';
