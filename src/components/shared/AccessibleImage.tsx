"use client"

import Image, { ImageProps } from 'next/image';
import { useState, useId } from 'react';
import { cn } from '@/lib/utils';
import { aria } from '@/lib/accessibility';

interface AccessibleImageProps extends Omit<ImageProps, 'alt'> {
    alt: string;
    decorative?: boolean;
    longDescription?: string;
    caption?: string;
    fallbackText?: string;
    loadingText?: string;
    errorText?: string;
    className?: string;
}

export function AccessibleImage({
    alt,
    decorative = false,
    longDescription,
    caption,
    fallbackText = "Immagine non disponibile",
    loadingText = "Caricamento immagine in corso...",
    errorText = "Errore nel caricamento dell'immagine",
    className,
    ...imageProps
}: AccessibleImageProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Generate unique IDs for ARIA associations using React's useId
    const imageId = useId();
    const descriptionId = longDescription ? `${imageId}-desc` : undefined;
    const captionId = caption ? `${imageId}-caption` : undefined;

    const handleLoad = () => {
        setIsLoading(false);
        setIsVisible(true);
    };

    const handleError = () => {
        setIsLoading(false);
        setHasError(true);
    };

    // Build ARIA attributes
    const ariaProps = {
        id: imageId,
        ...(decorative && aria.hidden(true)),
        ...(descriptionId && aria.describedBy(descriptionId)),
        ...(captionId && aria.labelledBy(captionId)),
    };

    if (hasError) {
        return (
            <div
                className={cn(
                    "flex items-center justify-center bg-muted text-muted-foreground border border-border rounded",
                    "min-h-[200px] p-4",
                    className
                )}
                role="img"
                aria-label={decorative ? undefined : `${errorText}: ${alt}`}
            >
                <div className="text-center">
                    <div className="text-2xl mb-2">🖼️</div>
                    <p className="text-sm">{errorText}</p>
                    {fallbackText && <p className="text-xs mt-1 text-muted-foreground">{fallbackText}</p>}
                </div>
            </div>
        );
    }

    return (
        <figure className={cn("relative", className)}>
            {/* Loading state */}
            {isLoading && (
                <div
                    className="absolute inset-0 flex items-center justify-center bg-muted rounded animate-pulse"
                    aria-label={loadingText}
                    role="status"
                >
                    <div className="text-muted-foreground">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                </div>
            )}

            {/* Main image */}
            <Image
                {...imageProps}
                alt={decorative ? "" : alt}
                onLoad={handleLoad}
                onError={handleError}
                className={cn(
                    "transition-opacity duration-300",
                    isVisible ? "opacity-100" : "opacity-0"
                )}
                {...ariaProps}
            />

            {/* Long description (hidden but accessible) */}
            {longDescription && !decorative && (
                <div id={descriptionId} className="sr-only">
                    {longDescription}
                </div>
            )}

            {/* Visible caption */}
            {caption && !decorative && (
                <figcaption
                    id={captionId}
                    className="mt-2 text-sm text-muted-foreground text-center"
                >
                    {caption}
                </figcaption>
            )}
        </figure>
    );
}

// Component per gallery di immagini accessibili
interface AccessibleImageGalleryProps {
    images: Array<{
        src: string;
        alt: string;
        caption?: string;
        longDescription?: string;
    }>;
    className?: string;
    onImageSelect?: (index: number) => void;
}

export function AccessibleImageGallery({
    images,
    className,
    onImageSelect,
}: AccessibleImageGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
        switch (event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                const prevIndex = index > 0 ? index - 1 : images.length - 1;
                setSelectedIndex(prevIndex);
                onImageSelect?.(prevIndex);
                break;
            case 'ArrowRight':
                event.preventDefault();
                const nextIndex = index < images.length - 1 ? index + 1 : 0;
                setSelectedIndex(nextIndex);
                onImageSelect?.(nextIndex);
                break;
            case 'Home':
                event.preventDefault();
                setSelectedIndex(0);
                onImageSelect?.(0);
                break;
            case 'End':
                event.preventDefault();
                const lastIndex = images.length - 1;
                setSelectedIndex(lastIndex);
                onImageSelect?.(lastIndex);
                break;
        }
    };

    return (
        <div
            className={cn("space-y-4", className)}
            role="region"
            aria-label="Galleria immagini"
        >
            {/* Instructions for screen readers */}
            <div className="sr-only">
                Usa le frecce sinistra e destra per navigare tra le immagini.
                Usa Home e End per andare alla prima o ultima immagine.
            </div>

            {/* Image grid */}
            <div
                role="grid"
                aria-label={`Galleria di ${images.length} immagini`}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            >
                {images.map((image, index) => (
                    <div
                        key={index}
                        role="gridcell"
                        className="relative group"
                    >
                        <button
                            className={cn(
                                "w-full aspect-square overflow-hidden rounded-lg border-2 transition-all",
                                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                                selectedIndex === index
                                    ? "border-primary ring-2 ring-primary/20"
                                    : "border-transparent hover:border-border"
                            )}
                            onClick={() => {
                                setSelectedIndex(index);
                                onImageSelect?.(index);
                            }}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            aria-label={`Immagine ${index + 1} di ${images.length}: ${image.alt}`}
                            aria-current={selectedIndex === index ? "true" : "false"}
                        >
                            <AccessibleImage
                                src={image.src}
                                alt={image.alt}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                            />
                        </button>
                    </div>
                ))}
            </div>

            {/* Selected image details */}
            {images[selectedIndex] && (
                <div
                    role="region"
                    aria-label="Dettagli immagine selezionata"
                    className="mt-4 p-4 border rounded-lg"
                >
                    <h3 className="font-semibold text-lg mb-2">
                        Immagine {selectedIndex + 1} di {images.length}
                    </h3>
                    <p className="text-muted-foreground mb-2">
                        {images[selectedIndex].alt}
                    </p>
                    {images[selectedIndex].caption && (
                        <p className="text-sm">{images[selectedIndex].caption}</p>
                    )}
                    {images[selectedIndex].longDescription && (
                        <details className="mt-2">
                            <summary className="cursor-pointer text-sm font-medium">
                                Descrizione dettagliata
                            </summary>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {images[selectedIndex].longDescription}
                            </p>
                        </details>
                    )}
                </div>
            )}
        </div>
    );
}
