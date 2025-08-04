import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUrlSync } from './useUrlSync';

export interface PaginationState {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    startIndex: number;
    endIndex: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface PaginationActions {
    goToPage: (page: number) => void;
    goToNextPage: () => void;
    goToPreviousPage: () => void;
    goToFirstPage: () => void;
    goToLastPage: () => void;
    setPageSize: (size: number) => void;
}

export interface UsePaginationProps {
    totalItems: number;
    initialPage?: number;
    initialPageSize?: number;
    maxPageSize?: number;
    enableUrlSync?: boolean; // Sincronizza con URL per SEO
    paramName?: string; // Nome del parametro URL (default: 'page')
}

export interface UsePaginationReturn<T> {
    paginationState: PaginationState;
    paginationActions: PaginationActions;
    paginateItems: (items: T[]) => T[];
}

export function usePagination<T>({
    totalItems,
    initialPage = 1,
    initialPageSize = 12,
    maxPageSize = 50,
    enableUrlSync = true,
    paramName = 'page'
}: UsePaginationProps): UsePaginationReturn<T> {
    const searchParams = useSearchParams();

    // Leggi la pagina corrente dall'URL se abilitato, ma usa initialPage come fallback per SSR
    const urlPage = enableUrlSync ? parseInt(searchParams.get(paramName) || '1') : initialPage;
    const [currentPage, setCurrentPage] = useState(initialPage); // Inizia sempre con initialPage per SSR
    const [pageSize, setPageSize] = useState(Math.min(initialPageSize, maxPageSize));

    // Sincronizza con URL usando il nuovo hook
    useUrlSync({
        value: currentPage,
        paramName,
        enabled: enableUrlSync,
        defaultValue: 1
    });

    // Sincronizza la pagina con URL dopo l'hydration
    useEffect(() => {
        if (enableUrlSync && urlPage !== currentPage) {
            setCurrentPage(Math.max(1, urlPage));
        }
    }, [urlPage, enableUrlSync, currentPage]);

    const paginationState = useMemo((): PaginationState => {
        const totalPages = Math.ceil(totalItems / pageSize);
        const safePage = Math.max(1, Math.min(currentPage, totalPages));
        const startIndex = (safePage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, totalItems);

        return {
            currentPage: safePage,
            pageSize,
            totalItems,
            totalPages,
            startIndex,
            endIndex,
            hasNextPage: safePage < totalPages,
            hasPreviousPage: safePage > 1,
        };
    }, [currentPage, pageSize, totalItems]);

    const paginationActions = useMemo((): PaginationActions => ({
        goToPage: (page: number) => {
            const safePage = Math.max(1, Math.min(page, paginationState.totalPages));
            setCurrentPage(safePage);
        },
        goToNextPage: () => {
            if (paginationState.hasNextPage) {
                setCurrentPage(prev => prev + 1);
            }
        },
        goToPreviousPage: () => {
            if (paginationState.hasPreviousPage) {
                setCurrentPage(prev => prev - 1);
            }
        },
        goToFirstPage: () => setCurrentPage(1),
        goToLastPage: () => setCurrentPage(paginationState.totalPages),
        setPageSize: (size: number) => {
            const newSize = Math.min(size, maxPageSize);
            setPageSize(newSize);
            setCurrentPage(1); // Reset alla prima pagina quando cambia page size
        },
    }), [paginationState, maxPageSize]);

    const paginateItems = useMemo(() => {
        return (items: T[]): T[] => {
            const { startIndex, endIndex } = paginationState;
            return items.slice(startIndex, endIndex);
        };
    }, [paginationState]);

    return {
        paginationState,
        paginationActions,
        paginateItems,
    };
}
