import { Shield, Gift, Users } from "lucide-react";
import Link from "next/link";

export function DisclamerTips() {
    return (
        <section className="w-full py-12 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Sezione 1: Gioco Responsabile - Link alla pagina di info */}
                    <Link 
                        href="/gioco-responsabile" 
                        className="text-center space-y-4 group hover:scale-105 transition-transform duration-200"
                    >
                        <div className="w-16 h-16 mx-auto bg-primary/10 group-hover:bg-primary/20 rounded-full flex items-center justify-center transition-colors">
                            <Shield className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg md:text-xl font-semibold leading-tight group-hover:text-primary transition-colors">
                                Gioco <span className="text-primary">Responsabile</span>
                            </h3>
                            <p className="text-sm text-muted-foreground mt-2">
                                Scopri strumenti e limiti per giocare in sicurezza
                            </p>
                        </div>
                    </Link>

                    {/* Sezione 2: Bonus Verificati - Link alla sezione bonus */}
                    <Link 
                        href="/#bonus-section" 
                        className="text-center space-y-4 group hover:scale-105 transition-transform duration-200"
                    >
                        <div className="w-16 h-16 mx-auto bg-primary/10 group-hover:bg-primary/20 rounded-full flex items-center justify-center transition-colors">
                            <Gift className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg md:text-xl font-semibold leading-tight group-hover:text-primary transition-colors">
                                <span className="text-primary">Bonus</span> Verificati
                            </h3>
                            <p className="text-sm text-muted-foreground mt-2">
                                Vedi tutti i bonus attivi e come ottenerli
                            </p>
                        </div>
                    </Link>

                    {/* Sezione 3: Giochi Live - Link alla pagina live */}
                    <Link 
                        href="/live-casino" 
                        className="text-center space-y-4 group hover:scale-105 transition-transform duration-200"
                    >
                        <div className="w-16 h-16 mx-auto bg-primary/10 group-hover:bg-primary/20 rounded-full flex items-center justify-center transition-colors">
                            <Users className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg md:text-xl font-semibold leading-tight group-hover:text-primary transition-colors">
                                Giochi <span className="text-primary">Live</span>
                            </h3>
                            <p className="text-sm text-muted-foreground mt-2">
                                Trova i migliori tavoli live con dealer reali
                            </p>
                        </div>
                    </Link>

                </div>
            </div>
        </section>
    );
}