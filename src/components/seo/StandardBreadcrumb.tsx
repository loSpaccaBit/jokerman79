import React from 'react';
import { SEOBreadcrumb } from '@/components/seo/SEOBreadcrumb';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface StandardBreadcrumbProps {
    items: BreadcrumbItem[];
    currentPage?: number;
    totalPages?: number;
}

/**
 * Componente breadcrumb standard nascosto agli utenti ma visibile ai crawler
 */
export function StandardBreadcrumb({ items, currentPage, totalPages }: StandardBreadcrumbProps) {
    return (
        <SEOBreadcrumb
            items={items}
            currentPage={currentPage}
            totalPages={totalPages}
        />
    );
}
