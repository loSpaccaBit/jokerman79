"use client";

import React from 'react';
import { Loader2, Wifi, WifiOff } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { useGlobalLoading, useNetworkStatus } from '@/hooks/useAppState';
import { cn } from '@/lib/utils';

// ============================================================================
// GLOBAL LOADING OVERLAY
// ============================================================================

interface GlobalLoadingOverlayProps {
    className?: string;
}

export function GlobalLoadingOverlay({ className }: GlobalLoadingOverlayProps) {
    const { isGlobalLoading, loadingStates } = useGlobalLoading();

    // Trova il loading state globale attivo
    const globalLoadingState = loadingStates.find(state => state.type === 'global');

    if (!isGlobalLoading || !globalLoadingState) {
        return null;
    }

    return (
        <div className={cn(
            "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm",
            className
        )}>
            <Card className="w-full max-w-sm mx-4">
                <CardContent className="p-6">
                    <div className="flex flex-col items-center space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />

                        {globalLoadingState.message && (
                            <p className="text-sm text-center text-muted-foreground">
                                {globalLoadingState.message}
                            </p>
                        )}

                        {globalLoadingState.progress !== undefined && (
                            <div className="w-full space-y-2">
                                <Progress value={globalLoadingState.progress} className="w-full" />
                                <p className="text-xs text-center text-muted-foreground">
                                    {Math.round(globalLoadingState.progress)}%
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// ============================================================================
// INLINE SPINNER
// ============================================================================

interface InlineSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    message?: string;
    className?: string;
}

export function InlineSpinner({ size = 'md', message, className }: InlineSpinnerProps) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
    };

    return (
        <div className={cn("flex items-center space-x-2", className)}>
            <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
            {message && (
                <span className="text-sm text-muted-foreground">{message}</span>
            )}
        </div>
    );
}

// ============================================================================
// SKELETON LOADER
// ============================================================================

interface SkeletonLoaderProps {
    variant?: 'card' | 'list' | 'text' | 'avatar' | 'custom';
    lines?: number;
    className?: string;
    children?: React.ReactNode;
}

export function SkeletonLoader({
    variant = 'card',
    lines = 3,
    className,
    children
}: SkeletonLoaderProps) {
    if (children) {
        return <div className={cn("animate-pulse", className)}>{children}</div>;
    }

    const renderSkeleton = () => {
        switch (variant) {
            case 'card':
                return (
                    <Card className={className}>
                        <CardContent className="p-6 space-y-4">
                            <div className="h-4 bg-muted rounded w-3/4" />
                            <div className="space-y-2">
                                {Array.from({ length: lines }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "h-3 bg-muted rounded",
                                            i === lines - 1 ? "w-1/2" : "w-full"
                                        )}
                                    />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                );

            case 'list':
                return (
                    <div className={cn("space-y-3", className)}>
                        {Array.from({ length: lines }).map((_, i) => (
                            <div key={i} className="flex items-center space-x-3">
                                <div className="h-10 w-10 bg-muted rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 bg-muted rounded w-3/4" />
                                    <div className="h-3 bg-muted rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                );

            case 'text':
                return (
                    <div className={cn("space-y-2", className)}>
                        {Array.from({ length: lines }).map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "h-4 bg-muted rounded",
                                    i === lines - 1 ? "w-2/3" : "w-full"
                                )}
                            />
                        ))}
                    </div>
                );

            case 'avatar':
                return (
                    <div className={cn("flex items-center space-x-3", className)}>
                        <div className="h-10 w-10 bg-muted rounded-full" />
                        <div className="space-y-2">
                            <div className="h-4 bg-muted rounded w-20" />
                            <div className="h-3 bg-muted rounded w-16" />
                        </div>
                    </div>
                );

            default:
                return (
                    <div className={cn("h-4 bg-muted rounded", className)} />
                );
        }
    };

    return (
        <div className="animate-pulse">
            {renderSkeleton()}
        </div>
    );
}

// ============================================================================
// PROGRESS INDICATOR
// ============================================================================

interface ProgressIndicatorProps {
    value?: number;
    message?: string;
    showPercentage?: boolean;
    className?: string;
}

export function ProgressIndicator({
    value,
    message,
    showPercentage = true,
    className
}: ProgressIndicatorProps) {
    return (
        <div className={cn("space-y-2", className)}>
            {message && (
                <p className="text-sm text-muted-foreground">{message}</p>
            )}

            <div className="flex items-center space-x-3">
                <Progress value={value} className="flex-1" />

                {showPercentage && value !== undefined && (
                    <span className="text-sm text-muted-foreground min-w-[3rem] text-right">
                        {Math.round(value)}%
                    </span>
                )}
            </div>
        </div>
    );
}

// ============================================================================
// NETWORK STATUS INDICATOR
// ============================================================================

interface NetworkStatusIndicatorProps {
    showText?: boolean;
    className?: string;
}

export function NetworkStatusIndicator({ showText = false, className }: NetworkStatusIndicatorProps) {
    const { isOnline, quality, effectiveType } = useNetworkStatus();

    const getStatusColor = () => {
        if (!isOnline) return 'text-destructive';

        switch (quality) {
            case 'excellent': return 'text-green-500';
            case 'good': return 'text-blue-500';
            case 'fair': return 'text-yellow-500';
            case 'poor': return 'text-orange-500';
            default: return 'text-muted-foreground';
        }
    };

    const getStatusText = () => {
        if (!isOnline) return 'Offline';
        return `Online (${effectiveType || 'Unknown'})`;
    };

    return (
        <div className={cn("flex items-center space-x-2", className)}>
            {isOnline ? (
                <Wifi className={cn("h-4 w-4", getStatusColor())} />
            ) : (
                <WifiOff className={cn("h-4 w-4", getStatusColor())} />
            )}

            {showText && (
                <span className={cn("text-xs", getStatusColor())}>
                    {getStatusText()}
                </span>
            )}
        </div>
    );
}

// ============================================================================
// LAZY LOADING PLACEHOLDER
// ============================================================================

interface LazyLoadingPlaceholderProps {
    height?: number;
    width?: number;
    className?: string;
    children?: React.ReactNode;
}

export function LazyLoadingPlaceholder({
    height = 200,
    width,
    className,
    children
}: LazyLoadingPlaceholderProps) {
    return (
        <div
            className={cn(
                "flex items-center justify-center bg-muted rounded-lg border-2 border-dashed border-muted-foreground/25",
                className
            )}
            style={{
                height: `${height}px`,
                width: width ? `${width}px` : undefined
            }}
        >
            {children || (
                <div className="text-center space-y-2">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">Caricamento...</p>
                </div>
            )}
        </div>
    );
}

// ============================================================================
// LOADING DOTS
// ============================================================================

interface LoadingDotsProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function LoadingDots({ size = 'md', className }: LoadingDotsProps) {
    const sizeClasses = {
        sm: 'w-1 h-1',
        md: 'w-2 h-2',
        lg: 'w-3 h-3',
    };

    return (
        <div className={cn("flex space-x-1", className)}>
            {[0, 1, 2].map((i) => (
                <div
                    key={i}
                    className={cn(
                        "bg-primary rounded-full animate-pulse",
                        sizeClasses[size]
                    )}
                    style={{
                        animationDelay: `${i * 0.2}s`,
                        animationDuration: '1.4s',
                    }}
                />
            ))}
        </div>
    );
}

export default {
    GlobalLoadingOverlay,
    InlineSpinner,
    SkeletonLoader,
    ProgressIndicator,
    NetworkStatusIndicator,
    LazyLoadingPlaceholder,
    LoadingDots,
};
