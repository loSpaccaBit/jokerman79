// Optimized Lazy Loading Image Component
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, ImageOff } from 'lucide-react';

interface OptimizedLazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  fallbackSrc?: string;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  intersectionOptions?: IntersectionObserverInit;
  preload?: boolean;
  lazy?: boolean;
}

/**
 * Optimized lazy loading image component with advanced features:
 * - Intersection Observer for lazy loading
 * - Fallback image support
 * - Custom loading and error states
 * - WebP/AVIF format optimization
 * - Blur placeholder support
 * - Memory leak prevention
 */
export const OptimizedLazyImage: React.FC<OptimizedLazyImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  fill = false,
  sizes,
  priority = false,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError,
  fallbackSrc,
  loadingComponent,
  errorComponent,
  intersectionOptions = {
    rootMargin: '50px',
    threshold: 0.1
  },
  preload = false,
  lazy = true
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(!lazy || priority || preload);
  const [currentSrc, setCurrentSrc] = useState(src);
  
  const imgRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || priority || shouldLoad) return;

    const element = imgRef.current;
    if (!element) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observerRef.current?.unobserve(element);
          }
        });
      },
      intersectionOptions
    );

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current && element) {
        observerRef.current.unobserve(element);
      }
    };
  }, [lazy, priority, shouldLoad, intersectionOptions]);

  // Handle load success
  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  }, [onLoad]);

  // Handle load error with fallback
  const handleError = useCallback((error?: Error) => {
    console.error('Image load error:', error || 'Unknown error');
    
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      console.log('🔄 Trying fallback image:', fallbackSrc);
      setCurrentSrc(fallbackSrc);
      setHasError(false);
      return;
    }

    setIsLoading(false);
    setHasError(true);
    onError?.(error || new Error('Image failed to load'));
  }, [fallbackSrc, currentSrc, onError]);

  // Reset state when src changes
  useEffect(() => {
    if (src !== currentSrc) {
      setCurrentSrc(src);
      setIsLoading(true);
      setHasError(false);
    }
  }, [src, currentSrc]);

  // Preload image
  useEffect(() => {
    if (preload && src) {
      const img = new window.Image();
      img.src = src;
      img.onload = () => console.log(`📸 Preloaded image: ${src}`);
      img.onerror = () => console.warn(`⚠️ Failed to preload image: ${src}`);
    }
  }, [preload, src]);

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Default loading component
  const defaultLoadingComponent = (
    <div className={cn(
      "flex items-center justify-center bg-muted",
      fill ? "absolute inset-0" : "",
      className
    )}>
      <Skeleton className={cn(
        fill ? "w-full h-full" : `w-[${width}px] h-[${height}px]`
      )} />
    </div>
  );

  // Default error component
  const defaultErrorComponent = (
    <div className={cn(
      "flex flex-col items-center justify-center bg-muted text-muted-foreground p-4",
      fill ? "absolute inset-0" : "",
      className
    )}>
      <ImageOff className="h-8 w-8 mb-2" />
      <p className="text-sm text-center">Immagine non disponibile</p>
    </div>
  );

  // Show loading state
  if (!shouldLoad) {
    return (
      <div 
        ref={imgRef} 
        className={cn(
          "bg-muted",
          fill ? "relative" : "",
          className
        )}
        style={!fill ? { width, height } : undefined}
      >
        {loadingComponent || defaultLoadingComponent}
      </div>
    );
  }

  // Show error state
  if (hasError) {
    return errorComponent || defaultErrorComponent;
  }

  // Show loading state while image loads
  if (isLoading) {
    return (
      <div className={cn(fill ? "relative" : "", className)}>
        {loadingComponent || defaultLoadingComponent}
        {/* Hidden image for loading */}
        <div className="sr-only">
          <Image
            src={currentSrc}
            alt={alt}
            width={width}
            height={height}
            fill={fill}
            sizes={sizes}
            priority={priority}
            quality={quality}
            placeholder={placeholder}
            blurDataURL={blurDataURL}
            onLoad={handleLoad}
            onError={() => handleError()}
          />
        </div>
      </div>
    );
  }

  // Show loaded image
  return (
    <div ref={imgRef} className={cn(fill ? "relative" : "", className)}>
      <Image
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        sizes={sizes}
        priority={priority}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        onLoad={handleLoad}
        onError={() => handleError()}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
      />
    </div>
  );
};

/**
 * Optimized avatar image with automatic blur placeholder
 */
interface OptimizedAvatarProps {
  src?: string;
  name: string;
  size?: number;
  className?: string;
  fallbackColor?: string;
}

export const OptimizedAvatar: React.FC<OptimizedAvatarProps> = ({
  src,
  name,
  size = 40,
  className,
  fallbackColor = 'bg-primary'
}) => {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (!src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-full text-primary-foreground font-medium",
          fallbackColor,
          className
        )}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {initials}
      </div>
    );
  }

  return (
    <OptimizedLazyImage
      src={src}
      alt={`Avatar di ${name}`}
      width={size}
      height={size}
      className={cn("rounded-full", className)}
      quality={80}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyepckuNg2si1/1YkiHhBAAEAKA=="
      errorComponent={
        <div
          className={cn(
            "flex items-center justify-center rounded-full text-primary-foreground font-medium",
            fallbackColor,
            className
          )}
          style={{ width: size, height: size, fontSize: size * 0.4 }}
        >
          {initials}
        </div>
      }
    />
  );
};

/**
 * Optimized slot/game image with gaming-specific optimizations
 */
interface OptimizedGameImageProps {
  src: string;
  alt: string;
  title?: string;
  provider?: string;
  width?: number;
  height?: number;
  className?: string;
  showOverlay?: boolean;
  overlayContent?: React.ReactNode;
}

export const OptimizedGameImage: React.FC<OptimizedGameImageProps> = ({
  src,
  alt,
  title,
  provider,
  width = 300,
  height = 200,
  className,
  showOverlay = false,
  overlayContent
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={cn("relative group", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <OptimizedLazyImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="rounded-lg transition-transform duration-300 group-hover:scale-105"
        quality={85}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyepckuNg2si1/1YkiHhBAAEAKA="
        fallbackSrc="/assets/slot_avatar.png"
      />
      
      {showOverlay && (
        <div className={cn(
          "absolute inset-0 bg-black/50 rounded-lg transition-opacity duration-300 flex items-center justify-center",
          isHovered ? "opacity-100" : "opacity-0"
        )}>
          {overlayContent || (
            <div className="text-white text-center p-4">
              {title && <h3 className="font-semibold mb-1">{title}</h3>}
              {provider && <p className="text-sm opacity-90">{provider}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Bulk image preloader
 */
export const preloadImages = (urls: string[], priority: string[] = []) => {
  console.log(`🚀 Preloading ${urls.length} images...`);
  
  // Preload priority images immediately
  priority.forEach(url => {
    const img = new window.Image();
    img.src = url;
  });

  // Preload other images with delay to avoid blocking
  urls.filter(url => !priority.includes(url)).forEach((url, index) => {
    setTimeout(() => {
      const img = new window.Image();
      img.src = url;
    }, index * 100); // Stagger loading
  });
};

export default OptimizedLazyImage;