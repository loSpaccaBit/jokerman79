const axios = require('axios');
const fs = require('fs');

const STRAPI_URL = 'http://192.168.1.12:1337';

// Provider che hanno fallito con metaTitle e metaDescription corretti
const failedProviders = [
    {
        name: "Spinomenal",
        slug: "spinomenal",
        isVisible: true,
        description: "Spinomenal è un provider iGaming innovativo e creativo, specializzato in slot online dal design moderno e ottimizzate per il digitale.",
        foundedYear: "2014",
        country: "Israele",
        website: "https://www.spinomenal.com/",
        rating: 4.5,
        licenses: ["Malta Gaming Authority"],
        reviewSummary: "Spinomenal è un provider di giochi di slot online con oltre 300 titoli nel suo catalogo. È noto per la sua creatività, innovazione e ottimizzazione per il mondo digitale.",
        reviewPros: [
            "Slot con design moderno e dinamico",
            "Oltre 300 titoli disponibili",
            "Funzionalità dinamiche come giri gratuiti interattivi, moltiplicatori e jackpot locali",
            "Ottimizzazione completa per il digitale",
            "Presenza globale con licenze in numerosi mercati regolamentati",
            "Agile e veloce nello sviluppo dei giochi",
            "Slot leggere, con caricamento rapido e prestazioni fluide"
        ],
        reviewCons: [
            "Potrebbe non essere adatto a chi cerca giochi tradizionali da casinò",
            "Non tutti i giochi sono disponibili in tutti i mercati",
            "Non offre giochi dal vivo",
            "Mancanza di titoli con temi sportivi",
            "Non offre poker o giochi da tavolo"
        ],
        reviewVerdict: "## Verdetto Finale\n\n**Spinomenal: Innovazione e Creatività nelle Slot Online**\n\nSpinomenal si distingue come uno dei provider di slot online più creativi e innovativi. Con un catalogo ricco e variegato, ottimizzazione completa per il digitale e una presenza globale, è un'ottima scelta per gli appassionati di slot.",
        seo: {
            metaTitle: "Spinomenal: Slot Online Innovative e Creative",
            metaDescription: "Scopri Spinomenal, provider di slot online con oltre 300 titoli. Design moderno, creatività e ottimizzazione digitale.",
            keywords: "Spinomenal, slot online, giochi da casinò, provider iGaming, slot digitali",
            canonicalURL: "/providers/spinomenal"
        }
    },
    {
        name: "Octavian Gaming",
        slug: "octavian-gaming",
        isVisible: true,
        description: "Octavian Gaming, eccellenza italiana nel settore iGaming, offre un'ampia gamma di slot online di alta qualità e innovazione tecnologica.",
        foundedYear: "2000",
        country: "Italia",
        rating: 4.8,
        licenses: ["ADM (ex AAMS)"],
        reviewSummary: "Octavian Gaming, con oltre due decenni di esperienza, offre slot online con design accattivante e dinamiche intuitive. L'azienda è ampiamente riconosciuta per la sua innovazione e qualità nel settore iGaming italiano.",
        reviewPros: [
            "Ampia gamma di slot online di alta qualità",
            "Innovazione tecnologica",
            "Profondo radicamento nel mercato italiano",
            "Slot progettate in HTML5, compatibili con vari dispositivi",
            "Interfaccia di gioco semplice e accessibile",
            "Certificata da ADM (ex AAMS)",
            "Produzione interna garanzia di qualità e originalità"
        ],
        reviewCons: [
            "Mancanza di un sito web ufficiale",
            "Focus principalmente sul mercato italiano",
            "Manca una varietà di giochi oltre alle slot",
            "Non tutti i giochi sono disponibili su piattaforme mobili",
            "Mancanza di trasparenza sulle percentuali di vincita"
        ],
        reviewVerdict: "## Verdetto Finale\n\n**Octavian Gaming: Un Leader nell'iGaming Italiano**\n\nOctavian Gaming è un provider di eccellenza nel settore delle slot machine online. Con una forte propensione all'innovazione e alla qualità, l'azienda si distingue per la sua vasta gamma di giochi e la sua profonda conoscenza del mercato italiano.",
        seo: {
            metaTitle: "Octavian Gaming: Eccellenza Italiana nel Gioco Online",
            metaDescription: "Scopri Octavian Gaming, leader nelle slot machine online italiane. Innovazione, qualità e oltre 20 anni di esperienza.",
            keywords: "Octavian Gaming, slot machine online, iGaming italiano",
            canonicalURL: "/providers/octavian-gaming"
        }
    },
    {
        name: "RubyPlay",
        slug: "rubyplay-casino-provider",
        isVisible: true,
        description: "RubyPlay, provider iGaming innovativo, offre esperienze di gioco moderne e coinvolgenti grazie alla sua passione per le slot tradizionali.",
        foundedYear: "2018",
        country: "Malta",
        website: "https://www.rubyplay.com",
        rating: 4.5,
        licenses: ["Malta Gaming Authority"],
        reviewSummary: "RubyPlay è un provider iGaming che combina artigianalità, creatività e tecnologia per creare esperienze di gioco memorabili. Con una forte presenza internazionale, offre giochi di alta qualità con temi originali e meccaniche bonus innovative.",
        reviewPros: [
            "Offerta dinamica e tecnologicamente avanzata",
            "Approccio artigianale nella creazione dei giochi",
            "Slot coinvolgenti con temi originali e meccaniche bonus creative",
            "Tecnologia Full HTML5 per un'esperienza di gioco fluida",
            "Piattaforma flessibile per l'integrazione diretta",
            "Conformità con le normative internazionali",
            "Presenza internazionale in costante crescita"
        ],
        reviewCons: [
            "Relativamente giovane nel mercato iGaming",
            "Potrebbe non soddisfare tutti i gusti dei giocatori",
            "Potrebbe beneficiare di una maggiore diversità di giochi",
            "Non tutti i giochi hanno una versione demo disponibile",
            "Potrebbe espandere ulteriormente la sua presenza in alcuni mercati"
        ],
        reviewVerdict: "## Verdetto Finale\n\n**RubyPlay: Innovazione e Artigianalità nel Mondo delle Slot Online**\n\nRubyPlay è un provider iGaming che offre un perfetto equilibrio tra artigianalità, creatività e tecnologia. Con un catalogo in continua crescita e una produzione curata nei minimi dettagli, è ormai una realtà solida nel mercato dell'iGaming.",
        seo: {
            metaTitle: "RubyPlay: Innovazione e Artigianalità nelle Slot",
            metaDescription: "Scopri RubyPlay, provider iGaming che unisce creatività e tecnologia per esperienze di gioco uniche e coinvolgenti.",
            keywords: "RubyPlay, provider iGaming, slot online, giochi moderni, esperienze di gioco",
            canonicalURL: "/providers/rubyplay-casino-provider"
        }
    },
    {
        name: "Tada Games",
        slug: "tada-games",
        isVisible: true,
        description: "Tada Games è un provider innovativo di slot online italiano, noto per la sua creatività, tecnologia avanzata e profonda conoscenza del mercato.",
        foundedYear: "2018",
        country: "Italia",
        rating: 4.5,
        licenses: [],
        reviewSummary: "Tada Games è un provider di slot online emergente, noto per i suoi giochi coinvolgenti, l'approccio fresco, e l'attenzione al mercato italiano e internazionale.",
        reviewPros: [
            "Offre giochi coinvolgenti con grafica di alta qualità",
            "Fornisce un'esperienza di gioco unica grazie alle meccaniche innovative",
            "Offre giochi sviluppati in HTML5, ottimizzati per desktop e mobile",
            "Promuove il gioco responsabile",
            "Ha una presenza forte nei mercati regolamentati",
            "Possiede un team appassionato di sviluppatori e creativi",
            "Ha un catalogo in rapida crescita"
        ],
        reviewCons: [
            "Ancora giovane e in fase di espansione",
            "Non ha un sito web ufficiale",
            "Le licenze specifiche non sono note",
            "Potrebbe non essere noto a un pubblico più ampio",
            "La varietà dei temi potrebbe essere limitata"
        ],
        reviewVerdict: "## Verdetto Finale\n\n**Tada Games: Innovazione e Creatività nel Mondo delle Slot Online**\n\nTada Games è un provider di slot online che merita attenzione grazie alla sua combinazione di creatività, tecnologia avanzata e attenzione al mercato locale. Nonostante la sua giovane età, l'azienda ha dimostrato di essere un attore promettente nel panorama dell'iGaming.",
        seo: {
            metaTitle: "Tada Games: Innovazione Italiana nelle Slot Online",
            metaDescription: "Scopri Tada Games, provider italiano di slot innovative con creatività e tecnologia avanzata per esperienze uniche.",
            keywords: "Tada Games, slot online, giochi online, iGaming, casinò online",
            canonicalURL: "/providers/tada-games"
        }
    },
    {
        name: "Yggdrasil Gaming",
        slug: "yggdrasil-gaming",
        isVisible: true,
        description: "Yggdrasil Gaming, leader globale nel settore delle slot online, offre un mix perfetto di creatività, tecnologia avanzata e attenzione all'esperienza utente.",
        foundedYear: "2013",
        country: "Svezia",
        rating: 4.5,
        licenses: ["Malta Gaming Authority (MGA)", "UK Gambling Commission (UKGC)"],
        reviewSummary: "Yggdrasil Gaming è un provider di slot online di alta qualità con un forte impegno per l'innovazione e l'esperienza utente. La sua presenza è consolidata nei mercati regolamentati globali.",
        reviewPros: [
            "Ampio catalogo di giochi innovativi",
            "Compatibilità ottimale su dispositivi desktop e mobile",
            "Grafica di alta qualità e animazioni sofisticate",
            "Funzionalità bonus complesse e sistemi di vincita unici",
            "Impegno attivo nella promozione del gioco responsabile",
            "Licenze da enti regolatori di rilievo",
            "Capacità di adattarsi rapidamente alle nuove tendenze del settore"
        ],
        reviewCons: [
            "Non offre giochi live",
            "Assenza di giochi da tavolo tradizionali",
            "Mancanza di un programma di fidelizzazione",
            "Non offre servizio di assistenza diretta",
            "Limitata presenza nei mercati non regolamentati"
        ],
        reviewVerdict: "## Verdetto Finale\n\n**Yggdrasil: Un Gigante delle Slot Online**\n\nYggdrasil Gaming si distingue per l'alta qualità dei suoi giochi di slot, il suo impegno per l'innovazione e la sua attenzione all'esperienza utente. Grazie alla sua presenza consolidata nei mercati regolamentati, Yggdrasil è un provider di fiducia per i giocatori di tutto il mondo.",
        seo: {
            metaTitle: "Yggdrasil Gaming: Leader globale nelle slot online",
            metaDescription: "Scopri Yggdrasil Gaming, gigante delle slot online con innovazione, qualità e impegno per un'esperienza utente superiore.",
            keywords: "Yggdrasil Gaming, slot online, provider iGaming",
            canonicalURL: "/providers/yggdrasil-gaming"
        }
    },
    {
        name: "STAKELOGIC",
        slug: "stakelogic-casino-online",
        isVisible: true,
        description: "Stakelogic, provider olandese di slot online, offre giochi con grafica avanzata e funzionalità innovative. Fondato nel 2014, è apprezzato per la sua qualità e creatività.",
        foundedYear: "2014",
        country: "Paesi Bassi",
        website: "https://www.stakelogic.com/",
        rating: 4.5,
        licenses: ["Malta Gaming Authority (MGA)", "UK Gambling Commission (UKGC)"],
        reviewSummary: "Stakelogic è un provider di slot online olandese noto per la sua innovazione tecnologica, design creativo e affidabilità. Con un catalogo in continua espansione, è uno dei provider più apprezzati nel settore dell'iGaming.",
        reviewPros: [
            "Ampia varietà di giochi",
            "Grafica avanzata e animazioni di alta qualità",
            "Compatibilità su desktop e dispositivi mobili",
            "Licenze internazionali riconosciute",
            "Impegno nel gioco responsabile",
            "Innovazione e creatività",
            "Collaborazioni con operatori leader"
        ],
        reviewCons: [
            "Crescita rapida potrebbe portare a problemi di qualità",
            "Non tutti i giochi sono disponibili in tutte le regioni",
            "Supporto clienti potrebbe essere migliorato",
            "Non tutti i giochi offrono funzionalità bonus",
            "Manca una sezione dedicata ai giochi da tavolo"
        ],
        reviewVerdict: "## Verdetto Finale\n\n**Stakelogic: Innovazione Olandese nel Mondo delle Slot Online**\n\nStakelogic è un provider di slot online di alta qualità, con una vasta gamma di giochi innovativi. La sua attenzione alla tecnologia avanzata e al design creativo ne fa un'opzione eccellente per i giocatori che cercano un'esperienza di gioco coinvolgente e visivamente impressionante.",
        seo: {
            metaTitle: "Stakelogic: Slot Innovative di Qualità Olandese",
            metaDescription: "Scopri Stakelogic, provider olandese di slot online con innovazione, grafica avanzata e vasta gamma di giochi creativi.",
            keywords: "Stakelogic, slot online, provider di giochi, casino online, recensione Stakelogic",
            canonicalURL: "/providers/stakelogic-casino-online"
        }
    },
    {
        name: "Spinmatic",
        slug: "spinmatic-casino-provider",
        isVisible: true,
        description: "Spinmatic, provider di slot online emergente, offre giochi con design moderno e tecnologia avanzata, con attenzione al mercato europeo e mediterraneo.",
        foundedYear: "2017",
        country: "Malta",
        rating: 4.5,
        licenses: ["Malta Gaming Authority (MGA)"],
        reviewSummary: "Spinmatic si distingue per la sua combinazione di design moderno, tecnologia avanzata e un'attenzione particolare alle esigenze del mercato europeo e mediterraneo. Offre giochi con grafica accattivante e meccaniche di gioco coinvolgenti.",
        reviewPros: [
            "Offre giochi con design moderno e tecnologia avanzata",
            "Attenzione particolare al mercato europeo e mediterraneo",
            "Giochi con grafica accattivante e meccaniche di gioco coinvolgenti",
            "Presenza consolidata in diversi mercati regolamentati",
            "Adattabilità alle tendenze di settore",
            "Ottimizzazione mobile per un'esperienza di gioco fluida e accessibile",
            "Impegnata nella promozione del gioco responsabile"
        ],
        reviewCons: [
            "Azienda relativamente nuova nel settore",
            "Catalogo di giochi ancora in espansione",
            "Presenza limitata in alcuni mercati"
        ],
        reviewVerdict: "## Verdetto Finale\n\n**Spinmatic: Innovazione e Qualità dal Cuore del Mediterraneo**\n\nSpinmatic si conferma come un provider in crescita nel panorama delle slot online, capace di combinare innovazione, qualità grafica e attenzione al mercato. Con un catalogo in continua evoluzione e una forte presenza nei mercati regolamentati, rappresenta un'opzione interessante per operatori e giocatori in cerca di nuove esperienze di gioco.",
        seo: {
            metaTitle: "Spinmatic: Innovazione Mediterranea nelle Slot Online",
            metaDescription: "Scopri Spinmatic, provider emergente di slot con design moderno e tecnologia avanzata per il mercato europeo.",
            keywords: "Spinmatic, provider di slot online, giochi di casino, casino online, Malta Gaming Authority",
            canonicalURL: "/providers/spinmatic-casino-provider"
        }
    },
    {
        name: "SevenABC",
        slug: "sevenabc-casino-provider",
        isVisible: true,
        description: "SevenABC è un provider iGaming emergente, noto per l'innovazione e la qualità delle sue slot online. Offre un'esperienza di gioco dinamica e coinvolgente.",
        foundedYear: "2019",
        country: "Malta",
        website: "www.sevenabc.com",
        rating: 4.5,
        licenses: ["UK Gambling Commission", "Malta Gaming Authority"],
        reviewSummary: "SevenABC si sta affermando come un player affidabile nel mondo delle slot online, grazie alla sua attenzione per l'innovazione, la qualità del prodotto e l'esperienza utente. Nonostante la sua giovane età, ha già un catalogo variegato e in crescita.",
        reviewPros: [
            "Innovazione e dinamismo",
            "Ampio catalogo di slot",
            "Grafiche curate",
            "Funzionalità coinvolgenti",
            "Compatibilità con dispositivi desktop e mobile",
            "Impegno per la sicurezza",
            "Licenze internazionali"
        ],
        reviewCons: [
            "Azienda relativamente nuova",
            "Presenza ancora limitata in alcuni mercati",
            "Mancanza di giochi da tavolo",
            "Supporto clienti migliorabile",
            "Promozioni limitate"
        ],
        reviewVerdict: "## Verdetto Finale\n\n**Un Nuovo Player Promettente nel Mondo delle Slot Online**\n\nSevenABC si sta rapidamente affermando come un provider di slot online affidabile e innovativo. La sua attenzione alla qualità del prodotto e l'esperienza utente, unita a un catalogo in rapida crescita, lo rende un operatore da tenere d'occhio nel panorama iGaming.",
        seo: {
            metaTitle: "SevenABC: Innovazione e Qualità nelle Slot Online",
            metaDescription: "Scopri SevenABC, nuovo provider di slot online che conquista il mercato con innovazione e qualità eccellente.",
            keywords: "SevenABC, provider iGaming, slot online, giochi casino, casino online",
            canonicalURL: "/providers/sevenabc-casino-provider"
        }
    },
    {
        name: "Triple Cherry",
        slug: "triple-cherry-casino-provider",
        isVisible: true,
        description: "Triple Cherry è un provider di giochi online specializzato in slot classiche e innovative. Fondata nel 2017, offre un'esperienza di gioco unica e coinvolgente.",
        foundedYear: "2017",
        country: "Malta",
        website: "https://triplecherry.com",
        rating: 4.5,
        licenses: ["Malta Gaming Authority (MGA)"],
        reviewSummary: "Triple Cherry è un provider di giochi online che combina la tradizione delle slot classiche con un approccio innovativo. Offre un'ampia gamma di giochi con grafica curata e meccaniche di gioco coinvolgenti.",
        reviewPros: [
            "Ampio catalogo di giochi",
            "Estetica curata e gameplay armonioso",
            "Compatibilità e ottimizzazione mobile",
            "Presenza in mercati regolamentati",
            "Licenze riconosciute",
            "Esperienza di gioco fluida e accessibile",
            "Attenzione alla qualità e alla sicurezza"
        ],
        reviewCons: [
            "Fondata solo nel 2017",
            "Sede centrale a Malta, lontana da alcuni mercati",
            "Mancanza di giochi oltre alle slot",
            "Non tutti i giochi sono disponibili in tutte le lingue",
            "Mancanza di un servizio clienti dedicato"
        ],
        reviewVerdict: "## Verdetto Finale\n\n**Triple Cherry: Unione Perfetta di Tradizione e Innovazione nelle Slot Online**\n\nTriple Cherry offre un'esperienza di gioco unica, unendo la tradizione delle slot classiche con un approccio innovativo. Con una forte identità visiva, gameplay coinvolgente e una grande attenzione alla qualità e alla sicurezza, questo provider si distingue come un'opzione interessante per operatori e giocatori.",
        seo: {
            metaTitle: "Triple Cherry: Slot Classiche e Innovative Online",
            metaDescription: "Scopri Triple Cherry, provider che unisce tradizione e innovazione nelle slot online con design curato e gameplay unico.",
            keywords: "Triple Cherry, provider giochi online, slot classiche, slot innovative, giochi casino online",
            canonicalURL: "/providers/triple-cherry-casino-provider"
        }
    },
    {
        name: "Nemesis Gaming",
        slug: "nemesis-gaming",
        isVisible: true,
        description: "Nemesis Gaming, provider innovativo di slot online, combina design accattivante, tecnologia avanzata e gameplay coinvolgente.",
        foundedYear: "2018",
        country: "Malta",
        website: "https://www.nemesis-gaming.com",
        rating: 4.5,
        licenses: ["Malta Gaming Authority", "UK Gambling Commission"],
        reviewSummary: "Nemesis Gaming si distingue per la sua capacità di combinare innovazione e creatività nel settore delle slot online, offrendo un'esperienza di gioco coinvolgente e sicura.",
        reviewPros: [
            "Ampia varietà di slot con temi originali",
            "Design accattivante e animazioni fluide",
            "Funzionalità bonus innovative",
            "Ottimizzazione per dispositivi mobile",
            "Impegno nella promozione del gioco responsabile",
            "Licenze riconosciute a livello internazionale",
            "Elevati standard di sicurezza e trasparenza"
        ],
        reviewCons: [
            "Giovane età dell'azienda",
            "Catalogo di giochi ancora in espansione",
            "Presenza limitata in alcuni mercati",
            "Manca una app dedicata",
            "Non offre giochi live"
        ],
        reviewVerdict: "## Verdetto Finale\n\n**Nemesis Gaming: Un Provider di Slot Online da Seguire**\n\nNonostante la sua giovane età, Nemesis Gaming si è già fatto notare nel settore iGaming grazie alla sua capacità di combinare innovazione, qualità e affidabilità. Con un catalogo in costante espansione e un forte impegno per la sicurezza e il gioco responsabile, Nemesis è un nome da seguire con interesse.",
        seo: {
            metaTitle: "Nemesis Gaming: Innovazione nelle Slot Online",
            metaDescription: "Scopri Nemesis Gaming, provider che combina innovazione, design e gameplay coinvolgente per esperienze di gioco uniche.",
            keywords: "Nemesis Gaming, slot online, provider iGaming, gioco responsabile, sicurezza",
            canonicalURL: "/providers/nemesis-gaming"
        }
    }
];

async function createProvider(providerData) {
    try {
        console.log(`➕ Creazione provider: ${providerData.name}`);

        const response = await axios.post(`${STRAPI_URL}/api/providers`, {
            data: providerData
        });

        if (response.status === 200 || response.status === 201) {
            console.log(`✅ Provider ${providerData.name} creato con successo`);
            return true;
        }
    } catch (error) {
        console.log(`❌ Errore HTTP ${error.response?.status}: ${JSON.stringify(error.response?.data)}`);
        console.log(`❌ Errore durante la creazione di ${providerData.name}: ${error.message}`);
        return false;
    }
}

async function fixFailedProviders() {
    console.log('🚀 Avvio correzione provider falliti...\n');

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < failedProviders.length; i++) {
        const provider = failedProviders[i];
        console.log(`📦 Elaborando provider ${i + 1}/${failedProviders.length}: ${provider.name}`);

        const success = await createProvider(provider);
        if (success) {
            successCount++;
        } else {
            errorCount++;
        }

        // Pausa tra le richieste
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n🎉 Correzione completata!');
    console.log(`✅ Provider creati con successo: ${successCount}`);
    console.log(`❌ Provider con errori: ${errorCount}`);
}

fixFailedProviders();
