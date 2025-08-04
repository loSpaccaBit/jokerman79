import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface UseUrlSyncProps {
    value: number;
    paramName: string;
    enabled: boolean;
    defaultValue?: number;
}

/**
 * Hook per sincronizzare un valore con i parametri URL evitando hydration mismatch
 */
export function useUrlSync({ value, paramName, enabled, defaultValue = 1 }: UseUrlSyncProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isHydrated, setIsHydrated] = useState(false);

    // Aspetta l'hydration prima di sincronizzare
    useEffect(() => {
        setIsHydrated(true);
    }, []);

    // Sincronizza con URL solo dopo l'hydration
    useEffect(() => {
        if (!enabled || !isHydrated) return;

        const params = new URLSearchParams(searchParams);
        if (value === defaultValue) {
            params.delete(paramName);
        } else {
            params.set(paramName, value.toString());
        }

        const newUrl = params.toString() ? `?${params.toString()}` : '';
        router.replace(newUrl, { scroll: false });
    }, [value, enabled, paramName, router, searchParams, isHydrated, defaultValue]);

    return { isHydrated };
}
