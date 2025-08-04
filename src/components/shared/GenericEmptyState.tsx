import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';

interface GenericEmptyStateProps {
    onClearFilters: () => void;
    title?: string;
    description?: string;
    clearButtonText?: string;
    icon?: React.ReactNode;
    className?: string;
}

export function GenericEmptyState({
    onClearFilters,
    title = "Nessun elemento trovato",
    description = "Prova a modificare i filtri di ricerca o rimuovi alcuni filtri attivi.",
    clearButtonText = "Rimuovi tutti i filtri",
    icon,
    className = ""
}: GenericEmptyStateProps) {
    return (
        <div className={`text-center py-12 ${className}`}>
            <div className="max-w-md mx-auto">
                {icon || <Filter className="h-12 w-12 mx-auto text-muted-foreground mb-4" />}
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-muted-foreground mb-4">
                    {description}
                </p>
                <Button onClick={onClearFilters} variant="outline">
                    {clearButtonText}
                </Button>
            </div>
        </div>
    );
}
