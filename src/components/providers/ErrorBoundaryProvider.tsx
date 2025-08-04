"use client";

import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
    errorId: string;
}

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: React.ComponentType<ErrorFallbackProps>;
    onError?: (error: Error, errorInfo: React.ErrorInfo, errorId: string) => void;
    resetOnPropsChange?: boolean;
    resetKeys?: Array<string | number>;
}

interface ErrorFallbackProps {
    error: Error | null;
    errorId: string;
    resetError: () => void;
    onReport?: () => void;
}

/**
 * Componente Error Boundary per catturare errori React non gestiti
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    private resetTimeoutId: number | null = null;

    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: '',
        };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        return {
            hasError: true,
            error,
            errorId,
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        const errorId = this.state.errorId;

        // Log error to console in development
        if (process.env.NODE_ENV === 'development') {
            console.group(`🚨 React Error Boundary - ${errorId}`);
            console.error('Error:', error);
            console.error('Error Info:', errorInfo);
            console.error('Component Stack:', errorInfo.componentStack);
            console.groupEnd();
        }

        // Update state with error info
        this.setState({
            errorInfo,
        });

        // Call custom error handler
        this.props.onError?.(error, errorInfo, errorId);

        // Log to external service (esempio: Sentry)
        this.logErrorToService(error, errorInfo, errorId);
    }

    componentDidUpdate(prevProps: ErrorBoundaryProps) {
        const { resetOnPropsChange, resetKeys } = this.props;
        const { hasError } = this.state;

        // Reset error if props changed and resetOnPropsChange is true
        if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
            this.resetError();
        }

        // Reset error if resetKeys changed
        if (hasError && resetKeys && prevProps.resetKeys) {
            const hasResetKeyChanged = resetKeys.some(
                (key, index) => key !== prevProps.resetKeys?.[index]
            );
            if (hasResetKeyChanged) {
                this.resetError();
            }
        }
    }

    componentWillUnmount() {
        if (this.resetTimeoutId) {
            window.clearTimeout(this.resetTimeoutId);
        }
    }

    private logErrorToService = (error: Error, errorInfo: React.ErrorInfo, errorId: string) => {
        // Qui puoi integrare servizi come Sentry, LogRocket, etc.
        const errorData = {
            errorId,
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
        };

        // In development, just log to console
        if (process.env.NODE_ENV === 'development') {
            console.log('📊 Error logged:', errorData);
        }

        // In production, send to error tracking service
        // Example: Sentry.captureException(error, { contexts: { errorBoundary: errorData } });
    };

    private resetError = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: '',
        });
    };

    private handleRetry = () => {
        this.resetError();
    };

    private handleReportBug = () => {
        const { error, errorId } = this.state;

        // Crea una URL per il report del bug (esempio: GitHub Issues, Jira, etc.)
        const bugReportUrl = `mailto:support@jokerman79.com?subject=Bug Report ${errorId}&body=${encodeURIComponent(
            `Error ID: ${errorId}\n` +
            `Error: ${error?.message}\n` +
            `URL: ${window.location.href}\n` +
            `Timestamp: ${new Date().toISOString()}\n` +
            `User Agent: ${navigator.userAgent}\n\n` +
            `Please describe what you were doing when this error occurred:`
        )}`;

        window.open(bugReportUrl, '_blank');
    };

    render() {
        const { hasError, error, errorId } = this.state;
        const { children, fallback: FallbackComponent } = this.props;

        if (hasError) {
            // Use custom fallback component if provided
            if (FallbackComponent) {
                return (
                    <FallbackComponent
                        error={error}
                        errorId={errorId}
                        resetError={this.resetError}
                        onReport={this.handleReportBug}
                    />
                );
            }

            // Default fallback UI
            return (
                <DefaultErrorFallback
                    error={error}
                    errorId={errorId}
                    resetError={this.handleRetry}
                    onReport={this.handleReportBug}
                />
            );
        }

        return children;
    }
}

/**
 * Componente fallback di default per errori
 */
function DefaultErrorFallback({ error, errorId, resetError, onReport }: ErrorFallbackProps) {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                        <AlertTriangle className="h-6 w-6 text-destructive" />
                    </div>
                    <CardTitle className="text-xl font-semibold">
                        Oops! Qualcosa è andato storto
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-center text-sm text-muted-foreground">
                        <p>Si è verificato un errore imprevisto. Il nostro team è stato notificato.</p>
                        {process.env.NODE_ENV === 'development' && (
                            <>
                                <p className="mt-2 font-mono text-xs bg-muted p-2 rounded">
                                    {error?.message}
                                </p>
                                <p className="text-xs opacity-70">ID: {errorId}</p>
                            </>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <Button onClick={resetError} className="w-full">
                            <RefreshCw className="mr-2 h-4 w-4" />
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
                                className="w-full text-xs"
                            >
                                <Bug className="mr-2 h-3 w-3" />
                                Segnala il problema
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

/**
 * Hook per utilizzare Error Boundary in modo programmatico
 */
export function useErrorHandler() {
    return React.useCallback((error: Error, errorInfo?: any) => {
        // In development, log to console
        if (process.env.NODE_ENV === 'development') {
            console.error('🚨 Programmatic Error:', error);
            if (errorInfo) {
                console.error('Additional Info:', errorInfo);
            }
        }

        // Trigger error boundary by throwing
        throw error;
    }, []);
}

/**
 * Provider wrapper per Error Boundary con configurazione predefinita
 */
interface ErrorBoundaryProviderProps {
    children: ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo, errorId: string) => void;
}

export function ErrorBoundaryProvider({ children, onError }: ErrorBoundaryProviderProps) {
    const handleError = React.useCallback((error: Error, errorInfo: React.ErrorInfo, errorId: string) => {
        // Custom error handling
        onError?.(error, errorInfo, errorId);

        // Additional global error handling logic here
        // Example: send to analytics, show toast notification, etc.
    }, [onError]);

    return (
        <ErrorBoundary
            onError={handleError}
            resetOnPropsChange={true}
        >
            {children}
        </ErrorBoundary>
    );
}

export default ErrorBoundary;
