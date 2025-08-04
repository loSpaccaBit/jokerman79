export interface PartnerStatistics {
    yearsOfPartnership?: number;
    gamesProvided?: number;
    playersServed?: string;
    countriesServed?: number;
    certifications?: string[];
}

export interface Partner {
    id: string;
    name: string;
    slug: string;
    description: string;
    logo?: string;
    website?: string;
    partnershipType: 'game-provider' | 'payment-provider' | 'affiliate' | 'technology' | 'marketing' | 'other';
    isActive: boolean;
    isFeatured: boolean;
    order: number;
    partnerSince?: string;
    contactEmail?: string;
    services?: string[];
    statistics?: PartnerStatistics;
    publishedAt?: string;
}

export interface PartnerQueryVariables {
    pagination?: {
        page?: number;
        pageSize?: number;
    };
    filters?: {
        isActive?: { eq?: boolean };
        isFeatured?: { eq?: boolean };
        partnershipType?: { eq?: string };
        slug?: { eq?: string };
    };
    sort?: string[];
}
