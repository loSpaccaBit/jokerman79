import React from 'react';
import { ContentItem } from '@/types/blog';
import BlogPostCard from '@/components/_home/BlogPostCard';
import { AdsCard } from '@/components/layout/AdsCard';
import { BonusCard } from '@/components/_home/BonusCard';
import { AnimatedGrid } from '@/components/animations/AnimatedGrid';

interface ContentRendererProps {
    mixedContent: ContentItem[];
}

/**
 * Hook per raggruppare il contenuto misto in griglie e elementi full-width
 */
function useContentGroups(mixedContent: ContentItem[]) {
    return React.useMemo(() => {
        const groups: React.ReactElement[] = [];
        let currentGridItems: React.ReactElement[] = [];

        const addCurrentGridToGroups = () => {
            if (currentGridItems.length > 0) {
                groups.push(
                    <AnimatedGrid
                        key={`grid-${groups.length}`}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        staggerDelay={0.1}
                    >
                        {currentGridItems}
                    </AnimatedGrid>
                );
                currentGridItems = [];
            }
        };

        mixedContent.forEach((item) => {
            if (item.type === 'bonus') {
                // Aggiungi griglia corrente prima della BonusCard
                addCurrentGridToGroups();

                // Aggiungi BonusCard come elemento full-width
                groups.push(
                    <div key={item.key} className="w-full">
                        <BonusCard variant="full" />
                    </div>
                );
            } else {
                // Aggiungi elemento alla griglia corrente
                const gridItem = renderGridItem(item);
                if (gridItem) {
                    currentGridItems.push(gridItem);
                }
            }
        });

        // Aggiungi griglia finale se non vuota
        addCurrentGridToGroups();

        return groups;
    }, [mixedContent]);
}

/**
 * Renderizza un singolo elemento della griglia
 */
function renderGridItem(item: ContentItem): React.ReactElement | null {
    switch (item.type) {
        case 'post':
            return (
                <BlogPostCard
                    key={item.key}
                    variant="grid"
                    post={item.data!}
                />
            );

        case 'ads':
            return (
                <div key={item.key} className="md:col-span-2 lg:col-span-1">
                    <AdsCard />
                </div>
            );

        default:
            return null;
    }
}

/**
 * Componente per renderizzare il contenuto misto ottimizzato
 */
export function ContentRenderer({ mixedContent }: ContentRendererProps) {
    const contentGroups = useContentGroups(mixedContent);

    return (
        <div className="space-y-6">
            {contentGroups}
        </div>
    );
}
