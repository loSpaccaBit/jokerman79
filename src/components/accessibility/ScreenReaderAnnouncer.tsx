"use client"

import { useEffect, useRef } from 'react';
import { a11y } from '@/lib/accessibility';

interface ScreenReaderAnnouncerProps {
    message: string;
    priority?: 'polite' | 'assertive';
    clearOnUnmount?: boolean;
}

export function ScreenReaderAnnouncer({
    message,
    priority = 'polite',
    clearOnUnmount = true,
}: ScreenReaderAnnouncerProps) {
    const announcerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (announcerRef.current && message) {
            // Clear previous message
            announcerRef.current.textContent = '';

            // Small delay to ensure screen reader picks up the change
            setTimeout(() => {
                if (announcerRef.current) {
                    announcerRef.current.textContent = message;
                }
            }, 100);
        }
    }, [message]);

    useEffect(() => {
        const currentAnnouncer = announcerRef.current;
        return () => {
            if (clearOnUnmount && currentAnnouncer) {
                currentAnnouncer.textContent = '';
            }
        };
    }, [clearOnUnmount]);

    return (
        <div
            ref={announcerRef}
            aria-live={priority}
            aria-atomic="true"
            className={a11y.srOnly}
        />
    );
}

// Hook per gestire annunci dinamici
export function useScreenReaderAnnouncer() {
    const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
        // Create temporary announcer
        const announcer = document.createElement('div');
        announcer.setAttribute('aria-live', priority);
        announcer.setAttribute('aria-atomic', 'true');
        announcer.className = a11y.srOnly;

        document.body.appendChild(announcer);

        // Announce message after small delay
        setTimeout(() => {
            announcer.textContent = message;
        }, 100);

        // Clean up after announcement
        setTimeout(() => {
            if (document.body.contains(announcer)) {
                document.body.removeChild(announcer);
            }
        }, 1000);
    };

    const announceError = (message: string) => announce(message, 'assertive');
    const announceSuccess = (message: string) => announce(message, 'polite');
    const announceLoading = (message: string) => announce(message, 'polite');

    return {
        announce,
        announceError,
        announceSuccess,
        announceLoading,
    };
}
