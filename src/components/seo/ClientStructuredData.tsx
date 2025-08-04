"use client"
import { useEffect } from 'react';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface ClientStructuredDataProps {
    items: BreadcrumbItem[];
}

export function ClientStructuredData({ items }: ClientStructuredDataProps) {
    useEffect(() => {
        // Rimuovi eventuali structured data precedenti
        const existingScript = document.querySelector('script[data-breadcrumb-structured-data]');
        if (existingScript) {
            existingScript.remove();
        }

        // Crea nuovo structured data con URL completi
        const structuredData = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": items.map((item, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "name": item.label,
                ...(item.href && { "item": `${window.location.origin}${item.href}` })
            }))
        };

        // Aggiungi il nuovo script
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-breadcrumb-structured-data', 'true');
        script.textContent = JSON.stringify(structuredData);
        document.head.appendChild(script);

        // Cleanup quando il componente viene dismontato
        return () => {
            const scriptToRemove = document.querySelector('script[data-breadcrumb-structured-data]');
            if (scriptToRemove) {
                scriptToRemove.remove();
            }
        };
    }, [items]);

    return null; // Questo componente non rende nulla visivamente
}
