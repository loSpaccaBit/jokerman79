import React from 'react';
import { VOLATILITY_CONFIG, formatPaylines } from '@/config/slotsConfig';

interface SlotGridInfoProps {
    volatility: 'low' | 'medium' | 'high';
    paylines: number;
}

/**
 * Componente per informazioni aggiuntive nel layout grid
 */
export const SlotGridInfo = React.memo(({ volatility, paylines }: SlotGridInfoProps) => {
    const volatilityConfig = VOLATILITY_CONFIG[volatility];
    const paylinesDisplay = formatPaylines(paylines);

    return (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span
                className="flex items-center gap-1"
                title={volatilityConfig.description}
            >
                {volatilityConfig.emoji}
                <span>Volatilità: {volatilityConfig.label}</span>
            </span>
            <span>{paylinesDisplay}</span>
        </div>
    );
});

SlotGridInfo.displayName = 'SlotGridInfo';
