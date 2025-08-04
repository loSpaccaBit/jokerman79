"use client"

import { memo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { SlotDemo } from '@/types/slots';
import { BarChart3 } from 'lucide-react';
import Link from 'next/link';

interface StatsCardProps {
    slot: SlotDemo;
}

export const StatsCard = memo<StatsCardProps>(function StatsCard({ slot }) {
    return (
        <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <CardHeader className="p-0">
                <div className="relative aspect-video overflow-hidden">
                    <OptimizedImage
                        src={slot.image}
                        alt={slot.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    {/* Provider Badge */}
                    <div className="absolute top-3 right-3">
                        <Badge variant="outline" className="bg-white/90 text-black">
                            {slot.provider}
                        </Badge>
                    </div>

                    {/* Title */}
                    <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="text-white font-semibold text-lg leading-tight">
                            {slot.name}
                        </h3>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-3">
                    {slot.description}
                </p>

                {/* Action Button */}
                <Link href={`/stats/${slot.slug}`} className="block">
                    <Button className="w-full" variant="default">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Vedi Statistiche
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
});
