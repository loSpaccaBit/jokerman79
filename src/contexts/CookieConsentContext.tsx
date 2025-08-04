"use client"

/**
 * Cookie Consent Context - GDPR Compliant
 * Context React per gestione globale dei consensi cookie
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  ConsentSettings, 
  CookieConsentContextType,
  DEFAULT_CONSENT_SETTINGS,
  CONSENT_VERSION 
} from '@/types/cookie-consent';
import {
  saveConsentRecord,
  getCurrentConsent,
  hasConsentBeenGiven,
  hasConsentForCategory,
  resetAllConsent,
  updateGoogleAnalyticsConsent,
  loadConditionalScripts,
  dismissBanner,
  isBannerDismissed,
  validateGameComplianceConsent
} from '@/lib/cookie-consent';

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

interface CookieConsentProviderProps {
  children: React.ReactNode;
}

export function CookieConsentProvider({ children }: CookieConsentProviderProps) {
  // Stati per gestione consensi
  const [consent, setConsent] = useState<ConsentSettings>(DEFAULT_CONSENT_SETTINGS);
  const [consentGiven, setConsentGiven] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>();

  // Inizializzazione del context
  useEffect(() => {
    // Verifica se consenso è già stato dato
    const hasConsent = hasConsentBeenGiven();
    const currentConsent = getCurrentConsent();
    const bannerDismissed = isBannerDismissed();

    setConsent(currentConsent);
    setConsentGiven(hasConsent);
    
    // Mostra banner solo se:
    // 1. Non è stato dato consenso E
    // 2. Banner non è stato dismesso manualmente
    setShowBanner(!hasConsent && !bannerDismissed);
    
    if (hasConsent) {
      const record = getCurrentConsent();
      // Carica script esterni se consenso già dato
      loadConditionalScripts(record);
      updateGoogleAnalyticsConsent(record);
    }

    // Set default Google Analytics consent (denied)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'default', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        functionality_storage: 'denied',
        personalization_storage: 'denied',
        wait_for_update: 500
      });
    }
  }, []);

  // Aggiorna consenso
  const updateConsent = useCallback((newConsent: Partial<ConsentSettings>) => {
    const updatedConsent: ConsentSettings = {
      ...consent,
      ...newConsent,
      necessary: true // Sempre true per cookie necessari
    };

    // Valida compliance per gaming italiano
    const validation = validateGameComplianceConsent(updatedConsent);
    if (!validation.valid && process.env.NODE_ENV === 'development') {
      console.warn('GDPR Compliance warnings:', validation.warnings);
    }

    setConsent(updatedConsent);
    setConsentGiven(true);
    setLastUpdated(new Date().toISOString());
    
    // Salva consenso
    saveConsentRecord(updatedConsent, 'settings');
    
    // Aggiorna Google Analytics
    updateGoogleAnalyticsConsent(updatedConsent);
    
    // Carica script condizionalmente
    loadConditionalScripts(updatedConsent);
    
    // Nascondi banner se mostrato
    if (showBanner) {
      setShowBanner(false);
      dismissBanner();
    }

    // Chiudi preferenze se aperte
    setShowPreferences(false);

    // Analytics event per tracking consenso (se consentito)
    if (updatedConsent.analytics && typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'consent_granted', {
        event_category: 'GDPR',
        event_label: 'consent_update',
        custom_parameters: {
          analytics: updatedConsent.analytics,
          marketing: updatedConsent.marketing,
          functional: updatedConsent.functional
        }
      });
    }
  }, [consent, showBanner]);

  // Accetta tutti i cookie
  const acceptAll = useCallback(() => {
    const allConsent: ConsentSettings = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true
    };
    
    updateConsent(allConsent);
  }, [updateConsent]);

  // Rifiuta cookie non essenziali
  const rejectNonEssential = useCallback(() => {
    const essentialOnly: ConsentSettings = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false
    };
    
    updateConsent(essentialOnly);
  }, [updateConsent]);

  // Reset completo consensi (per withdrawal)
  const resetConsent = useCallback(() => {
    resetAllConsent();
    setConsent(DEFAULT_CONSENT_SETTINGS);
    setConsentGiven(false);
    setShowBanner(true);
    setShowPreferences(false);
    setLastUpdated(undefined);
    
    // Ricarica pagina per reset completo
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }, []);

  // Verifica consenso per categoria
  const hasConsent = useCallback((category: keyof ConsentSettings): boolean => {
    return hasConsentForCategory(category);
  }, []);

  // Utility specifiche
  const canUseAnalytics = useCallback((): boolean => {
    return consent.analytics;
  }, [consent.analytics]);

  const canUseMarketing = useCallback((): boolean => {
    return consent.marketing;
  }, [consent.marketing]);

  // Gestione banner
  const dismissBannerHandler = useCallback(() => {
    setShowBanner(false);
    dismissBanner();
  }, []);

  const togglePreferences = useCallback(() => {
    setShowPreferences(!showPreferences);
  }, [showPreferences]);

  const contextValue: CookieConsentContextType = {
    // Stato
    consent,
    consentGiven,
    
    // Metodi principali
    updateConsent,
    acceptAll,
    rejectNonEssential,
    resetConsent,
    
    // Utility
    hasConsent,
    canUseAnalytics,
    canUseMarketing,
    
    // Banner management
    showBanner,
    dismissBanner: dismissBannerHandler,
    showPreferences,
    togglePreferences,
    
    // Metadati
    consentVersion: CONSENT_VERSION,
    lastUpdated
  };

  return (
    <CookieConsentContext.Provider value={contextValue}>
      {children}
    </CookieConsentContext.Provider>
  );
}

/**
 * Hook per utilizzare il Cookie Consent Context
 */
export function useCookieConsent(): CookieConsentContextType {
  const context = useContext(CookieConsentContext);
  
  if (context === undefined) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider');
  }
  
  return context;
}

/**
 * HOC per componenti che necessitano consenso
 */
export function withCookieConsent<P extends object>(
  Component: React.ComponentType<P>,
  requiredConsent: keyof ConsentSettings
) {
  return function WithCookieConsentComponent(props: P) {
    const { hasConsent } = useCookieConsent();
    
    if (!hasConsent(requiredConsent)) {
      return null; // O un componente placeholder
    }
    
    return <Component {...props} />;
  };
}

/**
 * Hook per componenti condizionali basati su consenso
 */
export function useConditionalRender(requiredConsent: keyof ConsentSettings): boolean {
  const { hasConsent } = useCookieConsent();
  return hasConsent(requiredConsent);
}