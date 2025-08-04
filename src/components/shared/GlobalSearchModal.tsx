"use client";

import React, { useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, X, FileText, Building, Clock } from 'lucide-react';
import { useGlobalSearch } from '@/contexts/GlobalSearchContext';
import { useGlobalSearchResults } from '@/hooks/useGlobalSearchResults';
import { useDebounce } from '@/hooks/useDebounce';
import Image from 'next/image';

export function GlobalSearchModal() {
    const {
        searchQuery,
        isSearchOpen,
        closeSearch,
        navigateToResult,
        setSearchQuery,
    } = useGlobalSearch();

    const debouncedQuery = useDebounce(searchQuery, 300);
    const { searchResults, isSearching } = useGlobalSearchResults(debouncedQuery);
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus sull'input quando si apre il modal
    useEffect(() => {
        if (isSearchOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isSearchOpen]);

    // Gestisci Escape per chiudere
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                closeSearch();
            }
        };

        if (isSearchOpen) {
            document.addEventListener('keydown', handleEscape);
            return () => document.removeEventListener('keydown', handleEscape);
        }
    }, [isSearchOpen, closeSearch]);

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'provider':
                return <Building className="h-4 w-4" />;
            case 'blog':
                return <FileText className="h-4 w-4" />;
            default:
                return <Search className="h-4 w-4" />;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'provider':
                return 'Provider';
            case 'blog':
                return 'Blog';
            case 'slot':
                return 'Slot';
            case 'bonus':
                return 'Bonus';
            default:
                return 'Risultato';
        }
    };

    const handleResultClick = (result: any) => {
        navigateToResult(result);
    };

    return (
        <Dialog open={isSearchOpen} onOpenChange={closeSearch}>
            <DialogContent className="max-w-2xl max-h-[80vh] p-0 overflow-hidden">
                {/* Titolo accessibile nascosto visivamente */}
                <DialogTitle className="sr-only">
                    Ricerca globale
                </DialogTitle>

                <div className="flex flex-col h-full">
                    {/* Header con input di ricerca */}
                    <div className="p-4 border-b">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                ref={inputRef}
                                type="text"
                                placeholder="Cerca provider, slot, articoli..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-10 text-lg h-12"
                            />
                            {searchQuery && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Contenuto dei risultati */}
                    <div className="flex-1 overflow-y-auto">
                        {!searchQuery || searchQuery.length < 2 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Inizia a digitare per cercare...</p>
                                <p className="text-sm mt-2">Cerca tra provider, slot, articoli del blog e bonus</p>
                            </div>
                        ) : isSearching ? (
                            <div className="p-4 space-y-4">
                                {Array.from({ length: 3 }, (_, i) => (
                                    <div key={i} className="flex items-center space-x-3 p-3">
                                        <Skeleton className="h-12 w-12 rounded" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-3/4" />
                                            <Skeleton className="h-3 w-1/2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : searchResults.length > 0 ? (
                            <div className="p-2">
                                {searchResults.map((result) => (
                                    <button
                                        key={result.id}
                                        onClick={() => handleResultClick(result)}
                                        className="w-full text-left p-3 rounded-lg hover:bg-muted/50 transition-colors flex items-center space-x-3 group"
                                    >
                                        {result.image ? (
                                            <div className="relative h-12 w-12 rounded overflow-hidden flex-shrink-0">
                                                <Image
                                                    src={result.image}
                                                    alt={result.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="h-12 w-12 rounded bg-muted flex items-center justify-center flex-shrink-0">
                                                {getTypeIcon(result.type)}
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-medium truncate group-hover:text-primary transition-colors">
                                                    {result.title}
                                                </h3>
                                                <Badge variant="outline" className="text-xs">
                                                    {getTypeLabel(result.type)}
                                                </Badge>
                                            </div>
                                            {result.excerpt && (
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {result.excerpt}
                                                </p>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-muted-foreground">
                                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Nessun risultato trovato per &quot;{searchQuery}&quot;</p>
                                <p className="text-sm mt-2">Prova con termini diversi o controlla l&apos;ortografia</p>
                            </div>
                        )}
                    </div>

                    {/* Footer con shortcut */}
                    <div className="p-3 border-t bg-muted/20 text-xs text-muted-foreground text-center">
                        Premi <kbd className="px-1 py-0.5 bg-muted rounded">Esc</kbd> per chiudere
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
