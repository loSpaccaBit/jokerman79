import { useEffect } from 'react';
import { useGlobalSearch } from '@/contexts/GlobalSearchContext';

export function useGlobalKeyboardShortcuts() {
    const { openSearch, closeSearch, isSearchOpen } = useGlobalSearch();

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // ⌘K su Mac o Ctrl+K su Windows/Linux per aprire la ricerca
            if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
                event.preventDefault();
                if (isSearchOpen) {
                    closeSearch();
                } else {
                    openSearch();
                }
            }

            // Escape per chiudere la ricerca (gestito anche nel modal ma aggiungiamo qui per sicurezza)
            if (event.key === 'Escape' && isSearchOpen) {
                closeSearch();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [openSearch, closeSearch, isSearchOpen]);
}
