import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuickFilters } from "@/hooks/useOptimizedFilters";
import { useDynamicFilters } from "@/hooks/useDynamicFilters";

interface QuickFiltersProps {
    className?: string;
}

export function QuickFilters({ className }: QuickFiltersProps) {
    const { quickFilters, hasActiveFilters, clearFilters, setMultipleFilters } = useQuickFilters();

    // Ottieni provider popolari dinamicamente dal backend
    const { popularProviders, isLoading } = useDynamicFilters();

    // Crea filtri rapidi per provider dinamici
    const providerQuickFilters = popularProviders.map((provider) => ({
        id: provider.slug,
        label: provider.name,
        action: () => setMultipleFilters({ provider: provider.name, resetPage: true })
    }));

    if (isLoading) {
        return (
            <Card className={className}>
                <CardContent className="p-4">
                    <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-muted rounded w-24"></div>
                        <div className="flex gap-2">
                            <div className="h-8 bg-muted rounded w-16"></div>
                            <div className="h-8 bg-muted rounded w-20"></div>
                            <div className="h-8 bg-muted rounded w-18"></div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardContent className="p-4">
                <div className="space-y-4">
                    {/* Filtri rapidi generali */}
                    <div>
                        <h4 className="text-sm font-medium mb-2">Filtri Rapidi</h4>
                        <div className="flex flex-wrap gap-2">
                            {quickFilters.map((filter) => (
                                <Button
                                    key={filter.id}
                                    variant="outline"
                                    size="sm"
                                    onClick={filter.action}
                                    className="h-8 px-3 text-xs"
                                >
                                    <span className="mr-1">{filter.icon}</span>
                                    {filter.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Provider rapidi */}
                    <div>
                        <h4 className="text-sm font-medium mb-2">Provider Popolari</h4>
                        <div className="flex flex-wrap gap-2">
                            {providerQuickFilters.map((provider) => (
                                <Badge
                                    key={provider.id}
                                    variant="secondary"
                                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                                    onClick={provider.action}
                                >
                                    {provider.label}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Pulsante per pulire filtri */}
                    {hasActiveFilters && (
                        <div className="pt-2 border-t">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearFilters}
                                className="w-full text-xs"
                            >
                                🗑️ Pulisci tutti i filtri
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

/**
 * Componente per mostrare i filtri attivi in modo più elegante
 */
export function ActiveFiltersDisplay() {
    const {
        searchQuery,
        providerFilter,
        categoryFilter,
        sortBy,
        hasActiveFilters,
        clearFilters,
        setSearchQuery,
        setProviderFilter,
        setCategoryFilter,
        setSortBy
    } = useQuickFilters();

    if (!hasActiveFilters) return null;

    const activeFilters = [
        {
            type: 'search',
            label: `Ricerca: "${searchQuery}"`,
            value: searchQuery,
            onRemove: () => setSearchQuery('')
        },
        {
            type: 'provider',
            label: `Provider: ${providerFilter}`,
            value: providerFilter,
            onRemove: () => setProviderFilter('')
        },
        {
            type: 'category',
            label: `Categoria: ${categoryFilter}`,
            value: categoryFilter,
            onRemove: () => setCategoryFilter('')
        },
        {
            type: 'sort',
            label: `Ordinato per: ${sortBy}`,
            value: sortBy,
            onRemove: () => setSortBy('rating'),
            hideIfDefault: sortBy === 'rating'
        }
    ].filter(filter => filter.value && !filter.hideIfDefault);

    return (
        <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-sm text-muted-foreground">Filtri attivi:</span>
            {activeFilters.map((filter, index) => (
                <Badge
                    key={`${filter.type}-${index}`}
                    variant="secondary"
                    className="gap-1 pr-1"
                >
                    {filter.label}
                    <button
                        onClick={filter.onRemove}
                        className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full w-4 h-4 flex items-center justify-center text-xs"
                        aria-label={`Rimuovi filtro ${filter.type}`}
                    >
                        ×
                    </button>
                </Badge>
            ))}
            <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-6 px-2 text-xs"
            >
                Pulisci tutto
            </Button>
        </div>
    );
}

/**
 * Componente per suggerimenti di ricerca intelligenti
 */
export function SearchSuggestions() {
    const { searchQuery, setSearchQuery } = useQuickFilters();

    const suggestions = [
        'Gates of Olympus',
        'Sweet Bonanza',
        'Pragmatic Play',
        'NetEnt',
        'Megaways',
        'Jackpot',
        'Free Spins',
        'Bonus'
    ].filter(suggestion =>
        suggestion.toLowerCase().includes(searchQuery.toLowerCase()) &&
        suggestion.toLowerCase() !== searchQuery.toLowerCase()
    );

    if (!searchQuery || suggestions.length === 0) return null;

    return (
        <div className="bg-background border rounded-md shadow-lg p-2 space-y-1">
            {suggestions.map((suggestion) => (
                <button
                    key={suggestion}
                    onClick={() => setSearchQuery(suggestion)}
                    className="w-full text-left px-2 py-1 text-sm hover:bg-accent rounded transition-colors"
                >
                    {suggestion}
                </button>
            ))}
        </div>
    );
}
