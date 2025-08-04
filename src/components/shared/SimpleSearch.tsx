import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SimpleSearchProps {
    onSearch: (query: string) => void;
    placeholder?: string;
    className?: string;
}

export function SimpleSearch({
    onSearch,
    placeholder = "Cerca...",
    className = ""
}: SimpleSearchProps) {
    const [query, setQuery] = useState("");

    const handleChange = (value: string) => {
        setQuery(value);
        onSearch(value);
    };

    const clearSearch = () => {
        setQuery("");
        onSearch("");
    };

    return (
        <div className={`relative ${className}`}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                    type="text"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => handleChange(e.target.value)}
                    className="pl-10 pr-10"
                />
                {query && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearSearch}
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}
