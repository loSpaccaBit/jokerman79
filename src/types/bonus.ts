export interface ProviderBonus {
    id: string;
    title: string;
    description: string;
    type: 'welcome' | 'deposit' | 'free-spins' | 'cashback' | 'loyalty' | 'tournament';
    amount: string;
    code?: string;
    terms: string[];
    url: string;
    isActive: boolean;
    validUntil?: string;
    order: number;
    provider?: {
        id: string;
        name: string;
        slug: string;
        logo?: string;
    };
    publishedAt?: string;
}

export interface BonusQueryVariables {
    pagination?: {
        page?: number;
        pageSize?: number;
    };
    filters?: {
        isActive?: { eq?: boolean };
        provider?: { slug?: { eq?: string } };
        type?: { eq?: string };
    };
    sort?: string[];
}
