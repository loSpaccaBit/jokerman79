"use client"

import { createContext, useContext, useEffect, useState } from 'react';

interface AccessibilityPreferences {
    highContrast: boolean;
    reducedMotion: boolean;
    fontSize: 'small' | 'medium' | 'large' | 'x-large';
    focusIndicator: 'subtle' | 'prominent';
    screenReader: boolean;
}

interface AccessibilityContextType {
    preferences: AccessibilityPreferences;
    updatePreference: <K extends keyof AccessibilityPreferences>(
        key: K,
        value: AccessibilityPreferences[K]
    ) => void;
    resetPreferences: () => void;
}

const defaultPreferences: AccessibilityPreferences = {
    highContrast: false,
    reducedMotion: false,
    fontSize: 'medium',
    focusIndicator: 'subtle',
    screenReader: false,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
    const [preferences, setPreferences] = useState<AccessibilityPreferences>(defaultPreferences);

    // Load preferences from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('accessibility-preferences');
        if (saved) {
            try {
                setPreferences(JSON.parse(saved));
            } catch (error) {
                console.error('Error loading accessibility preferences:', error);
            }
        }
    }, []);

    // Detect system preferences
    useEffect(() => {
        const detectSystemPreferences = () => {
            const highContrastMedia = window.matchMedia('(prefers-contrast: high)');
            const reducedMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');

            setPreferences(prev => ({
                ...prev,
                highContrast: highContrastMedia.matches || prev.highContrast,
                reducedMotion: reducedMotionMedia.matches || prev.reducedMotion,
            }));

            // Listen for changes
            const handleHighContrastChange = (e: MediaQueryListEvent) => {
                setPreferences(prev => ({ ...prev, highContrast: e.matches }));
            };

            const handleReducedMotionChange = (e: MediaQueryListEvent) => {
                setPreferences(prev => ({ ...prev, reducedMotion: e.matches }));
            };

            highContrastMedia.addEventListener('change', handleHighContrastChange);
            reducedMotionMedia.addEventListener('change', handleReducedMotionChange);

            return () => {
                highContrastMedia.removeEventListener('change', handleHighContrastChange);
                reducedMotionMedia.removeEventListener('change', handleReducedMotionChange);
            };
        };

        return detectSystemPreferences();
    }, []);

    // Apply preferences to document
    useEffect(() => {
        const root = document.documentElement;

        // High contrast
        root.classList.toggle('high-contrast', preferences.highContrast);

        // Reduced motion
        root.classList.toggle('reduce-motion', preferences.reducedMotion);

        // Font size
        root.setAttribute('data-font-size', preferences.fontSize);

        // Focus indicator
        root.setAttribute('data-focus-style', preferences.focusIndicator);

        // Screen reader
        root.classList.toggle('screen-reader-mode', preferences.screenReader);

        // Save to localStorage
        localStorage.setItem('accessibility-preferences', JSON.stringify(preferences));
    }, [preferences]);

    const updatePreference = <K extends keyof AccessibilityPreferences>(
        key: K,
        value: AccessibilityPreferences[K]
    ) => {
        setPreferences(prev => ({ ...prev, [key]: value }));
    };

    const resetPreferences = () => {
        setPreferences(defaultPreferences);
        localStorage.removeItem('accessibility-preferences');
    };

    return (
        <AccessibilityContext.Provider value={{
            preferences,
            updatePreference,
            resetPreferences,
        }}>
            {children}
        </AccessibilityContext.Provider>
    );
}

export function useAccessibility() {
    const context = useContext(AccessibilityContext);
    if (context === undefined) {
        throw new Error('useAccessibility must be used within an AccessibilityProvider');
    }
    return context;
}

// Hook per rilevare capacità di accessibilità
export function useAccessibilityFeatures() {
    const [features, setFeatures] = useState({
        screenReader: false,
        highContrast: false,
        reducedMotion: false,
        forcedColors: false,
    });

    useEffect(() => {
        // Detect screen reader
        const hasScreenReader = window.navigator.userAgent.includes('NVDA') ||
            window.navigator.userAgent.includes('JAWS') ||
            window.speechSynthesis !== undefined;

        // Detect other features
        const highContrast = window.matchMedia('(prefers-contrast: high)').matches;
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const forcedColors = window.matchMedia('(forced-colors: active)').matches;

        setFeatures({
            screenReader: hasScreenReader,
            highContrast,
            reducedMotion,
            forcedColors,
        });
    }, []);

    return features;
}
