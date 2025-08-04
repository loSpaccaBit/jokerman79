import React from 'react';
import BlogPostCard from '@/components/_home/BlogPostCard';
import { AnimatedSection } from '@/components/animations/AnimatedSection';
import { BlogPost } from '@/types/blog';

interface FeaturedPostsProps {
    posts: BlogPost[];
}

/**
 * Componente per la sezione dei post in evidenza
 */
export function FeaturedPosts({ posts }: FeaturedPostsProps) {
    const featuredPosts = posts.filter(post => post.isFeatured);

    if (featuredPosts.length === 0) {
        return null;
    }

    return (
        <AnimatedSection delay={0.2}>
            <section>
                <h2 className="text-2xl font-bold mb-6">Post in Evidenza</h2>
                <div className="grid gap-6">
                    {featuredPosts.map((post) => (
                        <BlogPostCard
                            key={post.slug}
                            variant="full"
                            post={post}
                        />
                    ))}
                </div>
            </section>
        </AnimatedSection>
    );
}
