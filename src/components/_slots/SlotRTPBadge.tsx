import React from 'react';
import { Badge } from '@/components/ui/badge';
import { getRTPConfig } from '@/config/slotsConfig';

interface SlotRTPBadgeProps {
    rtp: number;
}

/**
 * Componente per il badge RTP con codice colore basato sulla percentuale
 */
export const SlotRTPBadge = React.memo(({ rtp }: SlotRTPBadgeProps) => {
    const rtpConfig = getRTPConfig(rtp);

    return (
        <div className="absolute top-3 right-3">
            <Badge
                variant="outline"
                className={`${rtpConfig.color} text-white text-xs backdrop-blur-sm`}
                title={`RTP ${rtpConfig.label}: ${rtp}%`}
            >
                RTP {rtp}%
            </Badge>
        </div>
    );
});

SlotRTPBadge.displayName = 'SlotRTPBadge';
