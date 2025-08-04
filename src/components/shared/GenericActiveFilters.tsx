import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface GenericActiveFiltersProps {
    searchQuery: string;
    selectedProvider: string;
    selectedCategory: string;
    hasActiveFilters: boolean;
    onProviderChange?: (provider: string) => void;
    onCategoryChange?: (category: string) => void;
    labels?: {
        search?: string;
        provider?: string;
        category?: string;
    };
}

const defaultLabels = {
    search: 'Ricerca',
    provider: 'Provider',
    category: 'Categoria',
};

export function GenericActiveFilters({
    searchQuery,
    selectedProvider,
    selectedCategory,
    hasActiveFilters,
    onProviderChange,
    onCategoryChange,
    labels = {},
}: GenericActiveFiltersProps) {
    const mergedLabels = { ...defaultLabels, ...labels };

    if (!hasActiveFilters) {
        return null;
    }

    return (
        <div className="flex flex-wrap gap-2">
            {searchQuery && (
                <Badge variant="secondary" className="text-xs">
                    {mergedLabels.search}: &quot;{searchQuery}&quot;
                </Badge>
            )}

            {selectedProvider !== 'all' && (
                <Badge
                    variant="secondary"
                    className="text-xs flex items-center gap-1 pr-1"
                >
                    {mergedLabels.provider}: {selectedProvider}
                    {onProviderChange && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="p-0 w-4 h-4 hover:bg-transparent"
                            onClick={() => onProviderChange('all')}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    )}
                </Badge>
            )}

            {selectedCategory !== 'all' && (
                <Badge
                    variant="secondary"
                    className="text-xs flex items-center gap-1 pr-1"
                >
                    {mergedLabels.category}: <span className="capitalize">{selectedCategory}</span>
                    {onCategoryChange && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="p-0 w-4 h-4 hover:bg-transparent"
                            onClick={() => onCategoryChange('all')}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    )}
                </Badge>
            )}
        </div>
    );
}
