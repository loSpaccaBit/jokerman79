"use client"

import { useEffect } from 'react';
import { onCLS, onINP, onLCP, onFCP, onTTFB, type Metric as WebVitalsMetric } from 'web-vitals';
import { useCookieConsent } from '@/contexts/CookieConsentContext';

interface WebVitalsConfig {
    reportWebVitals?: boolean;
    debug?: boolean;
}

function sendToAnalytics(metric: WebVitalsMetric, config: WebVitalsConfig, hasAnalyticsConsent: boolean) {
    if (config.debug) {
        console.log('Web Vitals:', metric);
    }

    // Solo invia a Google Analytics se consenso è dato
    if (hasAnalyticsConsent && typeof window !== 'undefined' && 'gtag' in window) {
        const gtag = (window as {
            gtag: (
                command: string,
                action: string,
                parameters: Record<string, unknown>
            ) => void
        }).gtag;

        gtag('event', metric.name, {
            value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
            event_category: 'Web Vitals',
            event_label: metric.id,
            non_interaction: true,
        });
    }

    // Send to custom analytics endpoint solo se consenso analytics
    if (hasAnalyticsConsent && process.env.NODE_ENV === 'production') {
        fetch('/api/analytics/web-vitals', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: metric.name,
                value: metric.value,
                id: metric.id,
                delta: metric.delta,
                rating: metric.rating,
                consent_timestamp: new Date().toISOString()
            }),
        }).catch(console.error);
    } else if (config.debug) {
        console.log('Web Vitals tracking skipped - no analytics consent', metric);
    }
}

export function WebVitals({ reportWebVitals = true, debug = false }: WebVitalsConfig = {}) {
    const { canUseAnalytics, consentGiven } = useCookieConsent();

    useEffect(() => {
        if (!reportWebVitals) return;

        const config = { reportWebVitals, debug };
        const hasAnalyticsConsent = canUseAnalytics();

        if (debug) {
            console.log('Web Vitals setup:', { 
                reportWebVitals, 
                hasAnalyticsConsent, 
                consentGiven 
            });
        }

        // Register all Web Vitals metrics con controllo consenso
        onCLS((metric) => sendToAnalytics(metric, config, hasAnalyticsConsent));
        onINP((metric) => sendToAnalytics(metric, config, hasAnalyticsConsent)); // INP ha sostituito FID
        onLCP((metric) => sendToAnalytics(metric, config, hasAnalyticsConsent));
        onFCP((metric) => sendToAnalytics(metric, config, hasAnalyticsConsent));
        onTTFB((metric) => sendToAnalytics(metric, config, hasAnalyticsConsent));
    }, [reportWebVitals, debug, canUseAnalytics, consentGiven]);

    return null;
}

// Hook per monitorare performance personalizzate con controllo consenso
export function usePerformanceMonitor() {
    const { canUseAnalytics } = useCookieConsent();

    const measurePerformance = (name: string, fn: () => void | Promise<void>) => {
        const start = performance.now();
        const hasAnalyticsConsent = canUseAnalytics();

        const measure = () => {
            const end = performance.now();
            const duration = end - start;

            if (process.env.NODE_ENV === 'development') {
                console.log(`Performance: ${name} took ${duration.toFixed(2)}ms`);
            }

            // Invia ai tuoi analytics solo se consenso è dato
            if (hasAnalyticsConsent && typeof window !== 'undefined' && 'gtag' in window) {
                const gtag = (window as {
                    gtag: (
                        command: string,
                        action: string,
                        parameters: Record<string, unknown>
                    ) => void
                }).gtag;

                gtag('event', 'timing_complete', {
                    name: name,
                    value: Math.round(duration),
                    event_category: 'Performance',
                    non_interaction: true,
                });
            } else if (process.env.NODE_ENV === 'development') {
                console.log(`Performance tracking skipped - no analytics consent: ${name} took ${duration.toFixed(2)}ms`);
            }
        };

        if (fn instanceof Promise) {
            return fn.finally(measure);
        } else {
            fn();
            measure();
        }
    };

    return { measurePerformance };
}
