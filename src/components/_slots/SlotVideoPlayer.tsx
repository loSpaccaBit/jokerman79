"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX, Maximize2, Loader2 } from 'lucide-react';

interface SlotVideoPlayerProps {
    videoUrl: string;
    videoUrlMobile?: string;
    title: string;
    poster?: string;
}

export function SlotVideoPlayer({ videoUrl, videoUrlMobile, title, poster }: SlotVideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [mounted, setMounted] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const hideControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setMounted(true);
        // Detect mobile device with more comprehensive checks
        const checkMobile = () => {
            const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            const isSmallScreen = window.innerWidth <= 768;
            const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

            return isTouchDevice || isSmallScreen || isMobileUserAgent;
        };
        setIsMobile(checkMobile());

        // Listen for orientation changes on mobile
        const handleResize = () => {
            setIsMobile(checkMobile());
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('orientationchange', handleResize);
        };
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const video = videoRef.current;
        if (!video) return;

        // Scegli il video appropriato per la piattaforma
        const currentVideoUrl = (isMobile && videoUrlMobile) ? videoUrlMobile : videoUrl;

        // Funzione per caricare HLS.js
        const loadHLS = async () => {
            try {
                // Check if it's mobile Safari or supports native HLS
                const isNativeHLS = video.canPlayType('application/vnd.apple.mpegurl') ||
                    /iPhone|iPad|iPod|Safari/i.test(navigator.userAgent);

                if (isNativeHLS || isMobile) {
                    // Use native HLS support (iOS Safari, macOS Safari) or for mobile devices
                    video.src = currentVideoUrl;
                    video.addEventListener('loadeddata', () => setIsLoading(false));
                    video.addEventListener('loadedmetadata', () => {
                        setDuration(video.duration);
                    });
                    video.addEventListener('timeupdate', () => {
                        setCurrentTime(video.currentTime);
                    });
                    video.addEventListener('error', () => {
                        setError('Errore nel caricamento del video');
                        setIsLoading(false);
                    });
                } else {
                    // Use HLS.js for desktop browsers
                    const HLS = (await import('hls.js')).default;

                    if (HLS.isSupported()) {
                        const hlsConfig: Record<string, unknown> = {
                            enableWorker: true,
                            lowLatencyMode: false, // Disable for better mobile compatibility
                            backBufferLength: 90,
                            maxBufferLength: 30,
                            maxMaxBufferLength: 120,
                        };

                        // Mobile-specific optimizations
                        if (isMobile) {
                            hlsConfig.maxBufferSize = 30 * 1000 * 1000; // 30MB
                            hlsConfig.maxBufferLength = 20; // Shorter buffer for mobile
                            hlsConfig.maxMaxBufferLength = 60;
                            hlsConfig.enableWorker = false; // Disable worker on mobile for better compatibility
                        }

                        const hls = new HLS(hlsConfig);

                        hls.loadSource(currentVideoUrl);
                        hls.attachMedia(video);

                        hls.on(HLS.Events.MANIFEST_PARSED, () => {
                            setIsLoading(false);
                        });

                        hls.on(HLS.Events.ERROR, (event: unknown, data: { fatal?: boolean; type?: string }) => {
                            console.error('HLS Error:', data);
                            if (data.fatal) {
                                switch (data.type) {
                                    case 'networkError':
                                        setError('Errore di connessione. Riprova.');
                                        break;
                                    case 'mediaError':
                                        setError('Errore nel formato video.');
                                        break;
                                    default:
                                        setError('Errore nel caricamento del video');
                                        break;
                                }
                                setIsLoading(false);
                            }
                        });

                        return () => {
                            hls.destroy();
                        };
                    } else {
                        setError('Il tuo browser non supporta lo streaming video');
                        setIsLoading(false);
                    }
                }
            } catch (err) {
                console.error('Errore nel caricamento HLS:', err);
                setError('Errore nel caricamento del video');
                setIsLoading(false);
            }
        };

        loadHLS();
    }, [videoUrl, videoUrlMobile, mounted, isMobile]);

    const togglePlay = async () => {
        const video = videoRef.current;
        if (!video) return;

        try {
            if (isPlaying) {
                video.pause();
                setIsPlaying(false);
            } else {
                // For mobile, we need to handle play differently
                await video.play();
                setIsPlaying(true);
            }
        } catch (error) {
            console.warn('Video play failed:', error);
            // On mobile browsers, play might fail if not user-initiated
            if (isMobile) {
                setError('Tocca il video per riprodurlo');
            }
        }
    };

    const toggleMute = () => {
        const video = videoRef.current;
        if (!video) return;

        video.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    const toggleFullscreen = () => {
        const video = videoRef.current;
        if (!video) return;

        try {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                // On mobile, try different fullscreen methods
                if (isMobile) {
                    if ((video as HTMLVideoElement & { webkitEnterFullscreen?: () => void }).webkitEnterFullscreen) {
                        // iOS Safari
                        (video as HTMLVideoElement & { webkitEnterFullscreen: () => void }).webkitEnterFullscreen();
                    } else if ((video as HTMLVideoElement & { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen) {
                        // Android Chrome
                        (video as HTMLVideoElement & { webkitRequestFullscreen: () => Promise<void> }).webkitRequestFullscreen();
                    } else if (video.requestFullscreen) {
                        video.requestFullscreen();
                    }
                } else {
                    video.requestFullscreen();
                }
            }
        } catch (error) {
            console.warn('Fullscreen failed:', error);
        }
    };

    // Auto-hide controls on mobile
    const resetControlsTimeout = useCallback(() => {
        if (hideControlsTimeoutRef.current) {
            clearTimeout(hideControlsTimeoutRef.current);
        }

        if (isMobile && isPlaying) {
            setShowControls(true);
            hideControlsTimeoutRef.current = setTimeout(() => {
                setShowControls(false);
            }, 3000);
        }
    }, [isMobile, isPlaying]);

    // Handle touch events for mobile
    const handleVideoTouch = () => {
        if (isMobile) {
            if (!showControls) {
                setShowControls(true);
                resetControlsTimeout();
            } else {
                togglePlay();
            }
        }
    };

    const handleVideoLoad = () => {
        setIsLoading(false);
        const video = videoRef.current;
        if (video) {
            setDuration(video.duration);
        }
    };

    const handleVideoError = () => {
        setError('Errore nel caricamento del video');
        setIsLoading(false);
    };

    const handleTimeUpdate = () => {
        const video = videoRef.current;
        if (video) {
            setCurrentTime(video.currentTime);
        }
    };

    const handleVideoClick = () => {
        if (isMobile) {
            handleVideoTouch();
        } else {
            togglePlay();
        }
    };

    // Cleanup timeout on component unmount
    useEffect(() => {
        return () => {
            if (hideControlsTimeoutRef.current) {
                clearTimeout(hideControlsTimeoutRef.current);
            }
        };
    }, []);

    // Handle play/pause state changes
    useEffect(() => {
        if (isMobile && isPlaying) {
            resetControlsTimeout();
        } else if (isMobile && !isPlaying) {
            setShowControls(true);
            if (hideControlsTimeoutRef.current) {
                clearTimeout(hideControlsTimeoutRef.current);
            }
        }
    }, [isPlaying, isMobile, resetControlsTimeout]);

    if (!mounted) {
        return (
            <Card className="w-full">
                <CardContent className="p-0">
                    <div className="w-full aspect-video bg-muted animate-pulse rounded-lg flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="w-full">
                <CardContent className="p-6">
                    <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
                        <div className="text-center">
                            <p className="text-muted-foreground mb-2">⚠️ {error}</p>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setError(null);
                                    setIsLoading(true);
                                }}
                            >
                                Riprova
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full overflow-hidden">
            <CardContent className="p-0">
                <div className="relative group">
                    <video
                        ref={videoRef}
                        className="w-full aspect-video bg-black"
                        poster={poster}
                        onLoadedData={handleVideoLoad}
                        onLoadedMetadata={handleVideoLoad}
                        onTimeUpdate={handleTimeUpdate}
                        onError={handleVideoError}
                        onPlay={() => {
                            setIsPlaying(true);
                            resetControlsTimeout();
                        }}
                        onPause={() => {
                            setIsPlaying(false);
                            setShowControls(true);
                        }}
                        onClick={handleVideoClick}
                        onTouchStart={handleVideoTouch}
                        playsInline
                        controls={false} // Always use custom controls
                        muted={isMuted}
                        preload="metadata"
                        style={{
                            maxHeight: isMobile ? '50vh' : 'auto',
                            touchAction: 'manipulation' // Improve touch responsiveness
                        }}
                        webkit-playsinline="true" // iOS Safari specific
                    >
                        Il tuo browser non supporta la riproduzione video.
                    </video>

                    {/* Loading Overlay */}
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <Loader2 className="h-8 w-8 animate-spin text-white" />
                        </div>
                    )}

                    {/* Controls Overlay - Show on all devices */}
                    {!isLoading && (showControls || !isMobile) && (
                        <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            } transition-opacity duration-300`}>
                            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Button
                                        size={isMobile ? "default" : "sm"}
                                        variant="secondary"
                                        onClick={togglePlay}
                                        className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
                                    >
                                        {isPlaying ? (
                                            <Pause className="h-4 w-4" />
                                        ) : (
                                            <Play className="h-4 w-4" />
                                        )}
                                    </Button>

                                    <Button
                                        size={isMobile ? "default" : "sm"}
                                        variant="secondary"
                                        onClick={toggleMute}
                                        className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
                                    >
                                        {isMuted ? (
                                            <VolumeX className="h-4 w-4" />
                                        ) : (
                                            <Volume2 className="h-4 w-4" />
                                        )}
                                    </Button>

                                    {/* Progress bar for mobile */}
                                    {isMobile && duration > 0 && (
                                        <div className="flex-1 mx-4">
                                            <div className="h-1 bg-white/20 rounded-full">
                                                <div
                                                    className="h-1 bg-white rounded-full"
                                                    style={{ width: `${(currentTime / duration) * 100}%` }}
                                                />
                                            </div>
                                            <div className="text-xs text-white/70 mt-1">
                                                {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')} / {Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <Button
                                    size={isMobile ? "default" : "sm"}
                                    variant="secondary"
                                    onClick={toggleFullscreen}
                                    className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
                                >
                                    <Maximize2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Mobile Play Button Overlay - Show when paused */}
                    {isMobile && !isLoading && !isPlaying && showControls && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Button
                                size="lg"
                                variant="secondary"
                                onClick={togglePlay}
                                className="bg-black/50 hover:bg-black/70 text-white border-0 rounded-full w-16 h-16 backdrop-blur-sm"
                            >
                                <Play className="h-8 w-8" />
                            </Button>
                        </div>
                    )}

                    {/* Title Overlay */}
                    <div className="absolute top-4 left-4 right-4">
                        <h3 className="text-white font-semibold text-lg drop-shadow-lg">
                            {title}
                        </h3>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
