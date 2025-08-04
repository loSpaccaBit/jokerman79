import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
    pageSizeOptions?: number[];
    showPageSizeSelector?: boolean;
    showFirstLast?: boolean;
    maxVisiblePages?: number;
    className?: string;
    itemName?: string;
    // SEO-friendly props
    baseUrl?: string; // Per generare link SEO-friendly
    useLinks?: boolean; // Se usare Link di Next.js invece di button
}

const defaultPageSizeOptions = [12, 24, 36, 48];

export function Pagination({
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    hasNextPage,
    hasPreviousPage,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = defaultPageSizeOptions,
    showPageSizeSelector = true,
    showFirstLast = true,
    maxVisiblePages = 5,
    className,
    itemName = "elementi",
    baseUrl = "",
    useLinks = true
}: PaginationProps) {

    // Genera URL per una specifica pagina
    const getPageUrl = (page: number) => {
        if (!baseUrl) return '#';
        return page === 1 ? baseUrl : `${baseUrl}?page=${page}`;
    };

    // Componente per i pulsanti/link di pagina
    const PageButton = ({
        page,
        isActive = false,
        disabled = false,
        children
    }: {
        page: number;
        isActive?: boolean;
        disabled?: boolean;
        children: React.ReactNode;
    }) => {
        const buttonContent = (
            <Button
                variant={isActive ? "default" : "outline"}
                size="sm"
                disabled={disabled}
                className={disabled ? "cursor-not-allowed" : ""}
            >
                {children}
            </Button>
        );

        if (useLinks && !disabled && baseUrl) {
            return (
                <Link href={getPageUrl(page)} prefetch={false}>
                    {buttonContent}
                </Link>
            );
        }

        return (
            <div onClick={() => !disabled && onPageChange(page)}>
                {buttonContent}
            </div>
        );
    };

    // Calcola le pagine visibili
    const getVisiblePages = () => {
        if (totalPages <= maxVisiblePages) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const halfVisible = Math.floor(maxVisiblePages / 2);
        let start = Math.max(1, currentPage - halfVisible);
        const end = Math.min(totalPages, start + maxVisiblePages - 1);

        // Aggiusta l'inizio se siamo vicini alla fine
        if (end - start + 1 < maxVisiblePages) {
            start = Math.max(1, end - maxVisiblePages + 1);
        }

        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    };

    const visiblePages = getVisiblePages();
    const showStartEllipsis = visiblePages[0] > 2;
    const showEndEllipsis = visiblePages[visiblePages.length - 1] < totalPages - 1;

    const startIndex = (currentPage - 1) * pageSize + 1;
    const endIndex = Math.min(currentPage * pageSize, totalItems);

    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4", className)}>
            {/* Info risultati */}
            <div className="text-sm text-muted-foreground">
                Mostrando {startIndex}-{endIndex} di {totalItems} {itemName}
            </div>

            {/* Controlli paginazione */}
            <div className="flex items-center gap-2">
                {/* Pulsanti navigazione */}
                <div className="flex items-center gap-1">
                    {showFirstLast && (
                        <PageButton page={1} disabled={!hasPreviousPage}>
                            <ChevronsLeft className="h-4 w-4" />
                        </PageButton>
                    )}

                    <PageButton page={currentPage - 1} disabled={!hasPreviousPage}>
                        <ChevronLeft className="h-4 w-4" />
                        <span className="hidden sm:inline ml-1">Precedente</span>
                    </PageButton>

                    {/* Pulsanti pagine */}
                    <div className="hidden sm:flex items-center gap-1">
                        {/* Prima pagina */}
                        {showStartEllipsis && (
                            <>
                                <PageButton page={1} isActive={1 === currentPage}>
                                    1
                                </PageButton>
                                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                            </>
                        )}

                        {/* Pagine visibili */}
                        {visiblePages.map((page) => (
                            <PageButton
                                key={page}
                                page={page}
                                isActive={page === currentPage}
                            >
                                {page}
                            </PageButton>
                        ))}

                        {/* Ultima pagina */}
                        {showEndEllipsis && (
                            <>
                                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                <PageButton page={totalPages} isActive={totalPages === currentPage}>
                                    {totalPages}
                                </PageButton>
                            </>
                        )}
                    </div>

                    <PageButton page={currentPage + 1} disabled={!hasNextPage}>
                        <span className="hidden sm:inline mr-1">Successiva</span>
                        <ChevronRight className="h-4 w-4" />
                    </PageButton>

                    {showFirstLast && (
                        <PageButton page={totalPages} disabled={!hasNextPage}>
                            <ChevronsRight className="h-4 w-4" />
                        </PageButton>
                    )}
                </div>

                {/* Selettore dimensione pagina */}
                {showPageSizeSelector && onPageSizeChange && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground hidden sm:inline">
                            Mostra:
                        </span>
                        <Select
                            value={pageSize.toString()}
                            onValueChange={(value) => onPageSizeChange(parseInt(value))}
                        >
                            <SelectTrigger className="w-[70px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {pageSizeOptions.map((size) => (
                                    <SelectItem key={size} value={size.toString()}>
                                        {size}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>
        </div>
    );
}
