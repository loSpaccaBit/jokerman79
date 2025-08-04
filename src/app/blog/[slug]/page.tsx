"use client";

import Link from "next/link";
import Image from "next/image";
import Head from 'next/head';
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { use, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/animations/AnimatedSection";
import { SEOBreadcrumb } from "@/components/seo/SEOBreadcrumb";
import { useBlogPost } from "@/hooks/useBlogPosts";
import { Skeleton } from "@/components/ui/skeleton";
import { MarkdownRenderer } from "@/components/blog/MarkdownRenderer";

interface BlogPostPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
    const [mounted, setMounted] = useState(false);
    const { slug } = use(params);

    // Usa i dati reali da GraphQL
    const { blogPost, loading, error } = useBlogPost(slug);
    const post = blogPost;

    useEffect(() => {
        setMounted(true);
    }, []);

    // Loading state
    if (!mounted || loading) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-6 max-w-4xl">
                    <div className="space-y-8">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="aspect-video w-full" />
                        <div className="space-y-4">
                            <Skeleton className="h-8 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="max-w-md mx-auto mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <p className="text-destructive">
                            Errore nel caricamento del post: {error.message}
                        </p>
                    </div>
                    <Link href="/blog">
                        <Button>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Torna al Blog
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    // Post not found
    if (!post) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">Post non trovato</h1>
                    <p className="text-muted-foreground mb-6">Il post che stai cercando non esiste.</p>
                    <Link href="/blog">
                        <Button>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Torna al Blog
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    const breadcrumbItems = [
        { label: "Blog", href: "/blog" },
        { label: post.title, href: `/blog/${post.slug}` }
    ];

    return (
        <>
            <Head>
                <title>{post?.title || 'Post'} | Jokerman79 Blog</title>
                <meta name="description" content={post?.excerpt || ''} />
                <meta name="keywords" content={post?.tags?.map(tag => tag.name).join(', ') || ''} />
                <meta name="author" content={post?.author || ''} />
                <meta property="og:title" content={post?.title || ''} />
                <meta property="og:description" content={post?.excerpt || ''} />
                <meta property="og:image" content={post?.image || ''} />
                <meta property="og:type" content="article" />
                <meta property="article:author" content={post?.author || ''} />
                <meta property="article:published_time" content={post?.publishedAt || ''} />
                <meta property="article:tag" content={post?.tags?.map(tag => tag.name).join(', ') || ''} />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={post?.title || ''} />
                <meta name="twitter:description" content={post?.excerpt || ''} />
                <meta name="twitter:image" content={post?.image || ''} />
                <link rel="canonical" href={`https://jokerman79.com/blog/${post?.slug}`} />
            </Head>

            <div className="min-h-screen bg-background">
                {/* Breadcrumb */}
                <div className="bg-background/80 backdrop-blur-sm border-b border-border/50">
                    <div className="max-w-7xl mx-auto px-6 py-3">
                        <SEOBreadcrumb items={breadcrumbItems} />
                    </div>
                </div>

                <article className="container mx-auto px-4 py-8 max-w-4xl">
                    {/* Back Button */}
                    <div className="mb-6">
                        <Link
                            href="/blog"
                            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Torna al Blog
                        </Link>
                    </div>

                    <AnimatedSection>
                        {/* Header */}
                        <header className="mb-8">
                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                <Badge variant="secondary">{post.category}</Badge>
                                {post.tags?.map((tag) => (
                                    <Badge key={tag.name} variant="outline" className="text-xs">
                                        {tag.name}
                                    </Badge>
                                ))}
                            </div>

                            <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                                {post.title}
                            </h1>

                            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                                {post.excerpt}
                            </p>

                            {/* Meta Info */}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    <span>{post.author}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>{new Date(post.publishedAt).toLocaleDateString('it-IT')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>{post.readTime}</span>
                                </div>
                            </div>
                        </header>

                        {/* Featured Image */}
                        <div className="mb-8">
                            <div className="relative aspect-video rounded-lg overflow-hidden">
                                <Image
                                    src={post.image}
                                    alt={post.title}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="mb-12">
                            <MarkdownRenderer content={post.content || ''} />
                        </div>

                        {/* Author Info */}
                        <Card className="mb-12">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                                        <User className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{post.author}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Esperto del settore gaming con anni di esperienza nell&apos;analisi
                                            e recensione di casinò online e slot machine.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </AnimatedSection>
                </article>
            </div>
        </>
    );
}
