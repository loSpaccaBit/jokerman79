import { StatsCard } from './StatsCard';
import { SlotDemo } from '@/types/slots';
import { GenericSlotsGrid } from '@/components/shared';

interface SlotsGridProps {
    slots: SlotDemo[];
}

export function SlotsGrid({ slots }: SlotsGridProps) {
    return (
        <GenericSlotsGrid
            slots={slots}
            renderCard={(slot) => <StatsCard key={slot.id} slot={slot} />}
        />
    );
}
