"use client"

import { Badge } from "../ui/badge";
import { motion } from "framer-motion";
import { AnimatedTimelineStep } from "../animations/AnimatedTimelineStep";

export function TransformationSection() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.div
                className="text-center space-y-2"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20%" }}
                transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            >
                <h2 className="font-tanker text-3xl md:text-4xl text-muted-foreground">
                    La Trasformazione
                </h2>
                <p className="text-muted-foreground text-lg">
                    Il percorso che ha cambiato tutto
                </p>
            </motion.div>

            {/* Timeline della trasformazione */}
            <div className="relative max-w-4xl mx-auto">
                {/* Linea verticale */}
                <motion.div
                    className="absolute left-4 md:left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-transparent z-0"
                    initial={{ scaleY: 0, opacity: 0 }}
                    whileInView={{ scaleY: 1, opacity: 1 }}
                    viewport={{ once: true, margin: "-30%" }}
                    transition={{ duration: 1.5, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                    style={{ transformOrigin: "top" }}
                ></motion.div>

                {/* Steps container */}
                <div className="relative z-10">
                    {/* Step 1 */}
                    <AnimatedTimelineStep stepNumber={1} delay={0.3} className="mb-8 md:mb-12">
                        <Badge variant="secondary" className="mb-3">
                            🎓 Gli Inizi (2015-2017)
                        </Badge>
                        <h3 className="font-tanker text-xl md:text-2xl text-primary mb-3">
                            La Scoperta della Passione
                        </h3>
                        <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                            Durante gli anni universitari, Fabio inizia con piccole partite tra amici.
                            Quello che sembrava un semplice passatempo si trasforma rapidamente in una vera passione.
                            Studia strategie, analizza probabilità e sviluppa un approccio scientifico al gioco.
                        </p>
                    </AnimatedTimelineStep>

                    {/* Step 2 */}
                    <AnimatedTimelineStep stepNumber={2} delay={0.5} className="mb-8 md:mb-12">
                        <Badge variant="secondary" className="mb-3">
                            🏛️ L&apos;Esperienza (2018-2020)
                        </Badge>
                        <h3 className="font-tanker text-xl md:text-2xl text-primary mb-3">
                            I Primi Casinò
                        </h3>
                        <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                            Fabio inizia a frequentare i principali casinò italiani. Venezia, Sanremo, Campione:
                            ogni tavolo diventa una lezione. Impara a leggere gli avversari, a gestire le emozioni
                            e soprattutto a rispettare i limiti del gioco responsabile.
                        </p>
                    </AnimatedTimelineStep>

                    {/* Step 3 */}
                    <AnimatedTimelineStep stepNumber={3} delay={0.7} className="mb-8 md:mb-12">
                        <Badge variant="secondary" className="mb-3">
                            💡 L&apos;Evoluzione (2021-2023)
                        </Badge>
                        <h3 className="font-tanker text-xl md:text-2xl text-primary mb-3">
                            Dall&apos;Online alla Condivisione
                        </h3>
                        <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                            Con l&apos;avvento del digitale, Fabio scopre il mondo delle slot online e dei casinò virtuali.
                            Capisce l&apos;importanza di condividere la sua esperienza: nasce l&apos;idea di creare contenuti
                            educativi per aiutare altri giocatori a sviluppare un approccio consapevole.
                        </p>
                    </AnimatedTimelineStep>

                    {/* Step 4 */}
                    <AnimatedTimelineStep stepNumber={4} delay={0.9} className="mb-6">
                        <Badge variant="secondary" className="mb-3">
                            🚀 Jokerman79 Oggi (2024-2025)
                        </Badge>
                        <h3 className="font-tanker text-xl md:text-2xl text-primary mb-3">
                            La Missione di Jokerman79
                        </h3>
                        <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                            Oggi Fabio è diventato Jokerman79: un punto di riferimento per chi vuole approcciarsi
                            al gioco d&apos;azzardo in modo responsabile. La sua missione è educare, intrattenere e
                            promuovere sempre il gioco consapevole, condividendo strategie e esperienze autentiche.
                        </p>
                    </AnimatedTimelineStep>
                </div>
            </div>

            {/* Quote finale */}
            <motion.div
                className="bg-muted/50 rounded-2xl p-6 md:p-8 text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20%" }}
                transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            >
                <blockquote className="text-lg md:text-xl font-medium text-primary italic mb-4">
                    &ldquo;Il gioco non è solo fortuna, è strategia, psicologia e soprattutto responsabilità.
                    La vera vittoria è sapere quando fermarsi.&rdquo;
                </blockquote>
                <cite className="text-muted-foreground font-tanker">
                    — Fabio &ldquo;Jokerman79&rdquo;
                </cite>
            </motion.div>
        </div>
    );
}
