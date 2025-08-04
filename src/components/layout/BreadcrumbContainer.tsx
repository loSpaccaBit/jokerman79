import React from 'react';
import { cn } from '@/lib/utils';

interface BreadcrumbContainerProps {
    children: React.ReactNode;
    position?: 'above-hero' | 'below-hero' | 'inside-hero' | 'sticky';
    className?: string;
}

export function BreadcrumbContainer({
    children,
    position = 'above-hero',
    className = ""
}: BreadcrumbContainerProps) {
    const positionStyles = {
        'above-hero': "bg-background/80 backdrop-blur-sm border-b border-border/50",
        'below-hero': "",
        'inside-hero': "absolute top-4 left-0 right-0 z-10",
        'sticky': "sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50"
    };

    const containerStyles = {
        'above-hero': "py-3",
        'below-hero': "py-4",
        'inside-hero': "py-2",
        'sticky': "py-2"
    };

    return (
        <div className={cn(positionStyles[position], className)}>
            <div className={cn(
                "max-w-7xl mx-auto px-6",
                containerStyles[position]
            )}>
                {children}
            </div>
        </div>
    );
}
