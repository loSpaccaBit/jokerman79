import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useGlobalSearch } from '@/contexts/GlobalSearchContext';

export function GlobalSearchButton() {
    const { openSearch } = useGlobalSearch();
    const [isMac, setIsMac] = useState(false);

    useEffect(() => {
        setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
    }, []);

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={openSearch}
            className="w-full gap-2 text-muted-foreground hover:text-foreground justify-start"
        >
            <Search className="h-4 w-4" />
            <span className="flex-1 text-left">Cerca...</span>
            <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                <span className="text-xs">{isMac ? '⌘' : 'Ctrl+'}</span>K
            </kbd>
        </Button>
    );
}
