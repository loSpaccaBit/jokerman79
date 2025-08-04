"use client"
import React, { Suspense } from 'react';
import { HeroSection } from "@/components/layout/HeroSectionSearchBar";
import { GenericEmptyState } from "@/components/shared";
import { SEOBreadcrumb } from "@/components/seo/SEOBreadcrumb";
import { useProvidersWithSlots } from "@/hooks/useStrapiSlots";
import { useDynamicSEO } from "@/hooks/useDynamicSEO";
import { AnimatedSection } from "@/components/animations/AnimatedSection";
import { AnimatedGrid } from "@/components/animations/AnimatedGrid";
import ProviderCard from "@/components/_slots/ProviderCard";

/**
 * Pagina principale dei provider con slot
 * Mostra tutti i provider che hanno slot disponibili
 */
function SlotsProvidersContent() {
    // Ottieni tutti i provider che hanno slot disponibili
    const { providers, loading, error } = useProvidersWithSlots();

    // Configura SEO per la pagina provider
    const seoData = {
        title: 'Provider di Slot Machine - Migliori Fornitori di Giochi | Jokerman79',
        description: 'Scopri i migliori provider di slot machine: Pragmatic Play, NetEnt, Microgaming e molti altri. Accedi alle slot demo gratuite dei top provider.',
        canonicalUrl: 'https://jokerman79.com/slots',
        keywords: 'provider slot, pragmatic play, netent, microgaming, slot machine, demo gratis'
    };

    useDynamicSEO(seoData);

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <HeroSection 
                    title="Provider di Slot Machine"
                    description="Caricamento provider..."
                    imageSrc="/assets/aimg/slot_avatar.png"
                    imageAlt="Slot Avatar"
                    showSearchBar={false}
                />
                
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="w-full h-48 bg-muted animate-pulse rounded-lg"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-6">
                <HeroSection 
                    title="Provider di Slot Machine"
                    description="Si è verificato un errore durante il caricamento"
                    imageSrc="/assets/aimg/slot_avatar.png"
                    imageAlt="Slot Avatar"
                    showSearchBar={false}
                />
                
                <GenericEmptyState
                    title="Errore di caricamento"
                    description="Non è possibile caricare i provider al momento. Riprova più tardi."
                    icon="⚠️"
                    onClearFilters={() => window.location.reload()}
                    clearButtonText="Riprova"
                />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <SEOBreadcrumb
                items={[
                    { label: 'Home', href: '/' },
                    { label: 'Provider Slot', href: '/slots' },
                ]}
            />

            <HeroSection 
                title="Provider di Slot Machine"
                description="Scopri i migliori fornitori di slot machine e accedi alle loro demo gratuite"
                imageSrc="/assets/aimg/slot_avatar.png"
                imageAlt="Slot Avatar"
                showSearchBar={false}
            />

            <AnimatedSection delay={0.2}>
                <div className="mt-8">
                    {providers.length > 0 ? (
                        <AnimatedGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" staggerDelay={0.1}>
                            {providers.map((provider) => (
                                <ProviderCard
                                    key={provider.id}
                                    provider={provider}
                                    variant="grid"
                                />
                            ))}
                        </AnimatedGrid>
                    ) : (
                        <GenericEmptyState
                            title="Nessun provider trovato"
                            description="Non ci sono provider di slot disponibili al momento."
                            icon="🎰"
                            onClearFilters={() => window.location.reload()}
                            clearButtonText="Ricarica"
                        />
                    )}
                </div>
            </AnimatedSection>
        </div>
    );
}

export default function SlotsPage() {
    return (
        <Suspense fallback={
            <div className="container mx-auto p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-muted rounded w-1/3"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-48 bg-muted rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        }>
            <SlotsProvidersContent />
        </Suspense>
    );
}
