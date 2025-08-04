import React from 'react';
import { AnimatedSection } from '@/components/animations/AnimatedSection';

interface BlogHeaderProps {
    title?: string;
    description?: string;
}

/**
 * Componente per l'header del blog
 */
export function BlogHeader({
    title = "Blog Jokerman79",
    description = "Guide, strategie e consigli per il mondo dei casinò online. Rimani aggiornato con le ultime novità del settore."
}: BlogHeaderProps) {
    return (
        <AnimatedSection>
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    {title}
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    {description}
                </p>
            </div>
        </AnimatedSection>
    );
}
