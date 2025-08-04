import React from 'react';
import { CardAction } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface SlotActionButtonProps {
    isGrid: boolean;
    slotName: string;
}

/**
 * Componente per il pulsante di azione (solo nel layout full)
 */
export const SlotActionButton = React.memo(({ isGrid, slotName }: SlotActionButtonProps) => {
    if (isGrid) return null;

    return (
        <CardAction className="px-6 pb-6">
            <Button
                className="w-full h-12 font-medium text-base hover:scale-[1.02] transition-transform"
                aria-label={`Gioca gratis a ${slotName}`}
            >
                🎰 Gioca Gratis
            </Button>
        </CardAction>
    );
});

SlotActionButton.displayName = 'SlotActionButton';
