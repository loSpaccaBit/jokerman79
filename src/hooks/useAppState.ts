import { useCallback, useEffect, useRef } from 'react';
import { useAppState } from '@/contexts/AppStateContext';
import type { GlobalError, GlobalNotification, LoadingState } from '@/contexts/AppStateContext';

// ============================================================================
// GLOBAL LOADING HOOK
// ============================================================================

export interface UseGlobalLoadingReturn {
    isLoading: boolean;
    isGlobalLoading: boolean;
    loadingStates: LoadingState[];
    setLoading: (id: string, options?: { message?: string; progress?: number; type?: LoadingState['type'] }) => void;
    clearLoading: (id: string) => void;
    clearAllLoading: () => void;
    withLoading: <T>(id: string, asyncFn: () => Promise<T>, options?: { message?: string; type?: LoadingState['type'] }) => Promise<T>;
}

/**
 * Hook per gestire stati di loading globali
 */
export function useGlobalLoading(): UseGlobalLoadingReturn {
    const { state, setLoading, clearLoading, clearAllLoading } = useAppState();

    const withLoading = useCallback(async <T>(
        id: string,
        asyncFn: () => Promise<T>,
        options?: { message?: string; type?: LoadingState['type'] }
    ): Promise<T> => {
        try {
            setLoading(id, options);
            const result = await asyncFn();
            return result;
        } finally {
            clearLoading(id);
        }
    }, [setLoading, clearLoading]);

    return {
        isLoading: state.loadingStates.length > 0,
        isGlobalLoading: state.isGlobalLoading,
        loadingStates: state.loadingStates,
        setLoading,
        clearLoading,
        clearAllLoading,
        withLoading,
    };
}

// ============================================================================
// ERROR HANDLER HOOK
// ============================================================================

export interface UseErrorHandlerReturn {
    errors: GlobalError[];
    addError: (error: Omit<GlobalError, 'id' | 'timestamp'>) => void;
    clearError: (id: string) => void;
    clearAllErrors: () => void;
    handleError: (error: Error | string, options?: { type?: GlobalError['type']; dismissible?: boolean; metadata?: Record<string, any> }) => void;
    handleAsyncError: <T>(asyncFn: () => Promise<T>, options?: { errorMessage?: string; onError?: (error: Error) => void }) => Promise<T | null>;
}

/**
 * Hook per gestire errori globali
 */
export function useErrorHandler(): UseErrorHandlerReturn {
    const { state, addError, clearError, clearAllErrors } = useAppState();

    const handleError = useCallback((
        error: Error | string,
        options?: {
            type?: GlobalError['type'];
            dismissible?: boolean;
            metadata?: Record<string, any>;
        }
    ) => {
        const message = typeof error === 'string' ? error : error.message;

        addError({
            message,
            type: options?.type || 'error',
            dismissible: options?.dismissible ?? true,
            metadata: {
                ...options?.metadata,
                stack: typeof error === 'object' ? error.stack : undefined,
            },
        });
    }, [addError]);

    const handleAsyncError = useCallback(async <T>(
        asyncFn: () => Promise<T>,
        options?: {
            errorMessage?: string;
            onError?: (error: Error) => void;
        }
    ): Promise<T | null> => {
        try {
            return await asyncFn();
        } catch (error) {
            const errorInstance = error instanceof Error ? error : new Error(String(error));

            handleError(
                options?.errorMessage || errorInstance.message,
                { metadata: { originalError: errorInstance } }
            );

            options?.onError?.(errorInstance);
            return null;
        }
    }, [handleError]);

    return {
        errors: state.errors,
        addError,
        clearError,
        clearAllErrors,
        handleError,
        handleAsyncError,
    };
}

// ============================================================================
// NOTIFICATIONS HOOK
// ============================================================================

export interface UseNotificationsReturn {
    notifications: GlobalNotification[];
    addNotification: (notification: Omit<GlobalNotification, 'id' | 'timestamp'>) => void;
    clearNotification: (id: string) => void;
    clearAllNotifications: () => void;
    showSuccess: (message: string, title?: string) => void;
    showError: (message: string, title?: string) => void;
    showWarning: (message: string, title?: string) => void;
    showInfo: (message: string, title?: string) => void;
}

/**
 * Hook per gestire notifiche globali
 */
export function useNotifications(): UseNotificationsReturn {
    const {
        state,
        addNotification,
        clearNotification,
        clearAllNotifications,
        showSuccess,
        showError,
        showWarning,
        showInfo,
    } = useAppState();

    return {
        notifications: state.notifications,
        addNotification,
        clearNotification,
        clearAllNotifications,
        showSuccess,
        showError,
        showWarning,
        showInfo,
    };
}

// ============================================================================
// NETWORK STATUS HOOK
// ============================================================================

export interface UseNetworkStatusReturn {
    isOnline: boolean;
    isOffline: boolean;
    connectionType?: string;
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
    lastChecked: number;
    quality: 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';
}

/**
 * Hook per monitorare lo stato della rete
 */
export function useNetworkStatus(): UseNetworkStatusReturn {
    const { state } = useAppState();
    const { networkStatus, isOffline } = state;

    // Calcola la qualità della connessione
    const quality: UseNetworkStatusReturn['quality'] = (() => {
        if (!networkStatus.isOnline) return 'poor';
        if (!networkStatus.effectiveType) return 'unknown';

        switch (networkStatus.effectiveType) {
            case '4g':
                return 'excellent';
            case '3g':
                return 'good';
            case '2g':
                return 'fair';
            case 'slow-2g':
                return 'poor';
            default:
                return 'unknown';
        }
    })();

    return {
        isOnline: networkStatus.isOnline,
        isOffline,
        connectionType: networkStatus.connectionType,
        effectiveType: networkStatus.effectiveType,
        downlink: networkStatus.downlink,
        rtt: networkStatus.rtt,
        lastChecked: networkStatus.lastChecked,
        quality,
    };
}

// ============================================================================
// ENHANCED ASYNC OPERATIONS HOOK
// ============================================================================

export interface UseAsyncOperationOptions {
    loadingId?: string;
    loadingMessage?: string;
    loadingType?: LoadingState['type'];
    errorMessage?: string;
    successMessage?: string;
    onSuccess?: () => void;
    onError?: (error: Error) => void;
    retryCount?: number;
    retryDelay?: number;
}

export interface UseAsyncOperationReturn {
    execute: <T>(asyncFn: () => Promise<T>, options?: UseAsyncOperationOptions) => Promise<T | null>;
    isLoading: boolean;
    error: Error | null;
}

/**
 * Hook per operazioni asincrone con gestione completa di loading, errori e retry
 */
export function useAsyncOperation(): UseAsyncOperationReturn {
    const { setLoading, clearLoading } = useGlobalLoading();
    const { handleError } = useErrorHandler();
    const { showSuccess } = useNotifications();
    const errorRef = useRef<Error | null>(null);
    const loadingRef = useRef<boolean>(false);

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const execute = useCallback(async <T>(
        asyncFn: () => Promise<T>,
        options: UseAsyncOperationOptions = {}
    ): Promise<T | null> => {
        const {
            loadingId = `async_${Date.now()}`,
            loadingMessage,
            loadingType = 'local',
            errorMessage,
            successMessage,
            onSuccess,
            onError,
            retryCount = 0,
            retryDelay = 1000,
        } = options;

        let attempt = 0;
        errorRef.current = null;
        loadingRef.current = true;

        while (attempt <= retryCount) {
            try {
                setLoading(loadingId, {
                    message: loadingMessage || (attempt > 0 ? `Tentativo ${attempt + 1}...` : undefined),
                    type: loadingType
                });

                const result = await asyncFn();

                clearLoading(loadingId);
                loadingRef.current = false;

                if (successMessage) {
                    showSuccess(successMessage);
                }

                onSuccess?.();
                return result;

            } catch (error) {
                const errorInstance = error instanceof Error ? error : new Error(String(error));
                errorRef.current = errorInstance;

                // Se è l'ultimo tentativo o non ci sono retry
                if (attempt >= retryCount) {
                    clearLoading(loadingId);
                    loadingRef.current = false;

                    handleError(
                        errorMessage || errorInstance.message,
                        { metadata: { originalError: errorInstance, attempts: attempt + 1 } }
                    );

                    onError?.(errorInstance);
                    return null;
                }

                // Aspetta prima del prossimo tentativo
                if (retryDelay > 0) {
                    await sleep(retryDelay * Math.pow(2, attempt)); // Exponential backoff
                }
            }

            attempt++;
        }

        return null;
    }, [setLoading, clearLoading, handleError, showSuccess]);

    return {
        execute,
        isLoading: loadingRef.current,
        error: errorRef.current,
    };
}

// ============================================================================
// MAINTENANCE MODE HOOK
// ============================================================================

export interface UseMaintenanceModeReturn {
    isMaintenanceMode: boolean;
    checkMaintenanceMode: () => Promise<boolean>;
}

/**
 * Hook per gestire la modalità manutenzione
 */
export function useMaintenanceMode(): UseMaintenanceModeReturn {
    const { state, dispatch } = useAppState();

    const checkMaintenanceMode = useCallback(async (): Promise<boolean> => {
        try {
            // Qui puoi implementare una chiamata API per verificare lo stato di manutenzione
            // const response = await fetch('/api/maintenance-status');
            // const { isMaintenanceMode } = await response.json();

            // Per ora, mock implementation
            const isMaintenanceMode = false;

            dispatch({
                type: 'SET_MAINTENANCE_MODE',
                payload: isMaintenanceMode,
            });

            return isMaintenanceMode;
        } catch (error) {
            console.warn('Failed to check maintenance mode:', error);
            return false;
        }
    }, [dispatch]);

    useEffect(() => {
        // Check maintenance mode on mount
        checkMaintenanceMode();

        // Set up periodic checks (every 5 minutes)
        const interval = setInterval(checkMaintenanceMode, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, [checkMaintenanceMode]);

    return {
        isMaintenanceMode: state.maintenanceMode,
        checkMaintenanceMode,
    };
}
