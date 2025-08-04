import Head from 'next/head';

interface PaginationSEOProps {
    currentPage: number;
    totalPages: number;
    baseUrl: string;
    title: string;
    description: string;
    itemType: string;
    totalItems: number;
}

export function PaginationSEO({
    currentPage,
    totalPages,
    baseUrl,
    title,
    description,
    itemType,
    totalItems
}: PaginationSEOProps) {
    const currentUrl = currentPage === 1 ? baseUrl : `${baseUrl}?page=${currentPage}`;
    const prevUrl = currentPage > 1 ? (currentPage === 2 ? baseUrl : `${baseUrl}?page=${currentPage - 1}`) : null;
    const nextUrl = currentPage < totalPages ? `${baseUrl}?page=${currentPage + 1}` : null;

    const pageTitle = currentPage === 1
        ? title
        : `${title} - Pagina ${currentPage} di ${totalPages}`;

    const pageDescription = currentPage === 1
        ? description
        : `${description} Pagina ${currentPage} di ${totalPages} - ${totalItems} ${itemType} totali.`;

    return (
        <Head>
            {/* Title and Description */}
            <title>{pageTitle}</title>
            <meta name="description" content={pageDescription} />

            {/* Canonical URL */}
            <link rel="canonical" href={currentUrl} />

            {/* Pagination Links */}
            {prevUrl && <link rel="prev" href={prevUrl} />}
            {nextUrl && <link rel="next" href={nextUrl} />}

            {/* Open Graph */}
            <meta property="og:title" content={pageTitle} />
            <meta property="og:description" content={pageDescription} />
            <meta property="og:url" content={currentUrl} />

            {/* Twitter */}
            <meta name="twitter:title" content={pageTitle} />
            <meta name="twitter:description" content={pageDescription} />

            {/* Structured Data - ItemList */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "ItemList",
                        "name": title,
                        "description": description,
                        "numberOfItems": totalItems,
                        "itemListOrder": "https://schema.org/ItemListOrderAscending",
                        "url": currentUrl
                    })
                }}
            />
        </Head>
    );
}
