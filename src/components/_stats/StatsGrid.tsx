"use client"

import { useState, useEffect } from 'react';
import { SlotDemo } from '@/types/slots';
import { useGenericFilters } from '@/hooks/useGenericFilters';

// Shared Components
import {
    GenericFiltersBar,
    GenericActiveFilters,
    GenericResultsCount,
    GenericEmptyState
} from '@/components/shared';

// Local Components  
import { SlotsGrid } from './SlotsGrid';

interface StatsGridProps {
    slots: SlotDemo[];
    searchQuery?: string;
}

export function StatsGrid({ slots, searchQuery = '' }: StatsGridProps) {
    const [internalSearchQuery, setInternalSearchQuery] = useState(searchQuery);

    const {
        selectedProvider,
        selectedCategory,
        sortBy,
        setSelectedProvider,
        setSelectedCategory,
        setSortBy,
        clearFilters,
        filteredAndSortedItems: filteredAndSortedSlots,
        hasActiveFilters,
        providers,
        categories,
    } = useGenericFilters(slots, internalSearchQuery);

    // Sincronizza la search query esterna con lo stato interno
    useEffect(() => {
        if (searchQuery !== internalSearchQuery) {
            setInternalSearchQuery(searchQuery);
        }
    }, [searchQuery, internalSearchQuery]);

    const hasResults = filteredAndSortedSlots.length > 0;

    return (
        <div className="space-y-6">
            {/* Filters Bar */}
            <GenericFiltersBar
                selectedProvider={selectedProvider}
                onProviderChange={setSelectedProvider}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                sortBy={sortBy}
                onSortChange={setSortBy}
                hasActiveFilters={hasActiveFilters}
                onClearFilters={clearFilters}
                labels={{
                    filtersDescription: "Personalizza la visualizzazione delle slot"
                }}
            />

            {/* Active Filters */}
            <GenericActiveFilters
                searchQuery={internalSearchQuery}
                selectedProvider={selectedProvider}
                selectedCategory={selectedCategory}
                hasActiveFilters={hasActiveFilters}
                onProviderChange={setSelectedProvider}
                onCategoryChange={setSelectedCategory}
            />

            {/* Results Count */}
            <GenericResultsCount
                count={filteredAndSortedSlots.length}
                itemType="slot"
            />

            {/* Content */}
            {hasResults ? (
                <SlotsGrid slots={filteredAndSortedSlots} />
            ) : (
                <GenericEmptyState
                    onClearFilters={clearFilters}
                    title="Nessuna slot trovata"
                    description="Prova a modificare i filtri di ricerca o rimuovi alcuni filtri attivi."
                />
            )}
        </div>
    );
}
