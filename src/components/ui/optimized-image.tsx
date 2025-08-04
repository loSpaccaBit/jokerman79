"use client"

import Image, { type ImageProps } from 'next/image';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
    priority?: boolean;
    fill?: boolean;
    sizes?: string;
    quality?: number;
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
}

// Generate a simple blur placeholder
const generateBlurDataURL = (width: number = 400, height: number = 300) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) return '';

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#f3f4f6');
    gradient.addColorStop(1, '#e5e7eb');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    return canvas.toDataURL();
};

export function OptimizedImage({
    src,
    alt,
    width,
    height,
    className,
    priority = false,
    fill = false,
    sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
    quality = 85,
    placeholder = 'blur',
    blurDataURL,
}: OptimizedImageProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    // Default blur placeholder - generated only on client side after mount
    const defaultBlurDataURL = blurDataURL || (mounted
        ? generateBlurDataURL(width, height)
        : 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkdHw8f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyBkknyBkknyB/9k=');

    if (error) {
        return (
            <div className={cn("flex items-center justify-center bg-muted text-muted-foreground", className)}>
                <span className="text-sm">Immagine non disponibile</span>
            </div>
        );
    }

    const baseProps = {
        src,
        alt,
        quality,
        onLoad: () => setIsLoading(false),
        onError: () => setError(true),
        className: cn(
            "transition-opacity duration-300",
            isLoading && "opacity-0",
            !isLoading && "opacity-100",
            className
        ),
    };

    let imageProps: Partial<ImageProps> & { src: string; alt: string } = { ...baseProps };

    if (fill) {
        imageProps = {
            ...baseProps,
            fill: true,
            sizes,
        };
    } else if (width && height) {
        imageProps = {
            ...baseProps,
            width,
            height,
        };
    }

    if (priority) {
        imageProps.priority = true;
    }

    if (placeholder === 'blur' && defaultBlurDataURL) {
        imageProps.placeholder = 'blur';
        imageProps.blurDataURL = defaultBlurDataURL;
    }

    return (
        <div className="relative">
            {isLoading && (
                <div className={cn(
                    "absolute inset-0 bg-gradient-to-br from-muted/50 to-muted animate-pulse rounded",
                    className
                )} />
            )}
            <Image
                {...imageProps}
                alt={alt} // Assicuriamo che alt sia sempre presente
            />
        </div>
    );
}
