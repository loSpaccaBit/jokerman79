"use client"
import React, { Suspense } from 'react';
import { HeroSection } from "@/components/layout/HeroSectionSearchBar";
import { GenericEmptyState } from "@/components/shared";
import { SEOBreadcrumb } from "@/components/seo/SEOBreadcrumb";
import { useSlotsByProvider } from "@/hooks/useStrapiSlots";
import { useDynamicSEO } from "@/hooks/useDynamicSEO";
import SlotDemoCard from "@/components/_slots/SlotDemoCard";
import { AnimatedSection } from "@/components/animations/AnimatedSection";
import { AnimatedGrid } from "@/components/animations/AnimatedGrid";
import { useParams } from 'next/navigation';
import Link from "next/link";

/**
 * Pagina che mostra tutte le slot di un provider specifico
 */
function ProviderSlotsContent() {
    const params = useParams();
    const slug = params?.slug as string;
    
    // Ottieni le slot del provider
    const { slots, provider, loading, error } = useSlotsByProvider(slug);

    // Configura SEO dinamico
    const seoData = {
        title: provider 
            ? `Slot ${provider.name} Demo Gratis - Gioca Subito | Jokerman79`
            : 'Slot Provider - Demo Gratis | Jokerman79',
        description: provider 
            ? `Gioca gratis alle slot demo di ${provider.name}. Scopri tutti i giochi disponibili senza deposito e senza registrazione.`
            : 'Scopri le slot demo gratuite del provider selezionato.',
        canonicalUrl: `https://jokerman79.com/slots/provider/${slug}`,
        keywords: provider 
            ? `${provider.name.toLowerCase()}, slot demo, giochi gratis, ${provider.name.toLowerCase()} slot`
            : 'slot demo, giochi gratis'
    };

    useDynamicSEO(seoData);

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <HeroSection 
                    title="Caricamento..."
                    description="Sto caricando le slot del provider"
                    imageSrc="/assets/aimg/slot_avatar.png"
                    imageAlt="Slot Avatar"
                    showSearchBar={false}
                />
                
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="w-full h-80 bg-muted animate-pulse rounded-lg"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (error || !provider) {
        return (
            <div className="container mx-auto p-6">
                <HeroSection 
                    title="Provider non trovato"
                    description="Il provider richiesto non è disponibile"
                    imageSrc="/assets/aimg/slot_avatar.png"
                    imageAlt="Slot Avatar"
                    showSearchBar={false}
                />
                
                <GenericEmptyState
                    title="Provider non trovato"
                    description="Il provider richiesto non esiste o non è più disponibile."
                    icon="🔍"
                    onClearFilters={() => window.location.href = '/slots'}
                    clearButtonText="Torna ai provider"
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
                    { label: provider.name, href: `/slots/provider/${provider.slug}` },
                ]}
            />

            <HeroSection 
                title={`Slot ${provider.name}`}
                description={`Scopri tutte le slot demo gratuite di ${provider.name}. Gioca senza deposito e senza registrazione.`}
                imageSrc="/assets/aimg/slot_avatar.png"
                imageAlt="Slot Avatar"
                showSearchBar={false}
            />

            {/* Pulsante per tornare ai provider */}
            <div className="mt-4 mb-8">
                <Link 
                    href="/slots"
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                    ← Torna ai provider
                </Link>
            </div>

            <AnimatedSection delay={0.2}>
                <div className="mt-8">
                    {slots.length > 0 ? (
                        <>
                            {/* Contatore risultati */}
                            <div className="mb-6">
                                <p className="text-muted-foreground">
                                    {slots.length} slot{slots.length !== 1 ? 's' : ''} disponibili per {provider.name}
                                </p>
                            </div>

                            <AnimatedGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" staggerDelay={0.1}>
                                {slots.map((slot) => (
                                    <SlotDemoCard
                                        key={slot.id}
                                        slot={slot}
                                        variant="grid"
                                    />
                                ))}
                            </AnimatedGrid>
                        </>
                    ) : (
                        <GenericEmptyState
                            title="Nessuna slot disponibile"
                            description={`Al momento non ci sono slot disponibili per ${provider.name}.`}
                            icon="🎰"
                            onClearFilters={() => window.location.href = '/slots'}
                            clearButtonText="Esplora altri provider"
                        />
                    )}
                </div>
            </AnimatedSection>
        </div>
    );
}

export default function ProviderSlotsPage() {
    return (
        <Suspense fallback={
            <div className="container mx-auto p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-muted rounded w-1/3"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="h-80 bg-muted rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        }>
            <ProviderSlotsContent />
        </Suspense>
    );
}
