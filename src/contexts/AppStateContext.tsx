"use client";

import React, { createContext, useContext, useReducer, ReactNode, useCallback, useEffect } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface GlobalError {
    id: string;
    message: string;
    type: 'error' | 'warning' | 'info';
    timestamp: number;
    dismissible?: boolean;
    action?: {
        label: string;
        handler: () => void;
    };
    metadata?: Record<string, any>;
}

export interface GlobalNotification {
    id: string;
    title?: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    duration?: number; // milliseconds, 0 = no auto dismiss
    dismissible?: boolean;
    timestamp: number;
    action?: {
        label: string;
        handler: () => void;
    };
}

export interface LoadingState {
    id: string;
    message?: string;
    progress?: number; // 0-100
    type: 'global' | 'local' | 'background';
    timestamp: number;
}

export interface NetworkStatus {
    isOnline: boolean;
    connectionType?: string;
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
    lastChecked: number;
}

export interface AppState {
    // Loading states
    loadingStates: LoadingState[];
    isGlobalLoading: boolean;

    // Error states
    errors: GlobalError[];

    // Notifications
    notifications: GlobalNotification[];

    // Network status
    networkStatus: NetworkStatus;

    // Global flags
    isOffline: boolean;
    maintenanceMode: boolean;
}

// ============================================================================
// ACTIONS
// ============================================================================

export type AppAction =
    // Loading actions
    | { type: 'SET_LOADING'; payload: { id: string; message?: string; progress?: number; type?: LoadingState['type'] } }
    | { type: 'CLEAR_LOADING'; payload: { id: string } }
    | { type: 'CLEAR_ALL_LOADING' }

    // Error actions
    | { type: 'ADD_ERROR'; payload: Omit<GlobalError, 'id' | 'timestamp'> }
    | { type: 'CLEAR_ERROR'; payload: { id: string } }
    | { type: 'CLEAR_ALL_ERRORS' }

    // Notification actions
    | { type: 'ADD_NOTIFICATION'; payload: Omit<GlobalNotification, 'id' | 'timestamp'> }
    | { type: 'CLEAR_NOTIFICATION'; payload: { id: string } }
    | { type: 'CLEAR_ALL_NOTIFICATIONS' }

    // Network actions
    | { type: 'UPDATE_NETWORK_STATUS'; payload: Partial<NetworkStatus> }

    // Global flags
    | { type: 'SET_OFFLINE'; payload: boolean }
    | { type: 'SET_MAINTENANCE_MODE'; payload: boolean };

// ============================================================================
// REDUCER
// ============================================================================

const initialState: AppState = {
    loadingStates: [],
    isGlobalLoading: false,
    errors: [],
    notifications: [],
    networkStatus: {
        isOnline: true,
        lastChecked: Date.now(),
    },
    isOffline: false,
    maintenanceMode: false,
};

function appStateReducer(state: AppState, action: AppAction): AppState {
    switch (action.type) {
        // Loading actions
        case 'SET_LOADING': {
            const { id, message, progress, type = 'local' } = action.payload;
            const existingIndex = state.loadingStates.findIndex(loading => loading.id === id);

            const newLoadingState: LoadingState = {
                id,
                message,
                progress,
                type,
                timestamp: Date.now(),
            };

            let newLoadingStates: LoadingState[];
            if (existingIndex >= 0) {
                newLoadingStates = [...state.loadingStates];
                newLoadingStates[existingIndex] = newLoadingState;
            } else {
                newLoadingStates = [...state.loadingStates, newLoadingState];
            }

            const isGlobalLoading = newLoadingStates.some(loading => loading.type === 'global');

            return {
                ...state,
                loadingStates: newLoadingStates,
                isGlobalLoading,
            };
        }

        case 'CLEAR_LOADING': {
            const newLoadingStates = state.loadingStates.filter(loading => loading.id !== action.payload.id);
            const isGlobalLoading = newLoadingStates.some(loading => loading.type === 'global');

            return {
                ...state,
                loadingStates: newLoadingStates,
                isGlobalLoading,
            };
        }

        case 'CLEAR_ALL_LOADING':
            return {
                ...state,
                loadingStates: [],
                isGlobalLoading: false,
            };

        // Error actions
        case 'ADD_ERROR': {
            const newError: GlobalError = {
                ...action.payload,
                id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                timestamp: Date.now(),
            };

            return {
                ...state,
                errors: [...state.errors, newError],
            };
        }

        case 'CLEAR_ERROR':
            return {
                ...state,
                errors: state.errors.filter(error => error.id !== action.payload.id),
            };

        case 'CLEAR_ALL_ERRORS':
            return {
                ...state,
                errors: [],
            };

        // Notification actions
        case 'ADD_NOTIFICATION': {
            const newNotification: GlobalNotification = {
                ...action.payload,
                id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                timestamp: Date.now(),
            };

            return {
                ...state,
                notifications: [...state.notifications, newNotification],
            };
        }

        case 'CLEAR_NOTIFICATION':
            return {
                ...state,
                notifications: state.notifications.filter(notification => notification.id !== action.payload.id),
            };

        case 'CLEAR_ALL_NOTIFICATIONS':
            return {
                ...state,
                notifications: [],
            };

        // Network actions
        case 'UPDATE_NETWORK_STATUS':
            return {
                ...state,
                networkStatus: {
                    ...state.networkStatus,
                    ...action.payload,
                    lastChecked: Date.now(),
                },
            };

        // Global flags
        case 'SET_OFFLINE':
            return {
                ...state,
                isOffline: action.payload,
                networkStatus: {
                    ...state.networkStatus,
                    isOnline: !action.payload,
                    lastChecked: Date.now(),
                },
            };

        case 'SET_MAINTENANCE_MODE':
            return {
                ...state,
                maintenanceMode: action.payload,
            };

        default:
            return state;
    }
}

// ============================================================================
// CONTEXT
// ============================================================================

interface AppStateContextType {
    state: AppState;
    dispatch: React.Dispatch<AppAction>;

    // Loading actions
    setLoading: (id: string, options?: { message?: string; progress?: number; type?: LoadingState['type'] }) => void;
    clearLoading: (id: string) => void;
    clearAllLoading: () => void;

    // Error actions
    addError: (error: Omit<GlobalError, 'id' | 'timestamp'>) => void;
    clearError: (id: string) => void;
    clearAllErrors: () => void;

    // Notification actions
    addNotification: (notification: Omit<GlobalNotification, 'id' | 'timestamp'>) => void;
    clearNotification: (id: string) => void;
    clearAllNotifications: () => void;

    // Convenience methods
    showSuccess: (message: string, title?: string) => void;
    showError: (message: string, title?: string) => void;
    showWarning: (message: string, title?: string) => void;
    showInfo: (message: string, title?: string) => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

interface AppStateProviderProps {
    children: ReactNode;
}

export function AppStateProvider({ children }: AppStateProviderProps) {
    const [state, dispatch] = useReducer(appStateReducer, initialState);

    // ========================================================================
    // NETWORK MONITORING
    // ========================================================================

    useEffect(() => {
        const updateNetworkStatus = () => {
            dispatch({
                type: 'UPDATE_NETWORK_STATUS',
                payload: {
                    isOnline: navigator.onLine,
                },
            });

            dispatch({
                type: 'SET_OFFLINE',
                payload: !navigator.onLine,
            });
        };

        // Initial check
        updateNetworkStatus();

        // Network event listeners
        window.addEventListener('online', updateNetworkStatus);
        window.addEventListener('offline', updateNetworkStatus);

        // Network Information API (if available)
        if ('connection' in navigator) {
            const connection = (navigator as any).connection;
            const updateConnectionInfo = () => {
                dispatch({
                    type: 'UPDATE_NETWORK_STATUS',
                    payload: {
                        connectionType: connection.type,
                        effectiveType: connection.effectiveType,
                        downlink: connection.downlink,
                        rtt: connection.rtt,
                    },
                });
            };

            updateConnectionInfo();
            connection.addEventListener('change', updateConnectionInfo);

            return () => {
                window.removeEventListener('online', updateNetworkStatus);
                window.removeEventListener('offline', updateNetworkStatus);
                connection.removeEventListener('change', updateConnectionInfo);
            };
        }

        return () => {
            window.removeEventListener('online', updateNetworkStatus);
            window.removeEventListener('offline', updateNetworkStatus);
        };
    }, []);

    // ========================================================================
    // AUTO-DISMISS NOTIFICATIONS
    // ========================================================================

    useEffect(() => {
        const timers: NodeJS.Timeout[] = [];

        state.notifications.forEach(notification => {
            if (notification.duration && notification.duration > 0) {
                const timer = setTimeout(() => {
                    dispatch({ type: 'CLEAR_NOTIFICATION', payload: { id: notification.id } });
                }, notification.duration);
                timers.push(timer);
            }
        });

        return () => {
            timers.forEach(clearTimeout);
        };
    }, [state.notifications]);

    // ========================================================================
    // ACTION CREATORS
    // ========================================================================

    const setLoading = useCallback((id: string, options?: { message?: string; progress?: number; type?: LoadingState['type'] }) => {
        dispatch({
            type: 'SET_LOADING',
            payload: {
                id,
                ...options,
            },
        });
    }, []);

    const clearLoading = useCallback((id: string) => {
        dispatch({ type: 'CLEAR_LOADING', payload: { id } });
    }, []);

    const clearAllLoading = useCallback(() => {
        dispatch({ type: 'CLEAR_ALL_LOADING' });
    }, []);

    const addError = useCallback((error: Omit<GlobalError, 'id' | 'timestamp'>) => {
        dispatch({ type: 'ADD_ERROR', payload: error });
    }, []);

    const clearError = useCallback((id: string) => {
        dispatch({ type: 'CLEAR_ERROR', payload: { id } });
    }, []);

    const clearAllErrors = useCallback(() => {
        dispatch({ type: 'CLEAR_ALL_ERRORS' });
    }, []);

    const addNotification = useCallback((notification: Omit<GlobalNotification, 'id' | 'timestamp'>) => {
        dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
    }, []);

    const clearNotification = useCallback((id: string) => {
        dispatch({ type: 'CLEAR_NOTIFICATION', payload: { id } });
    }, []);

    const clearAllNotifications = useCallback(() => {
        dispatch({ type: 'CLEAR_ALL_NOTIFICATIONS' });
    }, []);

    // Convenience methods
    const showSuccess = useCallback((message: string, title?: string) => {
        addNotification({
            type: 'success',
            title,
            message,
            duration: 5000,
            dismissible: true,
        });
    }, [addNotification]);

    const showError = useCallback((message: string, title?: string) => {
        addNotification({
            type: 'error',
            title,
            message,
            duration: 0, // Don't auto-dismiss errors
            dismissible: true,
        });
    }, [addNotification]);

    const showWarning = useCallback((message: string, title?: string) => {
        addNotification({
            type: 'warning',
            title,
            message,
            duration: 8000,
            dismissible: true,
        });
    }, [addNotification]);

    const showInfo = useCallback((message: string, title?: string) => {
        addNotification({
            type: 'info',
            title,
            message,
            duration: 5000,
            dismissible: true,
        });
    }, [addNotification]);

    const contextValue: AppStateContextType = {
        state,
        dispatch,
        setLoading,
        clearLoading,
        clearAllLoading,
        addError,
        clearError,
        clearAllErrors,
        addNotification,
        clearNotification,
        clearAllNotifications,
        showSuccess,
        showError,
        showWarning,
        showInfo,
    };

    return (
        <AppStateContext.Provider value={contextValue}>
            {children}
        </AppStateContext.Provider>
    );
}

// ============================================================================
// HOOK
// ============================================================================

export function useAppState() {
    const context = useContext(AppStateContext);
    if (context === undefined) {
        throw new Error('useAppState must be used within an AppStateProvider');
    }
    return context;
}

export default AppStateProvider;
