import React from 'react';
import { Badge } from '@/components/ui/badge';

interface SlotFeaturesProps {
    features: string[];
    visibleFeatures: string[];
    remainingCount: number;
    isGrid: boolean;
}

/**
 * Componente per visualizzare le features della slot
 */
export const SlotFeatures = React.memo(({
    features,
    visibleFeatures,
    remainingCount,
    isGrid
}: SlotFeaturesProps) => {
    if (isGrid || features.length === 0) return null;

    return (
        <div className="mt-4">
            <div className="flex flex-wrap gap-2">
                {visibleFeatures.map((feature, index) => (
                    <Badge
                        key={`${feature}-${index}`}
                        variant="outline"
                        className="text-xs hover:bg-muted transition-colors"
                    >
                        {feature}
                    </Badge>
                ))}
                {remainingCount > 0 && (
                    <Badge
                        variant="outline"
                        className="text-xs opacity-70"
                    >
                        +{remainingCount} altro{remainingCount > 1 ? 'e' : ''}
                    </Badge>
                )}
            </div>
        </div>
    );
});

SlotFeatures.displayName = 'SlotFeatures';
