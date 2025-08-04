"use client"

/**
 * Conditional Google Analytics
 * Carica Google Analytics solo se consenso analytics è dato
 */

import { useEffect } from 'react';
import Script from 'next/script';
import { useCookieConsent } from '@/contexts/CookieConsentContext';

interface ConditionalGoogleAnalyticsProps {
  trackingId?: string;
  debug?: boolean;
}

export function ConditionalGoogleAnalytics({ 
  trackingId = process.env.NEXT_PUBLIC_GA_ID,
  debug = false 
}: ConditionalGoogleAnalyticsProps) {
  const { canUseAnalytics, consentGiven } = useCookieConsent();

  useEffect(() => {
    // Inizializza Google Analytics consent mode in denied state
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || [];
      
      function gtag(...args: any[]) {
        window.dataLayer.push(args);
      }
      
      window.gtag = gtag;
      
      // Set default consent state (denied)
      gtag('consent', 'default', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        functionality_storage: 'denied',
        personalization_storage: 'denied',
        wait_for_update: 500
      });

      if (debug) {
        console.log('Google Analytics consent mode initialized (denied by default)');
      }
    }
  }, [debug]);

  useEffect(() => {
    if (consentGiven && canUseAnalytics() && typeof window !== 'undefined' && window.gtag) {
      // Update consent when analytics is allowed
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
        functionality_storage: 'granted'
      });

      if (debug) {
        console.log('Google Analytics consent updated to granted');
      }
    }
  }, [canUseAnalytics, consentGiven, debug]);

  // Non renderizzare script se consenso non dato
  if (!canUseAnalytics() || !trackingId) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${trackingId}`}
        strategy="afterInteractive"
        onLoad={() => {
          if (typeof window !== 'undefined') {
            window.gtag('js', new Date());
            window.gtag('config', trackingId, {
              page_title: document.title,
              page_location: window.location.href,
              cookie_flags: 'SameSite=None;Secure',
              // GDPR compliance settings
              anonymize_ip: true,
              allow_google_signals: false,
              allow_ad_personalization_signals: false
            });

            if (debug) {
              console.log('Google Analytics initialized with tracking ID:', trackingId);
            }
          }
        }}
      />
    </>
  );
}

/**
 * Hook per inviare eventi GA condizionalmente
 */
export function useGoogleAnalytics() {
  const { canUseAnalytics } = useCookieConsent();

  const trackEvent = (
    action: string,
    category: string,
    label?: string,
    value?: number,
    customParameters?: Record<string, any>
  ) => {
    if (!canUseAnalytics() || typeof window === 'undefined' || !window.gtag) {
      return;
    }

    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
      ...customParameters
    });
  };

  const trackPageView = (page_path: string, page_title?: string) => {
    if (!canUseAnalytics() || typeof window === 'undefined' || !window.gtag) {
      return;
    }

    window.gtag('config', process.env.NEXT_PUBLIC_GA_ID!, {
      page_path,
      page_title: page_title || document.title
    });
  };

  const trackConversion = (conversionId: string, value?: number, currency = 'EUR') => {
    if (!canUseAnalytics() || typeof window === 'undefined' || !window.gtag) {
      return;
    }

    window.gtag('event', 'conversion', {
      send_to: conversionId,
      value: value,
      currency: currency
    });
  };

  return {
    trackEvent,
    trackPageView,
    trackConversion,
    canTrack: canUseAnalytics()
  };
}

/**
 * Componente per debugging Analytics
 */
export function GoogleAnalyticsDebugger() {
  const { canUseAnalytics, consent } = useCookieConsent();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 bg-background border rounded-lg p-3 text-xs shadow-lg max-w-xs z-50">
      <div className="font-semibold mb-2">GA Debug</div>
      <div className="space-y-1">
        <div>GA Enabled: {canUseAnalytics() ? '✅' : '❌'}</div>
        <div>Analytics Consent: {consent.analytics ? '✅' : '❌'}</div>
        <div>gtag Available: {typeof window !== 'undefined' && window.gtag ? '✅' : '❌'}</div>
        <div>GA ID: {process.env.NEXT_PUBLIC_GA_ID || 'Not set'}</div>
      </div>
    </div>
  );
}