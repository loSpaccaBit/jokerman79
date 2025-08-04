import { NextResponse } from 'next/server';

// Importa i dati delle slot e blog posts
// In un'app reale, questi dati verrebbero da un database o CMS
const BASE_URL = 'https://jokerman79.it';

// Simuliamo alcuni dati per l'esempio
const staticPages = [
    { url: '', changeFreq: 'weekly', priority: 1.0 },
    { url: '/slots', changeFreq: 'daily', priority: 0.9 },
    { url: '/providers', changeFreq: 'weekly', priority: 0.8 },
    { url: '/blog', changeFreq: 'daily', priority: 0.8 },
    { url: '/stats', changeFreq: 'weekly', priority: 0.7 },
];

// In un'app reale, questi dati verrebbero da un database
const slotPages = [
    { slug: 'starburst', lastModified: '2024-01-15' },
    { slug: 'book-of-dead', lastModified: '2024-01-14' },
    { slug: 'gonzo-quest', lastModified: '2024-01-13' },
    // ... altre slot
];

const blogPosts = [
    { slug: 'migliori-slot-2024', lastModified: '2024-01-15' },
    { slug: 'rtp-slot-guide', lastModified: '2024-01-14' },
    { slug: 'gioco-responsabile', lastModified: '2024-01-13' },
    // ... altri post
];

const providers = [
    { slug: 'netent', lastModified: '2024-01-10' },
    { slug: 'pragmatic-play', lastModified: '2024-01-10' },
    { slug: 'microgaming', lastModified: '2024-01-10' },
    // ... altri provider
];

function generateSitemapXML() {
    const currentDate = new Date().toISOString().split('T')[0];

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
`;

    // Pagine statiche
    staticPages.forEach(page => {
        sitemap += `
  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changeFreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    });

    // Pagine slot
    slotPages.forEach(slot => {
        sitemap += `
  <url>
    <loc>${BASE_URL}/slots/${slot.slug}</loc>
    <lastmod>${slot.lastModified}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
    <image:image>
      <image:loc>${BASE_URL}/assets/slot/${slot.slug}.webp</image:loc>
      <image:title>${slot.slug.replace(/-/g, ' ')}</image:title>
    </image:image>
  </url>`;
    });

    // Pagine blog
    blogPosts.forEach(post => {
        sitemap += `
  <url>
    <loc>${BASE_URL}/blog/${post.slug}</loc>
    <lastmod>${post.lastModified}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    // Pagine provider
    providers.forEach(provider => {
        sitemap += `
  <url>
    <loc>${BASE_URL}/providers/${provider.slug}</loc>
    <lastmod>${provider.lastModified}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`;
    });

    sitemap += `
</urlset>`;

    return sitemap;
}

export async function GET() {
    try {
        const sitemap = generateSitemapXML();

        return new NextResponse(sitemap, {
            status: 200,
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache per 1 ora
            },
        });
    } catch (error) {
        console.error('Error generating sitemap:', error);
        return new NextResponse('Error generating sitemap', { status: 500 });
    }
}
