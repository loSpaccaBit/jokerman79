import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/components/ui/drawer';
import { Badge } from '@/components/ui/badge';
import { SortAsc, Filter, X, Loader2 } from 'lucide-react';
import { SORT_LABELS, SORT_OPTIONS } from '@/types/filters';
import { useDynamicFilters } from '@/hooks/useDynamicFilters';

interface GenericFiltersBarProps {
    // Provider filter
    selectedProvider: string;
    onProviderChange: (provider: string) => void;

    // Category filter
    selectedCategory: string;
    onCategoryChange: (category: string) => void;

    // Sort
    sortBy: string;
    onSortChange: (sortBy: string) => void;

    // Clear filters
    hasActiveFilters: boolean;
    onClearFilters: () => void;

    // Configuration
    labels?: {
        provider?: string;
        category?: string;
        allProviders?: string;
        allCategories?: string;
        filters?: string;
        sorting?: string;
        clearFilters?: string;
        applyFilters?: string;
        filtersDescription?: string;
    };

    // Optional: mostra conteggi
    showCounts?: boolean;
}

const defaultLabels = {
    provider: 'Provider',
    category: 'Categoria',
    allProviders: 'Tutti i provider',
    allCategories: 'Tutte le categorie',
    filters: 'Filtri',
    sorting: 'Filtri e Ordinamento',
    clearFilters: 'Rimuovi tutti i filtri',
    applyFilters: 'Applica filtri',
    filtersDescription: 'Personalizza la visualizzazione'
};

const SORT_OPTIONS_ARRAY = [
    { value: SORT_OPTIONS.POPULARITY, label: SORT_LABELS[SORT_OPTIONS.POPULARITY] },
    { value: SORT_OPTIONS.NEWEST, label: SORT_LABELS[SORT_OPTIONS.NEWEST] },
    { value: SORT_OPTIONS.NAME, label: SORT_LABELS[SORT_OPTIONS.NAME] },
    { value: SORT_OPTIONS.RTP, label: SORT_LABELS[SORT_OPTIONS.RTP] },
];

export function GenericFiltersBar({
    selectedProvider,
    onProviderChange,
    selectedCategory,
    onCategoryChange,
    sortBy,
    onSortChange,
    hasActiveFilters,
    onClearFilters,
    labels = {},
    showCounts = false,
}: GenericFiltersBarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const mergedLabels = { ...defaultLabels, ...labels };
    const currentSortLabel = SORT_LABELS[sortBy as keyof typeof SORT_LABELS] || 'Ordina';

    // Ottieni filtri dinamici dal backend
    const {
        providersForUI,
        categoriesForUI,
        counts,
        isLoading,
        hasError,
        getProviderSlug,
        getCategorySlug
    } = useDynamicFilters();

    // Calcola il numero di filtri attivi
    const activeFiltersCount = [
        selectedProvider !== 'all',
        selectedCategory !== 'all',
        sortBy !== SORT_OPTIONS.POPULARITY
    ].filter(Boolean).length;

    const handleClearFilters = () => {
        onClearFilters();
    };

    // Mostra un indicatore di caricamento se i filtri stanno caricando
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">Caricamento filtri...</span>
            </div>
        );
    }

    // Mostra errore se c'è un problema nel caricamento
    if (hasError) {
        return (
            <div className="flex items-center justify-center py-4 text-destructive">
                <span className="text-sm">Errore nel caricamento dei filtri</span>
            </div>
        );
    }

    return (
        <>
            {/* Desktop Filters - Hidden on mobile */}
            <div className="hidden lg:flex flex-row gap-4 items-center justify-between">
                <div className="flex gap-3 flex-1">
                    {/* Provider Filter */}
                    <Select value={selectedProvider} onValueChange={onProviderChange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder={mergedLabels.allProviders} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{mergedLabels.allProviders}</SelectItem>
                            {providersForUI.filter(provider => provider !== 'Tutti i Provider').map(provider => (
                                <SelectItem key={provider} value={provider}>
                                    {provider}
                                    {showCounts && counts && (
                                        <span className="ml-2 text-xs text-muted-foreground">
                                            ({counts.providerSlots})
                                        </span>
                                    )}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Category Filter */}
                    <Select value={selectedCategory} onValueChange={onCategoryChange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder={mergedLabels.allCategories} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{mergedLabels.allCategories}</SelectItem>
                            {categoriesForUI.filter(category => category !== 'Tutte le Categorie').map(category => (
                                <SelectItem key={category} value={category}>
                                    <span className="capitalize">{category}</span>
                                    {showCounts && counts && (
                                        <span className="ml-2 text-xs text-muted-foreground">
                                            ({counts.categorySlots})
                                        </span>
                                    )}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Sort and Actions */}
                <div className="flex gap-2 items-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                <SortAsc className="h-4 w-4 mr-2" />
                                {currentSortLabel}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {SORT_OPTIONS_ARRAY.map(option => (
                                <DropdownMenuItem
                                    key={option.value}
                                    onClick={() => onSortChange(option.value)}
                                >
                                    {option.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {hasActiveFilters && (
                        <Button variant="ghost" size="sm" onClick={onClearFilters}>
                            {mergedLabels.clearFilters}
                        </Button>
                    )}
                </div>
            </div>

            {/* Mobile Filters - Drawer */}
            <div className="lg:hidden">
                <div className="flex items-center justify-between gap-3">
                    <Drawer open={isOpen} onOpenChange={setIsOpen}>
                        <DrawerTrigger asChild>
                            <Button variant="outline" className="flex-1 justify-start gap-2">
                                <Filter className="h-4 w-4" />
                                <span>{mergedLabels.filters}</span>
                                {activeFiltersCount > 0 && (
                                    <Badge variant="secondary" className="ml-auto h-5 w-5 p-0 flex items-center justify-center text-xs">
                                        {activeFiltersCount}
                                    </Badge>
                                )}
                            </Button>
                        </DrawerTrigger>

                        <DrawerContent className="px-0">
                            <DrawerHeader className="text-left">
                                <DrawerTitle>{mergedLabels.sorting}</DrawerTitle>
                                <DrawerDescription>
                                    {mergedLabels.filtersDescription}
                                </DrawerDescription>
                            </DrawerHeader>

                            <div className="px-4 pb-4 space-y-6 overflow-y-auto max-h-[60vh]">
                                {/* Provider Filter */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{mergedLabels.provider}</label>
                                    <Select value={selectedProvider} onValueChange={onProviderChange}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder={mergedLabels.allProviders} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">{mergedLabels.allProviders}</SelectItem>
                                            {providersForUI.filter(provider => provider !== 'Tutti i Provider').map(provider => (
                                                <SelectItem key={provider} value={provider}>
                                                    {provider}
                                                    {showCounts && counts && (
                                                        <span className="ml-2 text-xs text-muted-foreground">
                                                            ({counts.providerSlots})
                                                        </span>
                                                    )}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Category Filter */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{mergedLabels.category}</label>
                                    <Select value={selectedCategory} onValueChange={onCategoryChange}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder={mergedLabels.allCategories} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">{mergedLabels.allCategories}</SelectItem>
                                            {categoriesForUI.filter(category => category !== 'Tutte le Categorie').map(category => (
                                                <SelectItem key={category} value={category}>
                                                    <span className="capitalize">{category}</span>
                                                    {showCounts && counts && (
                                                        <span className="ml-2 text-xs text-muted-foreground">
                                                            ({counts.categorySlots})
                                                        </span>
                                                    )}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Sort Options */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Ordinamento</label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {SORT_OPTIONS_ARRAY.map(option => (
                                            <Button
                                                key={option.value}
                                                variant={sortBy === option.value ? "default" : "outline"}
                                                className="justify-start h-12"
                                                onClick={() => onSortChange(option.value)}
                                            >
                                                {option.label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <DrawerFooter className="pt-4 border-t">
                                <div className="flex flex-col gap-2">
                                    {hasActiveFilters && (
                                        <DrawerClose asChild>
                                            <Button
                                                variant="outline"
                                                onClick={handleClearFilters}
                                                className="w-full"
                                            >
                                                <X className="h-4 w-4 mr-2" />
                                                {mergedLabels.clearFilters}
                                            </Button>
                                        </DrawerClose>
                                    )}
                                    <DrawerClose asChild>
                                        <Button className="w-full">
                                            {mergedLabels.applyFilters}
                                        </Button>
                                    </DrawerClose>
                                </div>
                            </DrawerFooter>
                        </DrawerContent>
                    </Drawer>

                    {/* Quick Sort Button on Mobile */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="px-3">
                                <SortAsc className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {SORT_OPTIONS_ARRAY.map(option => (
                                <DropdownMenuItem
                                    key={option.value}
                                    onClick={() => onSortChange(option.value)}
                                    className={sortBy === option.value ? "bg-accent" : ""}
                                >
                                    {option.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </>
    );
}
