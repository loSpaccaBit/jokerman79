import { StrapiBlogPost } from '@/types/strapi';
import { BlogPost } from '@/types/blog';

export function strapiBlogPostToLocal(strapiPost: StrapiBlogPost): BlogPost {
    const baseImageUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
    const logoFallback = '/assets/logo.svg';

    // Gestione immagine principale
    let imageUrl = logoFallback;
    if (strapiPost.attributes.image?.data?.attributes?.url) {
        const url = strapiPost.attributes.image.data.attributes.url;
        imageUrl = url.startsWith('http') ? url : `${baseImageUrl}${url}`;
    }

    return {
        id: strapiPost.id,
        title: strapiPost.attributes.title,
        slug: strapiPost.attributes.slug,
        content: strapiPost.attributes.content || '',
        excerpt: strapiPost.attributes.excerpt || '',
        image: imageUrl,
        author: strapiPost.attributes.author || 'Staff',
        publishedAt: strapiPost.attributes.publishedAt,
        readTime: strapiPost.attributes.readTime || '5 min',
        category: strapiPost.attributes.category?.data?.attributes?.name || 'Generale',
        isFeatured: strapiPost.attributes.isFeatured || false,
        tags: strapiPost.attributes.tags?.data?.map(tag => tag.attributes.name) || [],
        seo: strapiPost.attributes.seo ? {
            metaTitle: strapiPost.attributes.seo.metaTitle || strapiPost.attributes.title,
            metaDescription: strapiPost.attributes.seo.metaDescription || strapiPost.attributes.excerpt || '',
            keywords: strapiPost.attributes.seo.keywords || [],
            canonicalURL: strapiPost.attributes.seo.canonicalURL || undefined,
            metaImage: strapiPost.attributes.seo.metaImage?.data?.attributes?.url ?
                (strapiPost.attributes.seo.metaImage.data.attributes.url.startsWith('http') ?
                    strapiPost.attributes.seo.metaImage.data.attributes.url :
                    `${baseImageUrl}${strapiPost.attributes.seo.metaImage.data.attributes.url}`) :
                imageUrl,
            structuredData: strapiPost.attributes.seo.structuredData || undefined,
        } : undefined,
    };
}
