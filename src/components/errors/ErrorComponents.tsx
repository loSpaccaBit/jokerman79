"use client";

import React from 'react';
import { X, AlertTriangle, CheckCircle, Info, AlertCircle, RotateCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useErrorHandler, useNotifications, useNetworkStatus } from '@/hooks/useAppState';
import { cn } from '@/lib/utils';
import type { GlobalError, GlobalNotification } from '@/contexts/AppStateContext';

// ============================================================================
// ERROR NOTIFICATION
// ============================================================================

interface ErrorNotificationProps {
    error: GlobalError;
    onDismiss?: (id: string) => void;
    className?: string;
}

export function ErrorNotification({ error, onDismiss, className }: ErrorNotificationProps) {
    const getIcon = () => {
        switch (error.type) {
            case 'error':
                return <AlertTriangle className="h-4 w-4" />;
            case 'warning':
                return <AlertCircle className="h-4 w-4" />;
            case 'info':
                return <Info className="h-4 w-4" />;
            default:
                return <AlertTriangle className="h-4 w-4" />;
        }
    };

    const getVariant = (): "default" | "destructive" => {
        return error.type === 'error' ? 'destructive' : 'default';
    };

    return (
        <Alert variant={getVariant()} className={cn("relative", className)}>
            {getIcon()}
            <AlertTitle className="flex items-center justify-between">
                <span>
                    {error.type === 'error' && 'Errore'}
                    {error.type === 'warning' && 'Attenzione'}
                    {error.type === 'info' && 'Informazione'}
                </span>

                {error.dismissible && onDismiss && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-transparent"
                        onClick={() => onDismiss(error.id)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </AlertTitle>

            <AlertDescription className="mt-2">
                {error.message}

                {error.action && (
                    <div className="mt-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={error.action.handler}
                        >
                            {error.action.label}
                        </Button>
                    </div>
                )}
            </AlertDescription>
        </Alert>
    );
}

// ============================================================================
// GLOBAL ERROR BANNER
// ============================================================================

export function GlobalErrorBanner() {
    const { errors, clearError } = useErrorHandler();

    if (errors.length === 0) {
        return null;
    }

    return (
        <div className="fixed top-0 left-0 right-0 z-50 space-y-2 p-4">
            {errors.map((error) => (
                <ErrorNotification
                    key={error.id}
                    error={error}
                    onDismiss={clearError}
                />
            ))}
        </div>
    );
}

// ============================================================================
// ERROR BOUNDARY FALLBACK
// ============================================================================

interface ErrorBoundaryFallbackProps {
    error: Error | null;
    errorId: string;
    resetError: () => void;
    onReport?: () => void;
    variant?: 'page' | 'component';
}

export function ErrorBoundaryFallback({
    error,
    errorId,
    resetError,
    onReport,
    variant = 'page'
}: ErrorBoundaryFallbackProps) {
    if (variant === 'component') {
        return (
            <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <h3 className="text-sm font-medium text-destructive">
                        Errore nel componente
                    </h3>
                </div>

                <p className="text-sm text-muted-foreground mb-3">
                    Si è verificato un errore in questa sezione.
                </p>

                <div className="flex space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={resetError}
                    >
                        <RotateCcw className="mr-2 h-3 w-3" />
                        Riprova
                    </Button>

                    {onReport && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onReport}
                        >
                            Segnala
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                        <AlertTriangle className="h-6 w-6 text-destructive" />
                    </div>
                    <CardTitle>Qualcosa è andato storto</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="text-center text-sm text-muted-foreground">
                        <p>Si è verificato un errore imprevisto. Il nostro team è stato notificato.</p>

                        {process.env.NODE_ENV === 'development' && error && (
                            <>
                                <div className="mt-3 p-2 bg-muted rounded text-xs font-mono text-left">
                                    {error.message}
                                </div>
                                <p className="text-xs opacity-70 mt-2">ID: {errorId}</p>
                            </>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <Button onClick={resetError} className="w-full">
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Riprova
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => window.location.href = '/'}
                            className="w-full"
                        >
                            <Home className="mr-2 h-4 w-4" />
                            Torna alla Home
                        </Button>

                        {onReport && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onReport}
                                className="w-full"
                            >
                                Segnala il problema
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// ============================================================================
// NETWORK ERROR BANNER
// ============================================================================

export function NetworkErrorBanner() {
    const { isOffline } = useNetworkStatus();

    if (!isOffline) {
        return null;
    }

    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground p-2">
            <div className="container mx-auto flex items-center justify-center space-x-2 text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>Connessione internet assente. Alcune funzionalità potrebbero non essere disponibili.</span>
            </div>
        </div>
    );
}

// ============================================================================
// NOTIFICATION TOAST
// ============================================================================

interface NotificationToastProps {
    notification: GlobalNotification;
    onDismiss?: (id: string) => void;
    className?: string;
}

export function NotificationToast({ notification, onDismiss, className }: NotificationToastProps) {
    const getIcon = () => {
        switch (notification.type) {
            case 'success':
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'error':
                return <AlertTriangle className="h-4 w-4 text-red-600" />;
            case 'warning':
                return <AlertCircle className="h-4 w-4 text-yellow-600" />;
            case 'info':
                return <Info className="h-4 w-4 text-blue-600" />;
        }
    };

    const getBorderColor = () => {
        switch (notification.type) {
            case 'success':
                return 'border-l-green-500';
            case 'error':
                return 'border-l-red-500';
            case 'warning':
                return 'border-l-yellow-500';
            case 'info':
                return 'border-l-blue-500';
        }
    };

    return (
        <Card className={cn(
            "w-full max-w-sm border-l-4 shadow-lg",
            getBorderColor(),
            className
        )}>
            <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                        {getIcon()}
                    </div>

                    <div className="flex-1 min-w-0">
                        {notification.title && (
                            <h4 className="text-sm font-medium text-foreground mb-1">
                                {notification.title}
                            </h4>
                        )}

                        <p className="text-sm text-muted-foreground">
                            {notification.message}
                        </p>

                        {notification.action && (
                            <div className="mt-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={notification.action.handler}
                                >
                                    {notification.action.label}
                                </Button>
                            </div>
                        )}
                    </div>

                    {notification.dismissible && onDismiss && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-transparent flex-shrink-0"
                            onClick={() => onDismiss(notification.id)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

// ============================================================================
// NOTIFICATION CONTAINER
// ============================================================================

export function NotificationContainer() {
    const { notifications, clearNotification } = useNotifications();

    if (notifications.length === 0) {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
            {notifications.map((notification) => (
                <NotificationToast
                    key={notification.id}
                    notification={notification}
                    onDismiss={clearNotification}
                />
            ))}
        </div>
    );
}

export default {
    ErrorNotification,
    GlobalErrorBanner,
    ErrorBoundaryFallback,
    NetworkErrorBanner,
    NotificationToast,
    NotificationContainer,
};
