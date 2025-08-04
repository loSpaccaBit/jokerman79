import { useMemo } from 'react';
import { BlogPost } from '@/types/blog';
import { createMixedContent } from '@/utils/contentMixer';

/**
 * Hook personalizzato per gestire il contenuto del blog
 * con ottimizzazioni per performance e memoization
 */
export function useBlogContent(posts: BlogPost[]) {
    // Memoizza il contenuto misto per evitare ricalcoli inutili
    const mixedContent = useMemo(() => createMixedContent(posts), [posts]);

    // Memoizza i post in evidenza
    const featuredPosts = useMemo(() =>
        posts.filter(post => post.isFeatured),
        [posts]
    );

    // Statistiche del contenuto
    const stats = useMemo(() => ({
        totalPosts: posts.length,
        featuredCount: featuredPosts.length,
        totalItems: mixedContent.length,
        adsCount: mixedContent.filter(item => item.type === 'ads').length,
        bonusCount: mixedContent.filter(item => item.type === 'bonus').length
    }), [posts, featuredPosts, mixedContent]);

    return {
        mixedContent,
        featuredPosts,
        stats
    };
}
