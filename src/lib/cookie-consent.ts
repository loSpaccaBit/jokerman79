/**
 * GDPR Cookie Consent Management Utilities
 * Libreria completa per gestione consensi cookie conformi GDPR
 */

import { 
  ConsentSettings, 
  ConsentRecord, 
  DEFAULT_CONSENT_SETTINGS,
  CONSENT_VERSION,
  CONSENT_STORAGE_KEY,
  CONSENT_BANNER_STORAGE_KEY,
  CONSENT_EXPIRY_DAYS
} from '@/types/cookie-consent';

/**
 * Verifica se siamo in ambiente browser
 */
const isBrowser = typeof window !== 'undefined';

/**
 * Genera hash semplice per IP (per privacy)
 */
function simpleHash(str: string): string {
  let hash = 0;
  if (str.length === 0) return hash.toString();
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * Salva consenso nel localStorage con timestamp e metadati
 */
export function saveConsentRecord(
  consent: ConsentSettings, 
  method: 'banner' | 'settings' | 'implied' = 'banner'
): void {
  if (!isBrowser) return;

  const record: ConsentRecord = {
    settings: consent,
    timestamp: new Date().toISOString(),
    version: CONSENT_VERSION,
    userAgent: navigator.userAgent,
    consentMethod: method
  };

  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
    
    // Log del consenso per audit (solo in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('Cookie consent saved:', record);
    }
    
    // Invia evento per analytics (se consentito)
    if (consent.analytics && window.gtag) {
      window.gtag('event', 'consent_update', {
        event_category: 'GDPR',
        event_label: method,
        analytics_storage: consent.analytics ? 'granted' : 'denied',
        ad_storage: consent.marketing ? 'granted' : 'denied'
      });
    }
  } catch (error) {
    console.error('Failed to save consent record:', error);
  }
}

/**
 * Carica consenso dal localStorage
 */
export function loadConsentRecord(): ConsentRecord | null {
  if (!isBrowser) return null;

  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!stored) return null;

    const record: ConsentRecord = JSON.parse(stored);
    
    // Verifica validità del record (versione e scadenza)
    const recordDate = new Date(record.timestamp);
    const now = new Date();
    const daysDiff = (now.getTime() - recordDate.getTime()) / (1000 * 3600 * 24);
    
    if (daysDiff > CONSENT_EXPIRY_DAYS || record.version !== CONSENT_VERSION) {
      // Record scaduto o versione obsoleta
      localStorage.removeItem(CONSENT_STORAGE_KEY);
      return null;
    }

    return record;
  } catch (error) {
    console.error('Failed to load consent record:', error);
    localStorage.removeItem(CONSENT_STORAGE_KEY);
    return null;
  }
}

/**
 * Ottiene le impostazioni di consenso correnti
 */
export function getCurrentConsent(): ConsentSettings {
  const record = loadConsentRecord();
  return record?.settings || DEFAULT_CONSENT_SETTINGS;
}

/**
 * Verifica se l'utente ha già dato consenso
 */
export function hasConsentBeenGiven(): boolean {
  return loadConsentRecord() !== null;
}

/**
 * Verifica se una categoria specifica è consentita
 */
export function hasConsentForCategory(category: keyof ConsentSettings): boolean {
  const consent = getCurrentConsent();
  return consent[category] === true;
}

/**
 * Resetta tutti i consensi (per withdrawal completo)
 */
export function resetAllConsent(): void {
  if (!isBrowser) return;

  try {
    // Rimuovi record consenso
    localStorage.removeItem(CONSENT_STORAGE_KEY);
    localStorage.removeItem(CONSENT_BANNER_STORAGE_KEY);
    
    // Rimuovi cookie di tracking esistenti
    clearTrackingCookies();
    
    // Update Google Analytics consent
    if (window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        functionality_storage: 'denied',
        personalization_storage: 'denied'
      });
    }
    
    console.log('All cookie consent has been reset');
  } catch (error) {
    console.error('Failed to reset consent:', error);
  }
}

/**
 * Rimuove cookie di tracking esistenti
 */
export function clearTrackingCookies(): void {
  if (!isBrowser) return;

  const cookiesToClear = [
    '_ga', '_ga_*', '_gid', '_gat', '_gtag',
    '_fbp', '_fbc', 
    'web-vitals'
  ];

  cookiesToClear.forEach(cookieName => {
    // Clear for current domain
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    
    // Clear for parent domains
    const domainParts = window.location.hostname.split('.');
    for (let i = 0; i < domainParts.length - 1; i++) {
      const domain = '.' + domainParts.slice(i).join('.');
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`;
    }
  });
}

/**
 * Aggiorna Google Analytics consent mode
 */
export function updateGoogleAnalyticsConsent(consent: ConsentSettings): void {
  if (!isBrowser || !window.gtag) return;

  window.gtag('consent', 'update', {
    analytics_storage: consent.analytics ? 'granted' : 'denied',
    ad_storage: consent.marketing ? 'granted' : 'denied',
    functionality_storage: consent.functional ? 'granted' : 'denied',
    personalization_storage: consent.functional ? 'granted' : 'denied'
  });
}

/**
 * Carica script esterni condizionalmente
 */
export function loadConditionalScripts(consent: ConsentSettings): void {
  if (!isBrowser) return;

  // Google Analytics
  if (consent.analytics && !document.querySelector('script[src*="googletagmanager"]')) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`;
    document.head.appendChild(script);

    script.onload = () => {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag(...args: any[]) {
        window.dataLayer.push(args);
      };
      
      window.gtag('js', new Date());
      window.gtag('config', process.env.NEXT_PUBLIC_GA_ID!, {
        page_title: document.title,
        page_location: window.location.href
      });
      
      updateGoogleAnalyticsConsent(consent);
    };
  }

  // Facebook Pixel (se consenso marketing)
  if (consent.marketing && !window.fbq) {
    const script = document.createElement('script');
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${process.env.NEXT_PUBLIC_FB_PIXEL_ID}');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(script);
  }
}

/**
 * Gestisce il banner dismissal
 */
export function dismissBanner(): void {
  if (!isBrowser) return;
  localStorage.setItem(CONSENT_BANNER_STORAGE_KEY, 'true');
}

/**
 * Verifica se il banner è stato dismesso
 */
export function isBannerDismissed(): boolean {
  if (!isBrowser) return false;
  return localStorage.getItem(CONSENT_BANNER_STORAGE_KEY) === 'true';
}

/**
 * Verifica compliance con normative italiane per gaming
 */
export function validateGameComplianceConsent(consent: ConsentSettings): {
  valid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  
  // Per piattaforme gaming italiane, analytics sono raccomandati per RG (Responsible Gaming)
  if (!consent.analytics) {
    warnings.push('Analytics disabilitati: limitata capacità di monitoraggio per gioco responsabile');
  }
  
  // Marketing deve essere opt-in esplicito
  if (consent.marketing) {
    warnings.push('Assicurarsi che il consenso marketing sia stato dato esplicitamente');
  }
  
  return {
    valid: warnings.length === 0,
    warnings
  };
}

/**
 * Export per dichiarazioni TypeScript globali
 */
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
    fbq: (...args: any[]) => void;
  }
}

/**
 * Utility per debugging (solo development)
 */
export const debugConsent = {
  getCurrentRecord: () => {
    if (process.env.NODE_ENV !== 'development') return null;
    return loadConsentRecord();
  },
  
  forceReset: () => {
    if (process.env.NODE_ENV !== 'development') return;
    resetAllConsent();
    window.location.reload();
  },
  
  testGDPRCompliance: () => {
    if (process.env.NODE_ENV !== 'development') return null;
    const consent = getCurrentConsent();
    return validateGameComplianceConsent(consent);
  }
};