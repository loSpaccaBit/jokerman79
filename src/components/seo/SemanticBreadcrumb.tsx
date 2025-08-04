"use client"

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getBreadcrumbSchema } from '@/lib/structured-data';
import { StructuredData } from './StructuredData';

export interface BreadcrumbItem {
    label: string;
    href: string;
    current?: boolean;
}

interface SemanticBreadcrumbProps {
    items: BreadcrumbItem[];
    className?: string;
    showHome?: boolean;
    homeLabel?: string;
    separator?: React.ReactNode;
    hideStructuredData?: boolean;
}

export function SemanticBreadcrumb({
    items,
    className,
    showHome = true,
    homeLabel = 'Home',
    separator,
    hideStructuredData = false
}: SemanticBreadcrumbProps) {
    // Prepara items per structured data
    const breadcrumbItems = showHome
        ? [{ label: homeLabel, href: '/' }, ...items]
        : items;

    const structuredDataItems = breadcrumbItems.map(item => ({
        name: item.label,
        url: `https://jokerman79.com${item.href}`
    }));

    const defaultSeparator = <ChevronRight className="h-4 w-4 text-muted-foreground" />;

    return (
        <>
            {/* Structured Data */}
            {!hideStructuredData && (
                <StructuredData data={getBreadcrumbSchema(structuredDataItems)} />
            )}

            {/* Visual Breadcrumb */}
            <nav
                aria-label="Breadcrumb"
                className={cn("flex items-center space-x-1 text-sm", className)}
                role="navigation"
            >
                <ol className="flex items-center space-x-1" itemScope itemType="https://schema.org/BreadcrumbList">
                    {showHome && (
                        <>
                            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                                <Link
                                    href="/"
                                    className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
                                    itemProp="item"
                                >
                                    <Home className="h-4 w-4" />
                                    <span className="sr-only" itemProp="name">{homeLabel}</span>
                                </Link>
                                <meta itemProp="position" content="1" />
                            </li>
                            {items.length > 0 && (
                                <li aria-hidden="true">
                                    {separator || defaultSeparator}
                                </li>
                            )}
                        </>
                    )}

                    {items.map((item, index) => {
                        const isLast = index === items.length - 1;
                        const position = showHome ? index + 2 : index + 1;

                        return (
                            <li key={item.href} itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                                {isLast || item.current ? (
                                    <span
                                        className="font-medium text-foreground"
                                        aria-current={isLast || item.current ? "page" : undefined}
                                        itemProp="name"
                                    >
                                        {item.label}
                                    </span>
                                ) : (
                                    <Link
                                        href={item.href}
                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                        itemProp="item"
                                    >
                                        <span itemProp="name">{item.label}</span>
                                    </Link>
                                )}
                                <meta itemProp="position" content={position.toString()} />

                                {!isLast && !item.current && (
                                    <>
                                        <span aria-hidden="true" className="ml-1">
                                            {separator || defaultSeparator}
                                        </span>
                                    </>
                                )}
                            </li>
                        );
                    })}
                </ol>
            </nav>
        </>
    );
}

// Hook per generare breadcrumb automaticamente dalla URL
export function useBreadcrumbFromPath(pathname: string, customLabels?: Record<string, string>) {
    const segments = pathname.split('/').filter(Boolean);

    const items: BreadcrumbItem[] = [];
    let currentPath = '';

    segments.forEach((segment, index) => {
        currentPath += `/${segment}`;
        const isLast = index === segments.length - 1;

        // Usa label personalizzato o fallback
        const label = customLabels?.[segment] ||
            segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');

        items.push({
            label,
            href: currentPath,
            current: isLast
        });
    });

    return items;
}

// Preset per pagine comuni
export const BREADCRUMB_PRESETS = {
    slots: (slotName?: string) => [
        { label: 'Slot Machine', href: '/slots' },
        ...(slotName ? [{ label: slotName, href: '', current: true }] : [])
    ],

    providers: (providerName?: string) => [
        { label: 'Provider', href: '/providers' },
        ...(providerName ? [{ label: providerName, href: '', current: true }] : [])
    ],

    blog: (postTitle?: string) => [
        { label: 'Blog', href: '/blog' },
        ...(postTitle ? [{ label: postTitle, href: '', current: true }] : [])
    ],

    stats: (statType?: string) => [
        { label: 'Statistiche', href: '/stats' },
        ...(statType ? [{ label: statType, href: '', current: true }] : [])
    ]
};
