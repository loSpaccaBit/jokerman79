"use client"

import { SlotDemo } from '@/types/slots';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SlotDemoCard from '@/components/_slots/SlotDemoCard';

interface FeaturedSlotsProps {
    popularSlots?: SlotDemo[];
    newSlots?: SlotDemo[];
}

export function FeaturedSlots({ popularSlots = [], newSlots = [] }: FeaturedSlotsProps) {
    if (popularSlots.length === 0 && newSlots.length === 0) {
        return null;
    }

    return (
        <div className="space-y-8">
            {/* Slot Popolari */}
            {popularSlots.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl font-bold">
                            🌟 Slot Popolari
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {popularSlots.slice(0, 4).map((slot) => (
                                <SlotDemoCard key={slot.id} slot={slot} />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Slot Nuove */}
            {newSlots.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl font-bold">
                            🆕 Nuove Slot
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {newSlots.slice(0, 4).map((slot) => (
                                <SlotDemoCard key={slot.id} slot={slot} />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export default FeaturedSlots;
