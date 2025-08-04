import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import {
    GET_BLOG_POSTS,
    GET_BLOG_POST_BY_SLUG,
    GET_FEATURED_BLOG_POSTS
} from '@/lib/graphql/queries';
import {
    BlogPostsQueryResponse,
    BlogPostsQueryVariables,
    strapiBlogPostToLocal
} from '@/types/strapi';
import { BlogPost } from '@/types/blog';

/**
 * Hook per ottenere tutti i blog post con paginazione e filtri
 */
export function useBlogPosts(variables?: BlogPostsQueryVariables) {
    const { data, loading, error, refetch } = useQuery<BlogPostsQueryResponse>(GET_BLOG_POSTS, {
        variables,
    });

    const blogPosts: BlogPost[] = useMemo(() => {
        return data?.blogPosts?.map(strapiBlogPostToLocal) || [];
    }, [data]);

    return {
        blogPosts,
        loading,
        error,
        refetch,
    };
}

/**
 * Hook per ottenere un singolo blog post per slug
 */
export function useBlogPost(slug: string) {
    const { data, loading, error } = useQuery<BlogPostsQueryResponse>(GET_BLOG_POST_BY_SLUG, {
        variables: { slug },
        skip: !slug,
    });

    const blogPost = useMemo(() => {
        return data?.blogPosts?.[0] ? strapiBlogPostToLocal(data.blogPosts[0]) : null;
    }, [data]);

    return {
        blogPost,
        loading,
        error,
    };
}

/**
 * Hook per ottenere i blog post in evidenza
 */
export function useFeaturedBlogPosts(limit = 3) {
    const { data, loading, error } = useQuery<BlogPostsQueryResponse>(GET_FEATURED_BLOG_POSTS, {
        variables: { limit },
    });

    const featuredPosts: BlogPost[] = useMemo(() => {
        return data?.blogPosts?.map(strapiBlogPostToLocal) || [];
    }, [data]);

    return {
        featuredPosts,
        loading,
        error,
    };
}

/**
 * Hook per ottenere blog post per categoria
 */
export function useBlogPostsByCategory(category: string, limit = 10) {
    const { data, loading, error } = useQuery<BlogPostsQueryResponse>(GET_BLOG_POSTS, {
        variables: {
            filters: {
                category: { eq: category }
            },
            pagination: { pageSize: limit },
            sort: ['publishedAt:desc']
        },
    });

    const blogPosts: BlogPost[] = useMemo(() => {
        return data?.blogPosts?.map(strapiBlogPostToLocal) || [];
    }, [data]);

    return {
        blogPosts,
        loading,
        error,
    };
}
