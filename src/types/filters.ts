import { SlotDemo, SlotCategory } from './slots';

// Generic filter types that can be extended
export interface BaseFilterOptions {
    provider?: string;
    category?: SlotCategory;
    sortBy?: SortOption;
}

export interface BaseFilterState extends BaseFilterOptions {
    searchQuery: string;
}

export type SortOption = 'popularity' | 'newest' | 'name' | 'rtp';

export interface FilterableItem {
    id: string;
    name: string;
    provider: string;
    category: SlotCategory;
    isPopular: boolean;
    isNew: boolean;
    rtp?: number;
}

// Slot-specific filter interface (extends base)
export interface SlotFilterOptions extends BaseFilterOptions {
    minRtp?: number;
    volatility?: SlotDemo['volatility'];
    isPopular?: boolean;
    isNew?: boolean;
}

export interface SlotFilterState extends BaseFilterState {
    provider?: string;
    category?: SlotCategory;
    minRtp?: number;
    volatility?: SlotDemo['volatility'];
    isPopular?: boolean;
    isNew?: boolean;
}

// Filter component props interface
export interface FilterComponentProps<T extends FilterableItem> {
    items: T[];
    searchQuery?: string;
    onSearchChange?: (query: string) => void;

    // Filter states
    selectedProvider: string;
    onProviderChange: (provider: string) => void;
    providers: string[];

    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    categories: string[];

    sortBy: string;
    onSortChange: (sortBy: string) => void;

    // Actions
    hasActiveFilters: boolean;
    onClearFilters: () => void;
}

// Hook return type for generic filters
export interface UseGenericFiltersReturn<T extends FilterableItem> {
    // State
    selectedProvider: string;
    selectedCategory: string;
    sortBy: string;

    // Actions
    setSelectedProvider: (provider: string) => void;
    setSelectedCategory: (category: string) => void;
    setSortBy: (sortBy: string) => void;
    clearFilters: () => void;

    // Computed
    filteredAndSortedItems: T[];
    hasActiveFilters: boolean;
    providers: string[];
    categories: string[];
}

// Constants
export const SORT_OPTIONS = {
    POPULARITY: 'popularity',
    NEWEST: 'newest',
    NAME: 'name',
    RTP: 'rtp',
} as const;

export const FILTER_ALL_VALUE = 'all';

export const SORT_LABELS = {
    [SORT_OPTIONS.POPULARITY]: 'Più popolari',
    [SORT_OPTIONS.NEWEST]: 'Più recenti',
    [SORT_OPTIONS.NAME]: 'Nome A-Z',
    [SORT_OPTIONS.RTP]: 'RTP più alto',
} as const;
