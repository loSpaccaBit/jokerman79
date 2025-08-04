"use client"

import { useEffect, useRef, useCallback } from 'react';

interface FocusManagerProps {
    children: React.ReactNode;
    autoFocus?: boolean;
    restoreFocus?: boolean;
    trapFocus?: boolean;
    className?: string;
}

export function FocusManager({
    children,
    autoFocus = false,
    restoreFocus = false,
    trapFocus = false,
    className,
}: FocusManagerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const previouslyFocusedElement = useRef<HTMLElement | null>(null);

    // Store the previously focused element
    useEffect(() => {
        if (restoreFocus) {
            previouslyFocusedElement.current = document.activeElement as HTMLElement;
        }
    }, [restoreFocus]);

    // Auto focus first focusable element
    useEffect(() => {
        if (autoFocus && containerRef.current) {
            const firstFocusable = containerRef.current.querySelector(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            ) as HTMLElement;

            if (firstFocusable) {
                setTimeout(() => firstFocusable.focus(), 0);
            }
        }
    }, [autoFocus]);

    // Focus trap
    const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
        if (!trapFocus || event.key !== 'Tab') return;

        const container = containerRef.current;
        if (!container) return;

        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (event.shiftKey) {
            if (document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        }
    }, [trapFocus]);

    // Restore focus on unmount
    useEffect(() => {
        return () => {
            if (restoreFocus && previouslyFocusedElement.current) {
                previouslyFocusedElement.current.focus();
            }
        };
    }, [restoreFocus]);

    return (
        <div
            ref={containerRef}
            className={className}
            onKeyDown={handleKeyDown}
        >
            {children}
        </div>
    );
}

// Hook per gestire il focus programmaticamente
export function useFocusManagement() {
    const focusElement = useCallback((selector: string) => {
        const element = document.querySelector(selector) as HTMLElement;
        if (element) {
            element.focus();
        }
    }, []);

    const focusById = useCallback((id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.focus();
        }
    }, []);

    const announceFocus = useCallback((message: string) => {
        // Create temporary announcement element
        const announcer = document.createElement('div');
        announcer.setAttribute('aria-live', 'assertive');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.className = 'sr-only';
        announcer.textContent = message;

        document.body.appendChild(announcer);

        setTimeout(() => {
            document.body.removeChild(announcer);
        }, 1000);
    }, []);

    return {
        focusElement,
        focusById,
        announceFocus,
    };
}
