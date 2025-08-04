import { useState, useEffect, useRef } from 'react';

// Hook per lazy loading on intersection
export function useLazyLoad<T>(
    importFn: () => Promise<T>,
    options: IntersectionObserverInit = {}
) {
    const [module, setModule] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !module && !loading) {
                    setLoading(true);
                    importFn()
                        .then(setModule)
                        .catch(setError)
                        .finally(() => setLoading(false));
                }
            },
            {
                rootMargin: '50px',
                threshold: 0.1,
                ...options,
            }
        );

        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [importFn, module, loading, options]);

    return { ref, module, loading, error };
}

// Hook per preload on hover
export function usePreloadOnInteraction() {
    const preloadedModules = useRef(new Set<string>());

    const preload = (key: string, importFn: () => Promise<unknown>) => {
        if (!preloadedModules.current.has(key)) {
            preloadedModules.current.add(key);
            importFn().catch(console.error);
        }
    };

    return { preload };
}

// Hook per gestire il loading state dei componenti lazy
export function useLazyComponent(condition: boolean = true) {
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        if (condition) {
            // Delay rendering to avoid blocking main thread
            const timer = setTimeout(() => setShouldRender(true), 0);
            return () => clearTimeout(timer);
        }
    }, [condition]);

    return shouldRender;
}
