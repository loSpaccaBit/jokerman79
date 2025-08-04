import React from 'react';
import Link from 'next/link';
import { Home, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ClientStructuredData } from './ClientStructuredData';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface SEOBreadcrumbProps {
    items: BreadcrumbItem[];
    currentPage?: number;
    totalPages?: number;
    className?: string;
}

export function SEOBreadcrumb({
    items,
    currentPage,
    totalPages,
    className = ""
}: SEOBreadcrumbProps) {
    // Prepara tutti gli item del breadcrumb
    const allItems: BreadcrumbItem[] = [
        { label: "Home", href: "/" },
        ...items
    ];

    // Aggiungi informazione pagina se presente
    if (currentPage && currentPage > 1) {
        allItems.push({
            label: `Pagina ${currentPage}${totalPages ? ` di ${totalPages}` : ''}`
        });
    }

    return (
        <>
            {/* Structured Data - lato client per evitare hydration mismatch */}
            <ClientStructuredData items={allItems} />

            {/* Visual Breadcrumb - Nascosto agli utenti ma visibile ai crawler */}
            <nav aria-label="Breadcrumb" className={cn("hidden text-sm text-muted-foreground", className)}>
                <ol className="flex items-center space-x-2">
                    {allItems.map((item, index) => {
                        const isLast = index === allItems.length - 1;

                        return (
                            <li key={index} className="flex items-center space-x-2">
                                {item.href && !isLast ? (
                                    <Link
                                        href={item.href}
                                        className="hover:text-foreground transition-colors flex items-center gap-1"
                                    >
                                        {index === 0 && <Home className="h-3 w-3" />}
                                        <span>{item.label}</span>
                                    </Link>
                                ) : (
                                    <span className={cn(
                                        "flex items-center gap-1",
                                        isLast && "text-foreground font-medium"
                                    )}>
                                        {index === 0 && <Home className="h-3 w-3" />}
                                        <span>{item.label}</span>
                                    </span>
                                )}

                                {!isLast && (
                                    <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
                                )}
                            </li>
                        );
                    })}
                </ol>
            </nav>
        </>
    );
}
