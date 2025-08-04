/**
 * GDPR Cookie Consent Management Types
 * Definizioni TypeScript per sistema completo di gestione consensi cookie
 */

export interface CookieCategory {
  id: string;
  name: string;
  description: string;
  required: boolean;
  cookies: CookieDefinition[];
}

export interface CookieDefinition {
  name: string;
  description: string;
  purpose: string;
  duration: string;
  provider: string;
  category: string;
  type: 'essential' | 'analytics' | 'marketing' | 'functional';
}

export interface ConsentSettings {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

export interface ConsentRecord {
  settings: ConsentSettings;
  timestamp: string;
  version: string;
  userAgent: string;
  ipHash?: string;
  consentMethod: 'banner' | 'settings' | 'implied';
}

export interface CookieConsentContextType {
  // Stato corrente dei consensi
  consent: ConsentSettings;
  consentGiven: boolean;
  
  // Metodi per gestire i consensi
  updateConsent: (newConsent: Partial<ConsentSettings>) => void;
  acceptAll: () => void;
  rejectNonEssential: () => void;
  resetConsent: () => void;
  
  // Utility per verificare consensi
  hasConsent: (category: keyof ConsentSettings) => boolean;
  canUseAnalytics: () => boolean;
  canUseMarketing: () => boolean;
  
  // Gestione banner
  showBanner: boolean;
  dismissBanner: () => void;
  showPreferences: boolean;
  togglePreferences: () => void;
  
  // Metadati
  consentVersion: string;
  lastUpdated?: string;
}

export interface BannerTexts {
  title: string;
  description: string;
  acceptAll: string;
  rejectAll: string;
  customize: string;
  necessary: string;
  analytics: string;
  marketing: string;
  functional: string;
  save: string;
  close: string;
}

export interface CookiePolicySection {
  id: string;
  title: string;
  content: string;
  cookies?: CookieDefinition[];
}

/**
 * Configurazione categorie cookie per piattaforma gaming italiana
 */
export const COOKIE_CATEGORIES: CookieCategory[] = [
  {
    id: 'necessary',
    name: 'Cookie Necessari',
    description: 'Questi cookie sono essenziali per il funzionamento del sito web e non possono essere disabilitati.',
    required: true,
    cookies: [
      {
        name: 'cookie-consent',
        description: 'Memorizza le preferenze di consenso dell\'utente',
        purpose: 'Conformità GDPR e gestione consensi',
        duration: '1 anno',
        provider: 'Jokerman79',
        category: 'necessary',
        type: 'essential'
      },
      {
        name: 'session-id',
        description: 'Identificatore di sessione per mantenere lo stato dell\'utente',
        purpose: 'Funzionalità essenziale del sito',
        duration: 'Sessione',
        provider: 'Jokerman79',
        category: 'necessary',
        type: 'essential'
      }
    ]
  },
  {
    id: 'analytics',
    name: 'Cookie Analitici',
    description: 'Ci aiutano a capire come i visitatori interagiscono con il sito raccogliendo e riportando informazioni in forma anonima.',
    required: false,
    cookies: [
      {
        name: '_ga',
        description: 'Cookie principale di Google Analytics per distinguere gli utenti',
        purpose: 'Analisi del traffico e comportamento utenti',
        duration: '2 anni',
        provider: 'Google Analytics',
        category: 'analytics',
        type: 'analytics'
      },
      {
        name: '_ga_*',
        description: 'Cookie di Google Analytics 4 per raccolta dati analytics',
        purpose: 'Analisi avanzata del comportamento utenti',
        duration: '2 anni',
        provider: 'Google Analytics',
        category: 'analytics',
        type: 'analytics'
      },
      {
        name: 'web-vitals',
        description: 'Metriche di performance del sito (Core Web Vitals)',
        purpose: 'Monitoraggio performance e ottimizzazione UX',
        duration: 'Sessione',
        provider: 'Jokerman79',
        category: 'analytics',
        type: 'analytics'
      }
    ]
  },
  {
    id: 'marketing',
    name: 'Cookie Marketing',
    description: 'Vengono utilizzati per tracciare i visitatori attraverso i siti web per mostrare annunci rilevanti e coinvolgenti.',
    required: false,
    cookies: [
      {
        name: '_fbp',
        description: 'Cookie Facebook Pixel per tracking conversioni',
        purpose: 'Remarketing e misurazione efficacia pubblicitaria',
        duration: '3 mesi',
        provider: 'Facebook',
        category: 'marketing',
        type: 'marketing'
      }
    ]
  },
  {
    id: 'functional',
    name: 'Cookie Funzionali',
    description: 'Permettono al sito web di ricordare le scelte fatte dall\'utente per fornire funzionalità migliorate.',
    required: false,
    cookies: [
      {
        name: 'theme-preference',
        description: 'Memorizza la preferenza tema (chiaro/scuro) dell\'utente',
        purpose: 'Personalizzazione interfaccia utente',
        duration: '1 anno',
        provider: 'Jokerman79',
        category: 'functional',
        type: 'functional'
      },
      {
        name: 'accessibility-settings',
        description: 'Memorizza le impostazioni di accessibilità personalizzate',
        purpose: 'Accessibilità e usabilità migliorata',
        duration: '1 anno',
        provider: 'Jokerman79',
        category: 'functional',
        type: 'functional'
      }
    ]
  }
];

/**
 * Testi default per il banner consensi (Italiano)
 */
export const DEFAULT_BANNER_TEXTS: BannerTexts = {
  title: 'Utilizziamo i Cookie',
  description: 'Utilizziamo cookie per personalizzare contenuti e analizzare il nostro traffico. Condividiamo anche informazioni sull\'utilizzo del nostro sito con i nostri partner per analisi e pubblicità che possono combinarle con altre informazioni. Puoi gestire le tue preferenze in qualsiasi momento.',
  acceptAll: 'Accetta Tutti',
  rejectAll: 'Rifiuta Non Necessari', 
  customize: 'Personalizza Preferenze',
  necessary: 'Necessari',
  analytics: 'Analitici',
  marketing: 'Marketing',
  functional: 'Funzionali',
  save: 'Salva Preferenze',
  close: 'Chiudi'
};

/**
 * Costanti per la gestione dei consensi
 */
export const CONSENT_VERSION = '1.0.0';
export const CONSENT_STORAGE_KEY = 'jokerman79-cookie-consent';
export const CONSENT_BANNER_STORAGE_KEY = 'jokerman79-banner-dismissed';
export const CONSENT_EXPIRY_DAYS = 365;

/**
 * Consensi di default (solo necessari)
 */
export const DEFAULT_CONSENT_SETTINGS: ConsentSettings = {
  necessary: true,
  analytics: false,
  marketing: false,
  functional: false
};