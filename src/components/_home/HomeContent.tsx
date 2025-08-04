"use client";

import Image from "next/image";
import { BonusCard } from "@/components/_home/BonusCard";
import SlotDemoCard from "@/components/_slots/SlotDemoCard";
import { Button } from "@/components/ui/button";
import { AboutCard } from "@/components/_home/AboutCard";
import { TransformationSection } from "@/components/_home/TransformationSection";
import { Partner } from "@/components/_home/Partner";
import { AnimatedSection } from "@/components/animations/AnimatedSection";
import { AnimatedGrid } from "@/components/animations/AnimatedGrid";
import { AdsCard } from "@/components/layout/AdsCard";
import { MobileAdsSection } from "@/components/ads/MobileAdsSection";
import BlogPostCard from "@/components/_home/BlogPostCard";
import { DisclamerTips } from "@/components/_home/DisclameTips";
import { useStrapiSlotFilters } from "@/hooks/useStrapiSlots";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { useHomepagePartners } from "@/hooks/useHomepagePartners";
import { useHeroBonuses, useGridBonuses } from "@/hooks/useBonuses";
import Link from "next/link";

export function HomeContent() {
    // Hook per i dati Strapi - NESSUN DATO MOCK!
    const { featuredSlots, popularSlots, loading: slotsLoading, error: slotsError } = useStrapiSlotFilters();
    const { blogPosts, loading: blogLoading, error: blogError } = useBlogPosts();
    const { partners, loading: partnersLoading, error: partnersError } = useHomepagePartners();
    const { heroBonus, loading: heroBonusLoading, error: heroBonusError } = useHeroBonuses();
    const { gridBonuses, loading: gridBonusesLoading, error: gridBonusesError } = useGridBonuses();

    // Log degli errori per debug solo in development
    if (process.env.NODE_ENV === 'development') {
        if (slotsError) {
            console.error('Slots error:', slotsError);
        }
        if (blogError) {
            console.error('Blog error:', blogError);
        }
        if (partnersError) {
            console.error('Partners error:', partnersError);
        }
        if (gridBonusesError) {
            console.error('Grid bonuses error:', gridBonusesError);
        }
    }

    // Seleziona le slot per la homepage da Strapi
    const featuredSlot = featuredSlots?.[0] || popularSlots?.[0];
    const topSlots = popularSlots?.slice(0, 3) || [];

    // Mostra TUTTI i bonus in formato grid (non più separazione hero/grid)
    const allBonuses = gridBonuses || [];

    // Log per debug - rimuovere in produzione
    console.log('Homepage data status:', {
        slots: { featuredSlots: featuredSlots?.length, popularSlots: popularSlots?.length, loading: slotsLoading },
        blog: { posts: blogPosts?.length, loading: blogLoading },
        partners: { count: partners?.length, loading: partnersLoading },
        bonuses: {
            gridTotal: allBonuses?.length,
            loading: gridBonusesLoading
        }
    });

    return (
        <main className="p-6 space-y-6" role="main" aria-label="Contenuto principale">
            <AnimatedSection>
                <header className="flex flex-col gap-6 md:gap-8 lg:flex-row lg:items-center lg:justify-between">
                    {/* Contenuto testuale */}
                    <div className="flex-1 space-y-4 md:space-y-6">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                            I Migliori Casinò online legali italiani
                        </h1>

                        {/* Immagine avatar - Visibile solo su mobile tra h1 e p */}
                        <div className="flex justify-center lg:hidden">
                            <Image
                                src={'/assets/aimg/home_avatar.png'}
                                alt="Home Avatar"
                                width={180}
                                height={225}
                                className="w-auto h-60 md:h-64 object-contain"
                                priority
                            />
                        </div>

                        <p className="text-base md:text-lg lg:text-xl text-muted-foreground leading-relaxed md:leading-loose max-w-4xl">
                            In questa sezione è possibile consultare una lista di siti Italiani, legali, autorizzati <span className="font-semibold text-foreground">ADM</span>
                            <br className="hidden md:block" />
                            {'\t'}E alcuni di essi offrono bonus esclusivi.
                        </p>
                    </div>

                    {/* Immagine avatar - Visibile solo su desktop a destra */}
                    <div className="hidden lg:flex justify-end flex-shrink-0">
                        <Image
                            src={'/assets/aimg/home_avatar.png'}
                            alt="Home Avatar"
                            width={200}
                            height={250}
                            className="w-auto h-64 object-contain"
                            priority
                        />
                    </div>
                </header>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
                <section aria-labelledby="bonus-section">
                    <section id="bonus-section">
                        {allBonuses.length > 0 && !gridBonusesLoading ? (
                            <AnimatedGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" staggerDelay={0.15}>
                                {allBonuses.map((bonus) => (
                                    <BonusCard key={bonus.id} variant="grid" bonus={bonus} />
                                ))}
                            </AnimatedGrid>
                        ) : gridBonusesLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="w-full h-48 bg-muted animate-pulse rounded-lg"></div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground">Nessun bonus trovato.</p>
                        )}
                    </section>
                </section>
            </AnimatedSection>

            <span>
                <DisclamerTips />
            </span>

            <AnimatedSection delay={0.3}>
                <section>
                    <span>
                        {featuredSlot && !slotsLoading && (
                            <SlotDemoCard variant="full" slot={featuredSlot} />
                        )}
                        {slotsLoading && (
                            <div className="w-full h-64 bg-muted animate-pulse rounded-lg flex items-center justify-center">
                                <p className="text-muted-foreground">Caricamento slot in evidenza...</p>
                            </div>
                        )}
                    </span>
                    <span className="m-8">
                        <section>
                            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 mt-8 text-muted-foreground leading-tight">Top Slot</h2>
                            {topSlots.length > 0 && !slotsLoading ? (
                                <AnimatedGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" staggerDelay={0.2}>
                                    {topSlots.map((slot) => (
                                        <SlotDemoCard
                                            key={slot.id}
                                            variant="grid"
                                            slot={slot}
                                        />
                                    ))}
                                </AnimatedGrid>
                            ) : slotsLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="w-full h-48 bg-muted animate-pulse rounded-lg"></div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">Nessuna slot trovata.</p>
                            )}
                        </section>
                    </span>
                    <span className="m-4 flex justify-center">
                        <Link href={'/slots'} target="_self">
                            <Button size={'lg'}>
                                Scopri di più
                            </Button>
                        </Link>
                    </span>
                </section>
            </AnimatedSection>

            <AnimatedSection delay={0.4}>
                <section>
                    <div className="mt-10">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6">
                            Casinò Sicuri e Certificati ADM
                        </h1>
                        <p className="text-base md:text-lg lg:text-xl leading-relaxed md:leading-loose text-foreground/90 max-w-6xl">
                            Le piattaforme di casinò italiane sono rigorosamente regolamentate e controllate da <span className="font-semibold text-foreground">ADM</span>. Quando ADM rilascia una licenza (GAD), il sito di gioco è sicuro e regolamentato al 100%.
                            <br className="hidden md:block" />
                            <br className="hidden md:block" />
                            Solo i siti con regolare licenza ADM garantiscono un gioco sicuro, legale ed affidabile sotto ogni punto di vista. ADM infatti, regola e garantisce la sicurezza di tutti i casinò online italiani. Inoltre vi sono severi controlli periodici a tutela anche dei giocatori stessi.
                            <br className="hidden md:block" />
                            <br className="hidden md:block" />
                            Per giocare d'azzardo su internet è necessario essere maggiorenni. Ogni singola giocata (sessione) viene registrata con un apposito numero di sessione ed un ID Ticket. Anche i sistemi di pagamento presenti nei casinò online autorizzati ADM sono sicuri poiché, anch'essi, controllati dai Monopoli di Stato.
                            <br className="hidden md:block" />
                            <br className="hidden md:block" />
                            Tanti sono i metodi di pagamento per depositare, altrettanti sono i metodi di pagamento per prelevare (Postepay, PayPal, Carte di Credito, Bonifico Bancario, Skrill, Paysafecard, ecc).
                        </p>
                    </div>
                    <span className="flex justify-center mt-8">
                        <Image
                            src="/assets/adm/logo_adm_wt.png"
                            alt="ADM - Agenzia delle Dogane e dei Monopoli"
                            width={150}
                            height={150}
                        />
                    </span>
                </section>
            </AnimatedSection>

            <MobileAdsSection className="md:hidden" />

            <AnimatedSection delay={0.45}>
                <section>
                    <div className="mb-6">
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-muted-foreground leading-tight">Dal Blog</h2>
                    </div>
                    <div>
                        <span className="m-8">
                            {blogPosts.length > 0 && !blogLoading ? (
                                <AnimatedGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" staggerDelay={0.2}>
                                    {blogPosts.slice(0, 3).map((post) => (
                                        <BlogPostCard
                                            key={post.id}
                                            variant="grid"
                                            post={post}
                                        />
                                    ))}
                                </AnimatedGrid>
                            ) : blogLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="w-full h-64 bg-muted animate-pulse rounded-lg"></div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">Nessun articolo trovato.</p>
                            )}
                        </span>
                        <span className="m-4 flex justify-center">
                            <Link href={'/blog'} target="_self">
                                <Button size={'lg'}>
                                    Leggi tutti gli articoli
                                </Button>
                            </Link>
                        </span>
                    </div>
                </section>
            </AnimatedSection>

            <AnimatedSection delay={0.5}>
                <section className="mt-16">
                    <div className="mb-8">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4">Chi è Jokerman79</h1>
                        <p className="text-lg md:text-xl lg:text-2xl font-satoshi text-primary leading-relaxed">L&apos;esperto del mondo dei casinò</p>
                    </div>
                    <div className="mt-8">
                        <AboutCard />
                    </div>
                    <div className="mt-8">
                        <TransformationSection />
                    </div>
                </section>
            </AnimatedSection>

            <AnimatedSection delay={0.6}>
                <section className="mt-16">
                    <div className="mb-8">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">I Partner</h1>
                    </div>
                    {partnersError ? (
                        <div className="mt-8 p-6 bg-muted/50 rounded-lg text-center">
                            <p className="text-muted-foreground">
                                Al momento non è possibile caricare i partner.
                            </p>
                            {process.env.NODE_ENV === 'development' && (
                                <p className="text-xs text-muted-foreground mt-2">
                                    Errore: {partnersError.message || 'Errore di connessione'}
                                </p>
                            )}
                        </div>
                    ) : partners.length > 0 && !partnersLoading ? (
                        <AnimatedGrid className="mt-8 flex flex-col gap-6" staggerDelay={0.3}>
                            {partners.map((partner) => (
                                <Partner
                                    key={partner.id}
                                    img={partner.img}
                                    imgAlt={partner.imgAlt}
                                    name={partner.name}
                                    text={partner.text}
                                    isReversed={partner.isReversed}
                                />
                            ))}
                        </AnimatedGrid>
                    ) : partnersLoading ? (
                        <div className="mt-8 flex flex-col gap-6">
                            {[1, 2].map((i) => (
                                <div key={i} className="w-full h-48 bg-muted animate-pulse rounded-lg"></div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground mt-8">Nessun partner trovato.</p>
                    )}
                </section>
            </AnimatedSection>
        </main>
    );
}
