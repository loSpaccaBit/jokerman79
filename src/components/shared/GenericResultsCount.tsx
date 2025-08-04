interface GenericResultsCountProps {
    count: number;
    itemType?: string;
    className?: string;
}

export function GenericResultsCount({
    count,
    itemType = 'elemento',
    className = ""
}: GenericResultsCountProps) {
    const getItemText = () => {
        if (count === 0) return `Nessun ${itemType} trovato`;
        if (count === 1) return `1 ${itemType} trovato`;
        return `${count} ${itemType} trovati`;
    };

    return (
        <div className={`flex justify-between items-center ${className}`}>
            <p className="text-sm text-muted-foreground">
                {getItemText()}
            </p>
        </div>
    );
}
