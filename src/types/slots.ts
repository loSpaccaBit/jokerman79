// Types per il sistema delle slot demo
export interface SlotDemo {
    id: string;
    name: string;
    slug: string;
    provider: string;
    image: string;
    description: string;
    category: SlotCategory;
    rtp: number; // Return to Player percentage
    volatility: 'low' | 'medium' | 'high';
    paylines: number;
    minBet: number;
    maxBet: number;
    features: string[];
    isPopular: boolean;
    isNew: boolean;
    demoUrl: string;
    videoUrl?: string; // URL video per il player HLS
    videoUrlMobile?: string; // URL video ottimizzato per mobile
}

// Nuovo tipo per i dati completi della slot (incluso video)
export interface SlotPageData {
    name: string;
    provider: string;
    videoUrl: string;
    videoUrlMobile?: string;
    poster: string;
    rating: number;
    rtp: number;
    volatility: 'low' | 'medium' | 'high';
    maxWin: string;
    features: string[];
    review: {
        summary: string;
        pros: string[];
        cons: string[];
        verdict: string;
    };
    bonuses: Array<{
        id: string;
        title: string;
        description: string;
        type: 'welcome' | 'deposit' | 'free-spins' | 'cashback' | 'reload';
        amount?: string;
        freeSpins?: number;
        code?: string;
        minDeposit?: string;
        wagering?: string;
        validUntil?: string;
        casinoName: string;
        casinoLogo: string;
        url: string;
        isExclusive: boolean;
    }>;
}

export interface SlotProvider {
    id: string;
    name: string;
    slug?: string;
    logo: string;
    slotsCount: number;
    description?: string;
    foundedYear?: number;
    headquarters?: string;
    website?: string;
    licenses?: string[];
    rating?: number;
    isVisible?: boolean;
    review?: {
        summary: string;
        pros: string[];
        cons: string[];
        verdict: string;
    };
    bonuses?: ProviderBonus[];
}

export interface ProviderBonus {
    id: string;
    title: string;
    description: string;
    type: 'welcome' | 'deposit' | 'free-spins' | 'cashback' | 'reload';
    amount?: string;
    code?: string;
    url: string;
    terms: string[];
    validUntil?: string;
}

export type SlotCategory =
    | 'classic'
    | 'video'
    | 'progressive'
    | 'megaways'
    | 'adventure'
    | 'mythology'
    | 'fruits'
    | 'other';

export interface SlotFilters {
    provider?: string;
    category?: SlotCategory;
    minRtp?: number;
    volatility?: SlotDemo['volatility'];
    isPopular?: boolean;
    isNew?: boolean;
}

export interface SlotSearchState {
    query: string;
    filters: SlotFilters;
    sortBy: 'name' | 'rtp' | 'popularity' | 'newest';
    sortOrder: 'asc' | 'desc';
}
