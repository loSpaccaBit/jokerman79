"use client"

import { useEffect } from 'react';

interface ResourcePreloaderProps {
    images?: string[];
    fonts?: string[];
    scripts?: string[];
}

export function ResourcePreloader({ images = [], fonts = [], scripts = [] }: ResourcePreloaderProps) {
    useEffect(() => {
        // Preload critical images
        images.forEach((src) => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        });

        // Preload fonts
        fonts.forEach((href) => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'font';
            link.type = 'font/woff2';
            link.crossOrigin = 'anonymous';
            link.href = href;
            document.head.appendChild(link);
        });

        // Preload scripts
        scripts.forEach((src) => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'script';
            link.href = src;
            document.head.appendChild(link);
        });
    }, [images, fonts, scripts]);

    return null;
}

// Hook per preload condizionale
export function usePreloadOnHover(href: string) {
    const preload = () => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = href;
        document.head.appendChild(link);
    };

    return { preload };
}
