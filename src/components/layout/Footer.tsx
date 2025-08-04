import Image from "next/image";
import { Button } from "../ui/button";
import { Facebook, Instagram, Youtube, MessageCircle } from "lucide-react";
import Link from "next/link";

export function Footer() {
    return (
        <footer
            className="min-h-48 md:min-h-64 rounded-2xl bg-sidebar border border-primary p-4 md:p-6"
            role="contentinfo"
            aria-label="Footer del sito"
        >
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4 md:mb-6">
                <div className="flex-shrink-0">
                    <Image
                        src={'/assets/logo_2.svg'}
                        alt="Logo Jokerman79"
                        width={100}
                        height={100}
                        className="w-20 h-20 md:w-25 md:h-25"
                    />
                </div>

                <div className="flex-shrink-0 order-last md:order-none text-center">
                    <Image
                        src={'/assets/adm/logo_adm_wt.png'}
                        alt="Logo ADM - Agenzia delle Dogane e dei Monopoli"
                        width={150}
                        height={150}
                        className="w-32 h-12 mx-auto mb-2"
                    />
                    <div className="max-w-xs">
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Il gioco è vietato ai minori e può causare dipendenza patologica
                            <br />
                            Consulta le probabilità di vincita su{' '}
                            <Link
                                href={'https://www.adm.gov.it'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline font-medium"
                                aria-label="Visita il sito ufficiale ADM (si apre in una nuova finestra)"
                            >
                                adm.gov.it
                            </Link>
                        </p>
                    </div>
                </div>

                <nav aria-label="Social media" className="flex gap-2 md:gap-3">
                    <Button
                        variant={'outline'}
                        size={'icon'}
                        className="h-8 w-8 md:h-10 md:w-10"
                        aria-label="Seguici su Facebook"
                    >
                        <Facebook className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button
                        variant={'outline'}
                        size={'icon'}
                        className="h-8 w-8 md:h-10 md:w-10"
                        aria-label="Seguici su Instagram"
                    >
                        <Instagram className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button
                        variant={'outline'}
                        size={'icon'}
                        className="h-8 w-8 md:h-10 md:w-10"
                        aria-label="Seguici su YouTube"
                    >
                        <Youtube className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button
                        variant={'outline'}
                        size={'icon'}
                        className="h-8 w-8 md:h-10 md:w-10"
                        aria-label="Contattaci su Telegram"
                    >
                        <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    </Button>
                </nav>
            </div>

            {/* Footer section con copyright e link */}
            <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-4">
                <div className="text-center md:text-left">
                    <p className="text-xs md:text-sm text-muted-foreground">
                        © Copyright 2025 - Tutti i diritti riservati - JokerMan79
                        <br className="hidden md:block" />
                        <span className="md:inline block mt-1 md:mt-0">
                            Creato con ❤️ da{' '}
                            <Link
                                href={'https://lospaccabit.vercel.app'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                                aria-label="Visita il sito di loSpaccaBit (si apre in una nuova finestra)"
                            >
                                loSpaccaBit
                            </Link>
                        </span>
                    </p>
                </div>

                <nav aria-label="Link legali" className="flex flex-row md:flex-col gap-2 md:gap-1 text-center md:text-right">
                    <Link
                        href={'/privacy-policy'}
                        className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors"
                        aria-label="Leggi la nostra Privacy Policy"
                    >
                        Privacy Policy
                    </Link>
                    <span className="text-muted-foreground md:hidden" aria-hidden="true">•</span>
                    <Link
                        href={'/terms-of-service'}
                        className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors"
                        aria-label="Leggi i Termini e condizioni"
                    >
                        Termini e condizioni
                    </Link>
                    <span className="text-muted-foreground md:hidden" aria-hidden="true">•</span>
                    <Link
                        href={'/disclaimer'}
                        className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors"
                        aria-label="Leggi il Disclaimer"
                    >
                        Disclaimer
                    </Link>
                </nav>
            </div>
        </footer>
    );
}