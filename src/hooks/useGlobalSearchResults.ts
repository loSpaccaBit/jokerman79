import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_PROVIDERS, GET_BLOG_POSTS } from '@/lib/graphql/queries';
import { SearchResult } from '@/contexts/GlobalSearchContext';
import { strapiBlogPostToLocal, strapiProviderToLocal } from '@/types/strapi';

export function useGlobalSearchResults(query: string) {
    const [isSearching, setIsSearching] = useState(false);

    // Query per providers
    const { data: providersData, loading: providersLoading } = useQuery(GET_PROVIDERS, {
        variables: {
            pagination: { limit: 100 },
            filters: query ? {
                and: [
                    { isVisible: { eq: true } },
                    { name: { containsi: query } }
                ]
            } : {
                isVisible: { eq: true }
            }
        },
        skip: !query || query.length < 2,
    });

    // Query per blog posts
    const { data: blogData, loading: blogLoading } = useQuery(GET_BLOG_POSTS, {
        variables: {
            pagination: { pageSize: 50 },
            filters: query ? {
                or: [
                    { title: { containsi: query } },
                    { excerpt: { containsi: query } },
                    { category: { containsi: query } }
                ]
            } : undefined
        },
        skip: !query || query.length < 2,
    });

    // Combina i risultati
    const searchResults = useMemo(() => {
        if (!query || query.length < 2) return [];

        const results: SearchResult[] = [];

        // Aggiungi providers
        if (providersData?.providers) {
            providersData.providers.forEach((provider: any) => {
                const localProvider = strapiProviderToLocal(provider);
                results.push({
                    id: `provider-${localProvider.id}`,
                    title: localProvider.name,
                    type: 'provider',
                    slug: localProvider.slug,
                    excerpt: localProvider.description || '',
                    image: localProvider.logo,
                    url: `/providers/${localProvider.slug}`,
                });
            });
        }

        // Aggiungi blog posts
        if (blogData?.blogPosts) {
            blogData.blogPosts.forEach((post: any) => {
                const localPost = strapiBlogPostToLocal(post);
                results.push({
                    id: `blog-${localPost.id}`,
                    title: localPost.title,
                    type: 'blog',
                    slug: localPost.slug,
                    excerpt: localPost.excerpt,
                    image: localPost.image,
                    url: `/blog/${localPost.slug}`,
                });
            });
        }

        return results;
    }, [providersData, blogData, query]);

    // Gestisci lo stato di caricamento
    useEffect(() => {
        if (query && query.length >= 2) {
            setIsSearching(providersLoading || blogLoading);
        } else {
            setIsSearching(false);
        }
    }, [query, providersLoading, blogLoading]);

    return {
        searchResults,
        isSearching,
    };
}
