import { memo } from 'react';
import { SlotDemo } from '@/types/slots';

interface GenericSlotsGridProps {
    slots: SlotDemo[];
    renderCard: (slot: SlotDemo) => React.ReactNode;
    className?: string;
    cardGap?: 'sm' | 'md' | 'lg';
}

const gapClasses = {
    sm: 'gap-3',
    md: 'gap-4 sm:gap-6',
    lg: 'gap-6 sm:gap-8'
};

export const GenericSlotsGrid = memo<GenericSlotsGridProps>(function GenericSlotsGrid({
    slots,
    renderCard,
    className = "",
    cardGap = 'md'
}) {
    return (
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${gapClasses[cardGap]} ${className}`}>
            {slots.map(renderCard)}
        </div>
    );
});
