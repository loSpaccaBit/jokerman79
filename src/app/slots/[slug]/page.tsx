"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SlotDemoPlayer } from "@/components/_slots/SlotDemoPlayer";
import { SlotReview } from "@/components/_slots/SlotReview";
import { SlotBonusSection } from "@/components/_slots/SlotBonusSection";
import { use } from "react";
import { useStrapiSlot } from "@/hooks/useStrapiSlots";
import { useDynamicSEO } from "@/hooks/useDynamicSEO";
import { SlotPageData } from "@/types/slots";
import { StrapiSlot } from "@/types/strapi";

interface SlotPageProps {
    params: Promise<{
        slug: string;
    }>;
    searchParams: Promise<{
        [key: string]: string | string[] | undefined;
    }>;
}

// Funzione per convertire i dati Strapi in formato SlotPageData
const convertStrapiToSlotPageData = (strapiSlot: StrapiSlot): SlotPageData => {
    return {
        name: strapiSlot.name || 'Slot non disponibile',
        provider: strapiSlot.provider?.name || '',
        videoUrl: strapiSlot.demoUrl || '',
        videoUrlMobile: strapiSlot.demoUrl || '',
        poster: strapiSlot.thumbnail?.url || '/assets/slot/default.webp',
        rating: strapiSlot.rating || 0,
        rtp: strapiSlot.rtp || 0,
        volatility: strapiSlot.volatility || 'medium',
        maxWin: '', // Campo non disponibile in StrapiSlot
        features: Array.isArray(strapiSlot.features) ? strapiSlot.features : [],
        review: {
            summary: strapiSlot.description || '',
            pros: [], // Campi non disponibili in StrapiSlot
            cons: [],
            verdict: strapiSlot.shortDescription || ''
        },
        bonuses: [] // I bonus verranno gestiti separatamente dal backend
    };
};

export default function SlotPage({ params }: SlotPageProps) {
    const { slug } = use(params);
    const { slot, loading, error } = useStrapiSlot(slug);

    // Configura SEO dinamico basato sui dati della slot
    const seoData = slot ? {
        title: `${slot.name} - Demo Gratuita | Jokerman79`,
        description: slot.description || `Prova gratis la slot ${slot.name} di ${slot.provider?.name}. RTP: ${slot.rtp}%, volatilità ${slot.volatility}.`,
        keywords: `${slot.name}, slot demo, ${slot.provider?.name}, slot gratis`,
        canonicalUrl: `/slots/${slug}`
    } : {};

    useDynamicSEO(seoData);

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Caricamento slot...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-500 mb-4">Errore nel caricamento</h1>
                    <p className="text-muted-foreground mb-6">Si è verificato un errore durante il caricamento della slot.</p>
                    <Link
                        href="/slots"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Torna alle Slot
                    </Link>
                </div>
            </div>
        );
    }

    // Slot not found
    if (!slot) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Slot non trovata</h1>
                    <p className="text-muted-foreground mb-6">La slot richiesta non è stata trovata.</p>
                    <Link
                        href="/slots"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Torna alle Slot
                    </Link>
                </div>
            </div>
        );
    }

    // Converti i dati della slot per il componente
    const slotPageData = convertStrapiToSlotPageData(slot);

    return (
        <div className="min-h-screen bg-background">
            {/* Navigation */}
            <div className="px-6 py-4">
                <div className="max-w-7xl mx-auto">
                    <Link
                        href="/slots"
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Torna alle Slot
                    </Link>
                </div>
            </div>

            <div className="px-6 pb-12">
                <div className="max-w-7xl mx-auto space-y-12">
                    {/* Slot Demo Player */}
                    <SlotDemoPlayer
                        demoUrl={slotPageData.videoUrl}
                        slotName={slotPageData.name}
                        poster={slotPageData.poster}
                    />

                    {/* Slot Review */}
                    <SlotReview
                        slotName={slotPageData.name}
                        provider={slotPageData.provider}
                        rating={slotPageData.rating}
                        rtp={slotPageData.rtp}
                        volatility={slotPageData.volatility}
                        maxWin={slotPageData.maxWin}
                        features={slotPageData.features}
                        review={slotPageData.review}
                    />

                    {/* Bonus Section */}
                    <SlotBonusSection
                        bonuses={slotPageData.bonuses.map(bonus => ({
                            ...bonus,
                            amount: bonus.amount || '',
                            minDeposit: bonus.minDeposit || '',
                            wagering: bonus.wagering || ''
                        }))}
                        slotName={slotPageData.name}
                    />
                </div>
            </div>
        </div>
    );
}
