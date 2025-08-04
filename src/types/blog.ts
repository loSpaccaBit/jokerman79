// Types per il sistema blog
export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    image: string;
    excerpt: string;
    content?: string;
    author: string;
    publishedAt: string;
    readTime: string;
    category: string;
    isFeatured: boolean;
    views?: number;
    tags?: Array<{
        name: string;
        slug: string;
    }>;
}

export type ContentType = 'post' | 'ads' | 'bonus';

export interface ContentItem {
    type: ContentType;
    data?: BlogPost;
    key: string;
}

export interface ContentMixerConfig {
    adsAfterPosts: number;
    bonusAfterPosts: number;
    minPostsForAds: number;
    maxAdsCount: number;
    maxBonusCount: number;
}
