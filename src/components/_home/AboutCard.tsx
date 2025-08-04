import Image from "next/image";
import { Card, CardTitle } from "../ui/card";

export function AboutCard() {
    return (
        <Card className="overflow-hidden">
            <div className="flex flex-col md:flex-row p-4 md:p-8 lg:p-10">
                {/* Sezione immagine - sinistra */}
                <div className="relative h-64 md:h-80 lg:h-96 xl:h-[450px] md:w-2/5 lg:w-1/2 xl:w-[55%] flex-shrink-0 mb-4 md:mb-0 md:mr-8 lg:mr-10">
                    <div className="relative w-full h-full rounded-2xl overflow-hidden">
                        <Image
                            src={'/assets/fabio.png'}
                            alt="Jokerman79 - Fabio"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 40vw, (max-width: 1280px) 50vw, 55vw"
                            priority
                        />
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/60 via-transparent to-transparent" />

                        {/* Badge overlay */}
                        <div className="absolute bottom-4 left-4">
                            <div className="bg-primary/90 backdrop-blur-sm text-primary-foreground px-3 py-1 rounded-lg text-sm font-medium">
                                Jokerman79
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contenuto - destra */}
                <div className="flex-1 flex flex-col">
                    <div className="mb-4">
                        <CardTitle className="font-tanker text-2xl md:text-3xl text-primary">
                            Fabio
                        </CardTitle>
                    </div>

                    <div className="space-y-4 flex-1">
                        <p className="text-muted-foreground leading-relaxed">
                            Cresciuto in una famiglia della classe media, Fabio ha scoperto la sua passione per il gioco d&apos;azzardo durante gli anni di studio. Mentre i suoi coetanei si concentravano sui libri, lui affinava le sue abilità a poker con gli amici.
                        </p>

                        <p className="text-muted-foreground leading-relaxed">
                            Presto si rese conto che le carte non erano solo un passatempo, ma una sfida di strategia e psicologia che lo affascinava profondamente. Iniziò a frequentare i principali casinò italiani, immergendosi nel mondo del gioco d&apos;azzardo legale.
                        </p>

                        {/* Stats o highlights */}
                        <div className="flex flex-wrap gap-2 pt-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                                🎰 Esperto di Slot
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                                🃏 Strategia Poker
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                                🎯 Gioco Responsabile
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}