"use client"
import { use } from "react";
import { notFound } from 'next/navigation';
import { useProvider } from "@/hooks/useProvider";
import { useDynamicSEO } from "@/hooks/useDynamicSEO";
import { SEOBreadcrumb } from "@/components/seo/SEOBreadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckIcon, ExternalLinkIcon, TagIcon, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getStrapiImageUrl } from "@/lib/utils";

interface ProviderPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default function ProviderDetailPage({ params }: ProviderPageProps) {
    const { slug } = use(params);

    // Usa il hook GraphQL per ottenere i dati del provider
    const {
        provider,
        bonuses,
        slots,
        stats,
        loading,
        error,
        seoData
        // welcomeBonuses, freeSpinsBonuses, cashbackBonuses sono disponibili ma non utilizzate
    } = useProvider(slug, {
        includeBonuses: true,
        includeSlots: true,
        slotsLimit: 20
    });

    // Configura SEO dinamico sempre, non condizionalmente
    useDynamicSEO(seoData || {});

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
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
                    <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-destructive mb-4">Errore nel caricamento</h1>
                    <p className="text-muted-foreground mb-6">Si è verificato un errore durante il caricamento del provider.</p>
                    <Link href="/providers">
                        <Button variant="outline">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Torna ai Provider
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    // Provider not found
    if (!provider) {
        notFound();
    }

    const breadcrumbItems = [
        { label: "Provider", href: "/providers" },
        { label: provider.name, href: `/providers/${provider.slug}` }
    ];

    return (
        <>
            <main className="min-h-screen">
                {/* Breadcrumb SEO */}
                <SEOBreadcrumb items={breadcrumbItems} />

                {/* Header Provider */}
                <section className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b">
                    <div className="max-w-7xl mx-auto px-6 py-12">
                        {/* Bottone Torna Indietro */}
                        <div className="mb-6">
                            <Link
                                href="/providers"
                                className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Torna ai Provider
                            </Link>
                        </div>

                        <div className="flex flex-col md:flex-row items-center gap-8">
                            {/* Logo Provider */}
                            <div className="flex-shrink-0">
                                <div className="w-32 h-32 bg-white border-2 border-white rounded-xl shadow-lg overflow-hidden">
                                    {provider.logo?.url && provider.logo.url.trim() !== '' ? (
                                        <Image
                                            src={getStrapiImageUrl(provider.logo.url)}
                                            alt={provider.logo.alternativeText || `${provider.name} logo`}
                                            width={128}
                                            height={128}
                                            className="object-contain w-full h-full"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                                            <span className="text-4xl font-bold text-primary">
                                                {provider.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Info Provider */}
                            <div className="flex-1 text-center md:text-left">
                                <h1 className="text-4xl font-bold mb-4">{provider.name}</h1>
                                <p className="text-lg text-muted-foreground mb-6">
                                    {provider.description || 'Provider di slot machine e giochi da casinò online'}
                                </p>

                                {/* Rating e Info Base */}
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6">
                                    {stats && (
                                        <Badge variant="secondary">
                                            {stats.totalSlots} slot disponibili
                                        </Badge>
                                    )}

                                    {provider.isPopular && (
                                        <Badge variant="outline" className="border-primary">
                                            Provider Popolare
                                        </Badge>
                                    )}

                                    <Badge variant="outline">
                                        Provider verificato
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Contenuto Principale */}
                <section className="max-w-7xl mx-auto px-6 py-12">
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-4 mb-8">
                            <TabsTrigger value="overview">Panoramica</TabsTrigger>
                            <TabsTrigger value="review">Recensione</TabsTrigger>
                            <TabsTrigger value="bonuses">Bonus</TabsTrigger>
                            <TabsTrigger value="games">Giochi</TabsTrigger>
                        </TabsList>

                        {/* Tab Panoramica */}
                        <TabsContent value="overview" className="space-y-8">
                            {/* Descrizione */}
                            {provider.description && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Descrizione</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground leading-relaxed">
                                            {provider.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Informazioni Generali */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Informazioni Generali</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Nome Provider:</span>
                                            <span className="font-medium">{provider.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Stato:</span>
                                            <span className="font-medium">
                                                {provider.isVisible ? 'Attivo' : 'Non disponibile'}
                                            </span>
                                        </div>
                                        {provider.rating && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Rating:</span>
                                                <span className="font-medium flex items-center gap-1">
                                                    <span className="text-yellow-400">★</span>
                                                    {provider.rating}/5
                                                </span>
                                            </div>
                                        )}
                                        {provider.foundedYear && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Anno di fondazione:</span>
                                                <span className="font-medium">{provider.foundedYear}</span>
                                            </div>
                                        )}
                                        {provider.country && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Paese:</span>
                                                <span className="font-medium">{provider.country}</span>
                                            </div>
                                        )}
                                        {stats && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Numero di slot:</span>
                                                <span className="font-medium">{stats.totalSlots}</span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Informazioni Aggiuntive */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Dettagli</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {provider.website && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Sito web:</span>
                                                <a
                                                    href={provider.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-medium text-primary hover:underline flex items-center gap-1"
                                                >
                                                    <ExternalLinkIcon className="w-3 h-3" />
                                                    Visita
                                                </a>
                                            </div>
                                        )}
                                        {bonuses && bonuses.length > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Bonus disponibili:</span>
                                                <span className="font-medium">{bonuses.length}</span>
                                            </div>
                                        )}
                                        {provider.isPopular && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Provider popolare:</span>
                                                <Badge variant="secondary">Sì</Badge>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Licenze */}
                            {provider.licenses && provider.licenses.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Licenze e Certificazioni</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {provider.licenses.map((license, index) => (
                                                <Badge key={index} variant="outline" className="justify-center py-2">
                                                    {license}
                                                </Badge>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Statistiche */}
                            {stats && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Statistiche</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-primary">{stats.totalSlots}</div>
                                                <div className="text-sm text-muted-foreground">Slot Totali</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-primary">{stats.popularSlots}</div>
                                                <div className="text-sm text-muted-foreground">Slot Popolari</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-primary">{stats.newSlots}</div>
                                                <div className="text-sm text-muted-foreground">Slot Nuove</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-primary">{stats.averageRTP.toFixed(1)}%</div>
                                                <div className="text-sm text-muted-foreground">RTP Medio</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        {/* Tab Recensione */}
                        <TabsContent value="review" className="space-y-8">
                            {/* Recensione completa - contenuto principale */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="font-tanker">Recensione di
                                        <span className="ml-2 font-satoshi">
                                            {provider.name}
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Sommario introduttivo */}
                                    {provider.reviewSummary && (
                                        <div>
                                            <p className="text-muted-foreground leading-relaxed text-lg">
                                                {provider.reviewSummary}
                                            </p>
                                        </div>
                                    )}

                                    {/* Pro e Contro */}
                                    {(provider.reviewPros || provider.reviewCons) && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Pro */}
                                            {provider.reviewPros && provider.reviewPros.length > 0 && (
                                                <div>
                                                    <h4 className="font-semibold text-green-600 mb-3 flex items-center gap-2">
                                                        <CheckIcon className="w-5 h-5" />
                                                        Punti di Forza
                                                    </h4>
                                                    <ul className="space-y-2">
                                                        {provider.reviewPros.map((pro, index) => (
                                                            <li key={index} className="flex items-start gap-2">
                                                                <CheckIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                                <span className="text-sm">{pro}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Contro */}
                                            {provider.reviewCons && provider.reviewCons.length > 0 && (
                                                <div>
                                                    <h4 className="font-semibold text-red-600 mb-3 flex items-center gap-2">
                                                        <AlertCircle className="w-5 h-5" />
                                                        Aree di Miglioramento
                                                    </h4>
                                                    <ul className="space-y-2">
                                                        {provider.reviewCons.map((con, index) => (
                                                            <li key={index} className="flex items-start gap-2">
                                                                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                                                <span className="text-sm">{con}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Testo principale della recensione */}
                                    {provider.reviewVerdict && (
                                        <div className="border-t pt-6">
                                            <div
                                                className="space-y-4 text-muted-foreground leading-relaxed"
                                                dangerouslySetInnerHTML={{
                                                    __html: provider.reviewVerdict
                                                        // Prima sostituisce i \n letterali con veri a capo
                                                        .replace(/\\n/g, '\n')
                                                        // Poi processa il markdown
                                                        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
                                                        .replace(/## (.*?)(\n|$)/g, '<h2 class="text-xl font-bold mt-8 mb-4 text-foreground">$1</h2>')
                                                        .replace(/### (.*?)(\n|$)/g, '<h3 class="text-lg font-semibold mt-6 mb-3 text-foreground">$1</h3>')
                                                        // Gestisce i paragrafi
                                                        .replace(/\n\n+/g, '</p><p class="mb-4 leading-relaxed">')
                                                        .replace(/\n/g, ' ')
                                                        .replace(/^/, '<p class="mb-4 leading-relaxed">')
                                                        .replace(/$/, '</p>')
                                                        // Corregge la struttura HTML
                                                        .replace(/<\/p><p[^>]*><h/g, '</p><h')
                                                        .replace(/<\/h([0-9])><p[^>]*>/g, '</h$1><p class="mb-4 leading-relaxed">')
                                                }}
                                            />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Tab Bonus */}
                        <TabsContent value="bonuses" className="space-y-8">
                            {bonuses && bonuses.length > 0 ? (
                                <div className="grid gap-6">
                                    {bonuses.map((bonus) => (
                                        <Card key={bonus.documentId}>
                                            <CardHeader>
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <CardTitle className="flex items-center gap-2">
                                                            <TagIcon className="w-5 h-5 text-primary" />
                                                            {bonus.title}
                                                        </CardTitle>
                                                        <p className="text-muted-foreground mt-2">{bonus.description}</p>
                                                    </div>
                                                    <Badge variant="secondary">{bonus.type}</Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold text-primary text-lg">{bonus.amount}</span>
                                                    {bonus.code && (
                                                        <Badge variant="outline" className="font-mono">
                                                            {bonus.code}
                                                        </Badge>
                                                    )}
                                                </div>

                                                {bonus.terms && bonus.terms.length > 0 && (
                                                    <div>
                                                        <h4 className="font-medium mb-2">Termini e Condizioni:</h4>
                                                        <ul className="text-sm text-muted-foreground space-y-1">
                                                            {bonus.terms.map((term, index) => (
                                                                <li key={index}>• {term}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {bonus.url && (
                                                    <Link href={bonus.url} target="_blank" rel="noopener noreferrer">
                                                        <Button className="w-full">
                                                            Ottieni Bonus
                                                            <ExternalLinkIcon className="w-4 h-4 ml-2" />
                                                        </Button>
                                                    </Link>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <Card>
                                    <CardContent className="text-center py-8">
                                        <p className="text-muted-foreground">Nessun bonus disponibile al momento.</p>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        {/* Tab Giochi */}
                        <TabsContent value="games" className="space-y-8">
                            {slots && slots.length > 0 ? (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-semibold">Slot di {provider.name}</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {slots.map((slot) => (
                                            <Card key={slot.id} className="overflow-hidden">
                                                <div className="aspect-video relative">
                                                    {slot.image && slot.image.trim() !== '' ? (
                                                        <Image
                                                            src={slot.image}
                                                            alt={slot.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                                                            <span className="text-2xl font-bold text-muted-foreground">
                                                                {slot.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                                        <Link href={`/slots/${slot.slug}`}>
                                                            <Button>Gioca Demo</Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                                <CardContent className="p-4">
                                                    <h4 className="font-semibold mb-2">{slot.name}</h4>
                                                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                                                        <span>RTP: {slot.rtp}%</span>
                                                        <span className="capitalize">{slot.volatility}</span>
                                                    </div>
                                                    {slot.isPopular && (
                                                        <Badge variant="secondary" className="mt-2">
                                                            Popolare
                                                        </Badge>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <Card>
                                    <CardContent className="text-center py-8">
                                        <p className="text-muted-foreground">Nessuna slot disponibile al momento.</p>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>
                    </Tabs>
                </section>
            </main>
        </>
    );
}
