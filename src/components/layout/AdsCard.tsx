"use client"
import Image from "next/image";
import { Card, CardContent, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useRef, memo } from "react";
import { Advertisement, useLocalAdvertisementTracking } from "@/hooks/useAdvertisements";

interface AdsCardProps {
  advertisement?: Advertisement;
  onImpression?: (id: string) => void;
}

export const AdsCard = memo(function AdsCard({ advertisement, onImpression }: AdsCardProps) {
    const { handleClick, handleImpression } = useLocalAdvertisementTracking();
    const impressionTracked = useRef<Set<string>>(new Set());

    // Se non c'è advertisement, non mostrare nulla
    if (!advertisement) {
        return null;
    }

    // Track impression when card is viewed - solo una volta per ID
    useEffect(() => {
        if (advertisement?.id && !impressionTracked.current.has(advertisement.id)) {
            impressionTracked.current.add(advertisement.id);
            handleImpression(advertisement.id);
            onImpression?.(advertisement.id);
        }
    }, [advertisement?.id, handleImpression, onImpression]);

    const imageUrl = advertisement?.thumbnailImage?.url || advertisement?.image?.url;
    const buttonText = advertisement?.buttonText || 'Scopri di più';
    const description = advertisement?.shortDescription || advertisement?.description || '';

    const handleAdClick = () => {
        if (advertisement?.id && advertisement?.url) {
            handleClick(advertisement.id, advertisement.url);
        }
    };

    // Se non c'è un'immagine, non mostrare la card
    if (!imageUrl) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full"
        >
            <Card 
                className="transition-all duration-300 hover:shadow-lg cursor-pointer"
                onClick={handleAdClick}
                style={{
                    borderColor: advertisement?.brandColor ? `${advertisement.brandColor}20` : undefined
                }}
            >
                <CardContent className="p-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-center py-4">
                            <Image
                                src={imageUrl}
                                alt={advertisement?.image?.alternativeText || advertisement?.title || 'Advertisement'}
                                width={advertisement?.image?.width || 100}
                                height={advertisement?.image?.height || 30}
                                className="object-contain dark:brightness-0 dark:invert max-h-12"
                                priority
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl font-bold">
                                {advertisement?.title || 'Advertisement'}
                            </CardTitle>
                            <Badge 
                                variant="outline" 
                                className="text-xs"
                                style={{
                                    borderColor: advertisement?.brandColor || undefined,
                                    color: advertisement?.brandColor || undefined
                                }}
                            >
                                Partner
                            </Badge>
                        </div>

                        <CardDescription>
                            {description}
                        </CardDescription>

                        <Button 
                            className="w-full"
                            style={{
                                backgroundColor: advertisement?.brandColor || undefined
                            }}
                        >
                            <span className="mr-2">{buttonText}</span>
                            <ExternalLink className="w-4 h-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
});