"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, ExternalLink, Loader2, Smartphone, Ratio } from 'lucide-react';
import { useFullscreen } from '@/contexts/FullscreenContext';

interface SlotDemoPlayerProps {
    demoUrl: string;
    slotName: string;
    poster?: string;
    className?: string;
}

/**
 * Componente per mostrare la demo giocabile di una slot tramite iframe
 * Ottimizzato per mobile con aspect ratio adattivo e controlli touch-friendly
 */
export function SlotDemoPlayer({
    demoUrl,
    slotName,
    poster,
    className = ""
}: SlotDemoPlayerProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [showDemo, setShowDemo] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isLandscape, setIsLandscape] = useState(false);
    const { setIsFullscreen } = useFullscreen();

    // Detect mobile and orientation
    useEffect(() => {
        const checkDeviceAndOrientation = () => {
            const isMobileDevice = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            const isLandscapeMode = window.innerWidth > window.innerHeight;

            setIsMobile(isMobileDevice);
            setIsLandscape(isLandscapeMode);

            // Aggiorna lo stato fullscreen nel context
            const shouldBeFullscreen = showDemo && isMobileDevice && isLandscapeMode;
            setIsFullscreen(shouldBeFullscreen);
        };

        checkDeviceAndOrientation();
        window.addEventListener('resize', checkDeviceAndOrientation);
        window.addEventListener('orientationchange', checkDeviceAndOrientation);

        return () => {
            window.removeEventListener('resize', checkDeviceAndOrientation);
            window.removeEventListener('orientationchange', checkDeviceAndOrientation);
            // Reset fullscreen quando il componente viene smontato
            setIsFullscreen(false);
        };
    }, [showDemo, setIsFullscreen]);

    const handlePlayDemo = () => {
        setIsLoading(true);
        setShowDemo(true);
    };

    const handleIframeLoad = () => {
        setIsLoading(false);
    };

    const openInNewTab = () => {
        window.open(demoUrl, '_blank', 'noopener,noreferrer');
    };

    // URL ottimizzato per mobile
    const getOptimizedDemoUrl = () => {
        if (isMobile) {
            // Aggiungi parametri mobile-friendly se l'URL lo supporta
            try {
                const url = new URL(demoUrl);
                url.searchParams.set('mobile', 'true');
                url.searchParams.set('touch', 'true');
                return url.toString();
            } catch {
                // Se l'URL non è valido, restituisci quello originale
                return demoUrl;
            }
        }
        return demoUrl;
    };

    if (showDemo) {
        // Modalità fullscreen su mobile in landscape
        if (isMobile && isLandscape) {
            return (
                <div className="fixed inset-0 z-50 bg-black">
                    {isLoading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                            <div className="text-center text-white">
                                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                                <p className="text-sm">Caricamento...</p>
                            </div>
                        </div>
                    )}

                    <iframe
                        src={getOptimizedDemoUrl()}
                        title={`${slotName} - Demo Giocabile`}
                        className="w-full h-full border-0"
                        onLoad={handleIframeLoad}
                        allow="fullscreen; accelerometer; gyroscope; autoplay"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads allow-presentation"
                        style={{
                            touchAction: 'manipulation',
                            WebkitOverflowScrolling: 'touch'
                        }}
                    />

                    {/* Controlli minimali per fullscreen */}
                    <div className="absolute top-2 right-2 flex gap-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={openInNewTab}
                            className="bg-black/70 hover:bg-black/80 text-white border-0 backdrop-blur-sm"
                        >
                            <ExternalLink className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            );
        }

        return (
            <Card className={`w-full overflow-hidden ${className}`}>
                <CardContent className="p-0">
                    {/* Aspect ratio adattivo */}
                    <div className={`relative bg-black ${isMobile ? 'aspect-[4/3]' : 'aspect-video'}`}>
                        {isLoading && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                                <div className="text-center text-white">
                                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                                    <p className="text-sm">{isMobile ? 'Caricamento...' : 'Caricamento demo...'}</p>
                                </div>
                            </div>
                        )}

                        <iframe
                            src={getOptimizedDemoUrl()}
                            title={`${slotName} - Demo Giocabile`}
                            className="w-full h-full border-0"
                            onLoad={handleIframeLoad}
                            allow="fullscreen; accelerometer; gyroscope; autoplay"
                            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads allow-presentation"
                            style={{
                                touchAction: 'manipulation',
                                WebkitOverflowScrolling: 'touch'
                            }}
                        />

                        {/* Controlli ottimizzati per mobile */}
                        <div className={`absolute ${isMobile ? 'top-2 right-2' : 'top-4 right-4'} flex gap-2`}>
                            <Button
                                variant="secondary"
                                size={isMobile ? "default" : "sm"}
                                onClick={openInNewTab}
                                className="bg-black/70 hover:bg-black/80 text-white border-0 backdrop-blur-sm"
                            >
                                <ExternalLink className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'} ${isMobile ? '' : 'mr-2'}`} />
                                {!isMobile && 'Apri in nuova finestra'}
                            </Button>

                            {/* Indicatore mobile */}
                            {isMobile && !isLandscape && (
                                <div className="bg-black/70 backdrop-blur-sm rounded-md px-2 py-1 flex items-center">
                                    <Smartphone className="h-4 w-4 text-white" />
                                </div>
                            )}
                        </div>

                        {/* Hint per mobile - solo in portrait */}
                        {isMobile && !isLandscape && (
                            <div className="absolute bottom-2 left-2 right-2">
                                <div className="bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-md text-center">
                                    <Ratio /> Ruota il dispositivo per modalità fullscreen
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={`w-full overflow-hidden cursor-pointer ${className}`}>
            <CardContent className="p-0">
                <div
                    className={`relative bg-muted group ${isMobile ? 'aspect-[4/3]' : 'aspect-video'}`}
                    onClick={handlePlayDemo}
                >
                    {/* Immagine poster se disponibile */}
                    {poster && (
                        <Image
                            src={poster}
                            alt={`${slotName} - Anteprima`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    )}

                    {/* Overlay con pulsante play ottimizzato per mobile */}
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 group-active:bg-black/60 transition-colors flex items-center justify-center">
                        <div className="text-center text-white">
                            <div className="mb-4">
                                <div className={`mx-auto bg-white/20 hover:bg-white/30 active:bg-white/40 transition-colors rounded-full flex items-center justify-center mb-4 group-hover:scale-110 group-active:scale-105 transform duration-200 ${isMobile ? 'w-24 h-24' : 'w-20 h-20'
                                    }`}>
                                    <Play className={`ml-1 ${isMobile ? 'w-12 h-12' : 'w-10 h-10'}`} fill="currentColor" />
                                </div>
                            </div>
                            <h3 className={`font-semibold mb-2 ${isMobile ? 'text-lg' : 'text-xl'}`}>{slotName}</h3>
                            <p className={`text-white/80 ${isMobile ? 'text-sm' : 'text-base'}`}>
                                {isMobile ? 'Tocca per giocare' : 'Clicca per giocare la demo'}
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
