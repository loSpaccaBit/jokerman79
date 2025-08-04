import { NextResponse } from 'next/server';

const robots = `User-agent: *
Allow: /

# Pagine importanti per i bot
Allow: /slots
Allow: /providers
Allow: /blog
Allow: /stats

# Blocca pagine private o non indicizzabili
Disallow: /api/
Disallow: /admin/
Disallow: /_next/
Disallow: /404
Disallow: /500

# Sitemap
Sitemap: https://jokerman79.com/sitemap.xml

# Crawl-delay per essere gentili con i server
Crawl-delay: 1

# Specifiche per bot specifici
User-agent: Googlebot
Allow: /
Crawl-delay: 0

User-agent: Bingbot
Allow: /
Crawl-delay: 1

User-agent: facebookexternalhit
Allow: /

User-agent: Twitterbot
Allow: /

# Blocca bot malevoli
User-agent: SemrushBot
Disallow: /

User-agent: AhrefsBot
Disallow: /

User-agent: DotBot
Disallow: /
`;

export async function GET() {
    return new NextResponse(robots, {
        status: 200,
        headers: {
            'Content-Type': 'text/plain',
            'Cache-Control': 'public, max-age=86400', // Cache per 24 ore
        },
    });
}
