"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export interface SearchResult {
    id: string;
    title: string;
    type: 'provider' | 'slot' | 'blog' | 'bonus';
    slug?: string;
    excerpt?: string;
    image?: string;
    url: string;
}

interface GlobalSearchContextType {
    searchQuery: string;
    searchResults: SearchResult[];
    isSearching: boolean;
    isSearchOpen: boolean;
    setSearchQuery: (query: string) => void;
    setSearchResults: (results: SearchResult[]) => void;
    setIsSearching: (searching: boolean) => void;
    openSearch: () => void;
    closeSearch: () => void;
    clearSearch: () => void;
    navigateToResult: (result: SearchResult) => void;
}

const GlobalSearchContext = createContext<GlobalSearchContextType | undefined>(undefined);

interface GlobalSearchProviderProps {
    children: ReactNode;
}

export function GlobalSearchProvider({ children }: GlobalSearchProviderProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    const openSearch = () => setIsSearchOpen(true);
    const closeSearch = () => {
        setIsSearchOpen(false);
        setSearchQuery('');
        setSearchResults([]);
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
    };

    const navigateToResult = (result: SearchResult) => {
        closeSearch();
        router.push(result.url);
    };

    return (
        <GlobalSearchContext.Provider
            value={{
                searchQuery,
                searchResults,
                isSearching,
                isSearchOpen,
                setSearchQuery,
                setSearchResults,
                setIsSearching,
                openSearch,
                closeSearch,
                clearSearch,
                navigateToResult,
            }}
        >
            {children}
        </GlobalSearchContext.Provider>
    );
}

export function useGlobalSearch() {
    const context = useContext(GlobalSearchContext);
    if (context === undefined) {
        throw new Error('useGlobalSearch must be used within a GlobalSearchProvider');
    }
    return context;
}
