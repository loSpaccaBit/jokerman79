"use client"
import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from 'next/navigation';
import { HeroSection } from "@/components/layout/HeroSectionSearchBar";
import { Pagination } from "@/components/shared";
import { PaginationSEO } from "@/components/seo/PaginationSEO";
import { SEOBreadcrumb } from "@/components/seo/SEOBreadcrumb";
import { usePagination } from "@/hooks/usePagination";
import { useProviders } from "@/hooks/useStrapiSlots";
import { SlotProvider } from "@/types/slots";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";

// Componente che usa useSearchParams wrappato in Suspense
function ProvidersContent() {
    const searchParams = useSearchParams();
    const currentPage = parseInt(searchParams.get('page') || '1');
    const [searchQuery, setSearchQuery] = useState("");

    // Carica i provider da Strapi via GraphQL
    const { providers, loading, error } = useProviders();

    // Filtra i provider in base alla ricerca
    const filteredProviders = useMemo(() => {
        if (!searchQuery) return providers;
        return providers.filter((provider: SlotProvider) =>
            provider.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, providers]);

    // Setup paginazione
    const pagination = usePagination<SlotProvider>({
        totalItems: filteredProviders.length,
        initialPageSize: 8
    });

    // Provider paginati
    const paginatedProviders = useMemo(() => {
        return pagination.paginateItems(filteredProviders);
    }, [filteredProviders, pagination]);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    // URL base per la paginazione
    const baseUrl = '/providers';

    // Title dinamico basato sulla pagina
    const getPageTitle = () => {
        let title = "Provider di Slot - I Migliori Sviluppatori";
        if (searchQuery) title += ` - Ricerca: ${searchQuery}`;
        if (currentPage > 1) title += ` - Pagina ${currentPage}`;
        return title;
    };

    const getPageDescription = () => {
        let desc = "Scopri i migliori provider di slot online. Pragmatic Play, NetEnt, Play'n GO e molti altri sviluppatori di giochi.";
        if (searchQuery) desc += ` Risultati per: ${searchQuery}.`;
        return desc;
    };

    const breadcrumbItems = [
        { label: "Provider", href: "/providers" }
    ];

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Caricamento provider...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h1 className="text-2xl font-bold text-destructive mb-4">Errore nel caricamento</h1>
                    <p className="text-muted-foreground">Si è verificato un errore durante il caricamento dei provider.</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* SEO Head Tags */}
            <PaginationSEO
                currentPage={pagination.paginationState.currentPage}
                totalPages={pagination.paginationState.totalPages}
                baseUrl={baseUrl}
                title={getPageTitle()}
                description={getPageDescription()}
                itemType="provider di slot"
                totalItems={filteredProviders.length}
            />

            <main className="min-h-screen">
                {/* Breadcrumb SEO - Nascosto agli utenti, visibile ai crawler */}
                <SEOBreadcrumb
                    items={breadcrumbItems}
                    currentPage={pagination.paginationState.currentPage}
                    totalPages={pagination.paginationState.totalPages}
                />

                {/* Hero Section */}
                <HeroSection
                    title="Provider di Slot"
                    description="Scopri i migliori provider di slot online. Pragmatic Play, NetEnt, Play'n GO e molti altri sviluppatori."
                    searchPlaceholder="Cerca provider per nome..."
                    onSearch={handleSearch}
                    imageSrc="/assets/aimg/provider_avatar.png"
                    imageAlt="Provider Avatar"
                />

                <section className="px-6 py-8">
                    <div className="max-w-7xl mx-auto">
                        {paginatedProviders.length > 0 ? (
                            <>
                                {/* Griglia Provider */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {paginatedProviders.map((provider) => (
                                        <Card key={provider.id} className="hover:shadow-lg transition-shadow">
                                            <CardHeader className="text-center">
                                                <div className="flex justify-center mb-4">
                                                    <div className="w-20 h-20 bg-white border rounded-lg flex items-center justify-center overflow-hidden">
                                                        {provider.logo && provider.logo.trim() !== '' ? (
                                                            <Image
                                                                src={provider.logo}
                                                                alt={`${provider.name} logo`}
                                                                width={64}
                                                                height={64}
                                                                className="object-contain"
                                                            />
                                                        ) : (
                                                            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                                                                <span className="text-lg font-bold text-primary">
                                                                    {provider.name.charAt(0).toUpperCase()}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <CardTitle className="text-lg">{provider.name}</CardTitle>
                                            </CardHeader>
                                            <CardContent className="text-center">
                                                <Badge variant="secondary" className="mb-4">
                                                    {provider.slotsCount > 0 ? `${provider.slotsCount} slot disponibili` : 'Slot disponibili'}
                                                </Badge>
                                                <div>
                                                    <Link
                                                        href={`/providers/${provider.slug || provider.id}`}
                                                        className="block w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                                    >
                                                        Vedi Dettagli
                                                    </Link>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>

                                {/* Paginazione SEO-friendly */}
                                {pagination.paginationState.totalPages > 1 && (
                                    <div className="mt-8">
                                        <Pagination
                                            currentPage={pagination.paginationState.currentPage}
                                            totalPages={pagination.paginationState.totalPages}
                                            pageSize={pagination.paginationState.pageSize}
                                            totalItems={pagination.paginationState.totalItems}
                                            hasNextPage={pagination.paginationState.hasNextPage}
                                            hasPreviousPage={pagination.paginationState.hasPreviousPage}
                                            onPageChange={pagination.paginationActions.goToPage}
                                            onPageSizeChange={pagination.paginationActions.setPageSize}
                                            itemName="provider"
                                            baseUrl={baseUrl}
                                            useLinks={true}
                                        />
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                <p>Nessun provider trovato per la ricerca &quot;{searchQuery}&quot;</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </>
    );
}

// Componente wrapper con Suspense
export default function Provider() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Caricamento provider...</p>
                </div>
            </div>
        }>
            <ProvidersContent />
        </Suspense>
    );
}