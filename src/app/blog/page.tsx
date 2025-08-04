"use client"
import BlogPostCard from "@/components/_home/BlogPostCard";
import { AnimatedSection, AnimatedGrid } from "@/components/lazy";
import { Pagination } from "@/components/shared";
import { PaginationSEO } from "@/components/seo/PaginationSEO";
import { SEOBreadcrumb } from "@/components/seo/SEOBreadcrumb";
import { HeroSection } from "@/components/layout/HeroSectionSearchBar";
import { usePagination } from "@/hooks/usePagination";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { BlogPost } from "@/types/blog";

// Componente che gestisce i search params
function BlogContent() {
    const searchParams = useSearchParams();
    const currentPage = parseInt(searchParams.get('page') || '1');
    const [searchQuery, setSearchQuery] = useState("");

    // Carica tutti i blog post da Strapi
    const { blogPosts, loading, error } = useBlogPosts({
        sort: ['publishedAt:desc']
    });

    // Filtra i post in base alla ricerca
    const filteredPosts = useMemo(() => {
        if (!searchQuery) return blogPosts;
        return blogPosts.filter(post =>
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, blogPosts]);

    // Setup paginazione
    const pagination = usePagination<BlogPost>({
        totalItems: filteredPosts.length,
        initialPageSize: 6
    });

    // Post paginati
    const paginatedPosts = useMemo(() => {
        return pagination.paginateItems(filteredPosts);
    }, [filteredPosts, pagination]);

    // Post in evidenza (solo prima pagina)
    const featuredPosts = useMemo(() => {
        return filteredPosts.filter(post => post.isFeatured);
    }, [filteredPosts]);

    // URL base per la paginazione
    const baseUrl = '/blog';

    // Title dinamico basato sulla pagina
    const getPageTitle = () => {
        let title = "Blog Jokerman79 - Guide e Strategie Casino";
        if (searchQuery) title += ` - Ricerca: ${searchQuery}`;
        if (currentPage > 1) title += ` - Pagina ${currentPage}`;
        return title;
    };

    const getPageDescription = () => {
        let desc = "Guide, strategie e consigli per il mondo dei casinò online. Rimani aggiornato con le ultime novità del settore.";
        if (searchQuery) desc += ` Risultati per: ${searchQuery}.`;
        return desc;
    };

    const breadcrumbItems = [
        { label: "Blog", href: "/blog" }
    ];

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Caricamento articoli...</p>
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
                    <p className="text-muted-foreground">Si è verificato un errore durante il caricamento degli articoli.</p>
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
                itemType="articoli del blog"
                totalItems={filteredPosts.length}
            />

            <main className="space-y-8">
                {/* Breadcrumb SEO - Stile minimal uniforme */}
                <div className="bg-background/80 backdrop-blur-sm border-b border-border/50">
                    <div className="max-w-7xl mx-auto px-6 py-3">
                        <SEOBreadcrumb
                            items={breadcrumbItems}
                            currentPage={pagination.paginationState.currentPage}
                            totalPages={pagination.paginationState.totalPages}
                        />
                    </div>
                </div>

                {/* Hero Section */}
                <HeroSection
                    title="Blog Jokerman79"
                    description="Guide, strategie e consigli per il mondo dei casinò online. Rimani aggiornato con le ultime novità del settore."
                    searchPlaceholder="Cerca articoli per titolo, categoria o contenuto..."
                    onSearch={setSearchQuery}
                    imageSrc="/assets/aimg/blog_avatar.png"
                    imageAlt="Avatar Jokerman79 Blog"
                />

                <div className="p-6">
                    {/* Post in evidenza solo sulla prima pagina e senza ricerca attiva */}
                    {currentPage === 1 && featuredPosts.length > 0 && !searchQuery && (
                        <AnimatedSection delay={0.2}>
                            <section>
                                <h2 className="text-2xl font-bold mb-6">Post in Evidenza</h2>
                                <div className="grid gap-6">
                                    {featuredPosts.map((post) => (
                                        <BlogPostCard
                                            key={post.slug}
                                            variant="full"
                                            post={post}
                                        />
                                    ))}
                                </div>
                            </section>
                        </AnimatedSection>
                    )}

                    {/* Tutti gli articoli con paginazione */}
                    <AnimatedSection delay={0.3}>
                        <section>
                            <h2 className="text-2xl font-bold mb-6">
                                {searchQuery ? `Risultati per "${searchQuery}"` : 'Tutti gli Articoli'}
                            </h2>

                            {paginatedPosts.length > 0 ? (
                                <>
                                    <AnimatedGrid
                                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                                        staggerDelay={0.1}
                                    >
                                        {paginatedPosts.map((post) => (
                                            <BlogPostCard
                                                key={post.slug}
                                                variant="grid"
                                                post={post}
                                            />
                                        ))}
                                    </AnimatedGrid>

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
                                                itemName="articoli"
                                                baseUrl={baseUrl}
                                                useLinks={true}
                                            />
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    <p>Nessun articolo trovato per la ricerca &quot;{searchQuery}&quot;</p>
                                </div>
                            )}
                        </section>
                    </AnimatedSection>
                </div>
            </main>
        </>
    );
}

export default function Blog() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Caricamento blog...</p>
                </div>
            </div>
        }>
            <BlogContent />
        </Suspense>
    );
}