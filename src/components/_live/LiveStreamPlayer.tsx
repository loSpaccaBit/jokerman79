"use client";

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX, AlertCircle, Maximize, Minimize } from 'lucide-react';

interface LiveStreamPlayerProps {
    streamUrl: string;
    title: string;
    poster?: string;
}

export function LiveStreamPlayer({ streamUrl, title, poster }: LiveStreamPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isLoading, setIsLoading] = useState(false); // Changed from true to false
    const [error, setError] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true); // Start muted for autoplay
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [hlsInstance, setHlsInstance] = useState<any>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted || !videoRef.current) return;

        const video = videoRef.current;
        let hls: any = null;

        const loadStream = async () => {
            try {
                // Removed setIsLoading(true) - no initial loading state
                setError(null);

                console.log('🎬 Loading stream:', streamUrl);

                // Test if URL is accessible first
                try {
                    const response = await fetch(streamUrl, {
                        method: 'HEAD',
                        mode: 'cors',
                        cache: 'no-cache'
                    });
                    console.log('🔗 Stream URL test:', response.status, response.statusText);
                } catch (fetchError) {
                    console.warn('⚠️ Stream URL fetch test failed (might be CORS):', fetchError);
                    // Continue anyway, the actual video loading might work
                }

                // First try native HLS support (works on Safari and some mobile browsers)
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    console.log('🎬 Using native HLS support');
                    video.src = streamUrl;
                    video.load();
                    return;
                }

                // For other browsers, try HLS.js
                console.log('🎬 Loading HLS.js for:', streamUrl);
                const HLS = (await import('hls.js')).default;

                if (HLS.isSupported()) {
                    hls = new HLS({
                        enableWorker: false,
                        lowLatencyMode: false,
                        backBufferLength: 90,
                        maxBufferLength: 30,
                        maxMaxBufferLength: 120,
                        liveSyncDurationCount: 3,
                        liveMaxLatencyDurationCount: 5,
                        // CORS and network settings
                        xhrSetup: (xhr: XMLHttpRequest, url: string) => {
                            console.log('🔗 XHR setup for:', url);
                            xhr.withCredentials = false; // Disable credentials for CORS
                        },
                        // Add more tolerance for network issues
                        manifestLoadingTimeOut: 10000,
                        manifestLoadingMaxRetry: 4,
                        levelLoadingTimeOut: 10000,
                        levelLoadingMaxRetry: 4,
                        fragLoadingTimeOut: 20000,
                        fragLoadingMaxRetry: 6,
                    });

                    hls.loadSource(streamUrl);
                    hls.attachMedia(video);

                    hls.on(HLS.Events.MANIFEST_PARSED, async () => {
                        console.log('🎬 HLS manifest parsed successfully');
                        // Auto-start playing when ready
                        try {
                            await video.play();
                            setIsPlaying(true);
                            console.log('🎬 Auto-play started successfully');
                        } catch (err) {
                            console.log('🎬 Auto-play prevented by browser:', err);
                            setIsPlaying(false);
                        }
                    });

                    hls.on(HLS.Events.FRAG_LOADED, () => {
                        console.log('🎬 HLS fragment loaded');
                    });

                    hls.on(HLS.Events.ERROR, (event: any, data: any) => {
                        console.error('🚨 HLS Error details:', {
                            type: data.type,
                            details: data.details,
                            fatal: data.fatal,
                            url: data.url,
                            response: data.response,
                            reason: data.reason
                        });

                        if (data.fatal) {
                            switch (data.type) {
                                case HLS.ErrorTypes.NETWORK_ERROR:
                                    console.error('🚨 Network error - trying fallback');
                                    // Try fallback to native video
                                    hls.destroy();
                                    video.src = streamUrl;
                                    video.load();
                                    setError('Connessione diretta al stream...');
                                    break;
                                case HLS.ErrorTypes.MEDIA_ERROR:
                                    console.error('🚨 Media error - trying to recover');
                                    try {
                                        hls.recoverMediaError();
                                    } catch (err) {
                                        setError('Errore nel formato video');
                                        // Removed setIsLoading(false)
                                    }
                                    break;
                                default:
                                    console.error('🚨 Fatal error, trying fallback');
                                    // Fallback to native video element
                                    hls.destroy();
                                    video.src = streamUrl;
                                    video.load();
                                    setError('Modalità compatibilità attivata...');
                                    break;
                            }
                        }
                    });

                    setHlsInstance(hls);
                } else {
                    console.log('🎬 HLS.js not supported, trying native video');
                    // Fallback to native video
                    video.src = streamUrl;
                    video.load();
                    setError('Caricamento con compatibilità browser...');
                }

                // Video event listeners
                const handleLoadedData = () => {
                    console.log('🎬 Video loaded data');
                    // Removed setIsLoading(false) - no loading state management
                    setError(null);
                };

                const handleCanPlay = async () => {
                    console.log('🎬 Video can play');
                    setError(null);
                    // Auto-start playing when ready (for non-HLS)
                    try {
                        await video.play();
                        setIsPlaying(true);
                        console.log('🎬 Auto-play started successfully (native)');
                    } catch (err) {
                        console.log('🎬 Auto-play prevented by browser (native):', err);
                        setIsPlaying(false);
                    }
                };

                const handleLoadStart = () => {
                    console.log('🎬 Video load start');
                    // Removed setIsLoading(true) - no loading state management
                };

                const handleError = (e: Event) => {
                    console.error('🚨 Video error:', e);
                    const target = e.target as HTMLVideoElement;
                    if (target && target.error) {
                        console.error('🚨 Video error details:', {
                            code: target.error.code,
                            message: target.error.message
                        });

                        // Try one more fallback approach
                        setTimeout(() => {
                            console.log('🔄 Trying stream reload after error...');
                            target.load();
                        }, 2000);
                    }
                    setError('Stream temporaneamente non disponibile');
                };

                video.addEventListener('loadeddata', handleLoadedData);
                video.addEventListener('canplay', handleCanPlay);
                video.addEventListener('loadstart', handleLoadStart);
                video.addEventListener('error', handleError);

                video.addEventListener('play', () => {
                    console.log('🎬 Video started playing');
                    setIsPlaying(true);
                });

                video.addEventListener('pause', () => {
                    console.log('🎬 Video paused');
                    setIsPlaying(false);
                });

                return () => {
                    video.removeEventListener('loadeddata', handleLoadedData);
                    video.removeEventListener('canplay', handleCanPlay);
                    video.removeEventListener('loadstart', handleLoadStart);
                    video.removeEventListener('error', handleError);
                };

            } catch (err) {
                console.error('🚨 Stream loading error:', err);
                setError('Errore nel caricamento dello streaming');
                setIsLoading(false);
            }
        };

        loadStream();

        return () => {
            console.log('🧹 Cleaning up HLS and video styles');
            
            // Clean up video styles when component unmounts
            if (videoRef.current) {
                const video = videoRef.current;
                video.style.position = '';
                video.style.top = '';
                video.style.left = '';
                video.style.width = '';
                video.style.height = '';
                video.style.zIndex = '';
                video.style.backgroundColor = '';
                video.style.objectFit = '';
            }
            
            // Clean up HLS
            if (hls) {
                hls.destroy();
            }
        };
    }, [streamUrl, mounted]);

    const togglePlay = async () => {
        if (!videoRef.current) return;

        console.log('🎬 Toggle play called, current playing:', isPlaying);

        try {
            if (isPlaying) {
                console.log('🎬 Pausing video');
                videoRef.current.pause();
                setIsPlaying(false);
            } else {
                console.log('🎬 Playing video');
                await videoRef.current.play();
                setIsPlaying(true);
            }
        } catch (err) {
            console.error('🚨 Play/pause error:', err);
            setError('Errore nella riproduzione');
        }
    };

    const toggleMute = () => {
        if (!videoRef.current) return;
        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    const toggleFullscreen = async () => {
        if (!videoRef.current) return;

        try {
            const video = videoRef.current;
            
            // Detect mobile devices
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            
            // Check if we're currently in fullscreen
            const isCurrentlyFullscreen = document.fullscreenElement || 
                (document as any).webkitFullscreenElement || 
                (document as any).mozFullScreenElement || 
                (document as any).msFullscreenElement;

            // Check if we're in CSS fullscreen mode
            const isInCSSFullscreen = video.style.position === 'fixed';

            if (!isCurrentlyFullscreen && !isInCSSFullscreen) {
                // Enter fullscreen
                console.log('🎬 Entering fullscreen, mobile:', isMobile);
                
                if (isMobile) {
                    // Mobile-specific fullscreen approach
                    if ((video as any).webkitEnterFullscreen) {
                        // iOS Safari
                        (video as any).webkitEnterFullscreen();
                        setIsFullscreen(true);
                    } else if ((video as any).requestFullscreen) {
                        await (video as any).requestFullscreen();
                        setIsFullscreen(true);
                    } else {
                        // Fallback: CSS fullscreen
                        video.style.position = 'fixed';
                        video.style.top = '0';
                        video.style.left = '0';
                        video.style.width = '100vw';
                        video.style.height = '100vh';
                        video.style.zIndex = '9999';
                        video.style.backgroundColor = 'black';
                        video.style.objectFit = 'contain';
                        setIsFullscreen(true);
                    }
                } else {
                    // Desktop fullscreen
                    if (video.requestFullscreen) {
                        await video.requestFullscreen();
                    } else if ((video as any).webkitRequestFullscreen) {
                        (video as any).webkitRequestFullscreen();
                    } else if ((video as any).mozRequestFullScreen) {
                        (video as any).mozRequestFullScreen();
                    } else if ((video as any).msRequestFullscreen) {
                        (video as any).msRequestFullscreen();
                    }
                }
            } else {
                // Exit fullscreen
                console.log('🎬 Exiting fullscreen, mobile:', isMobile, 'CSS:', isInCSSFullscreen);
                
                // Always clear CSS styles first
                video.style.position = '';
                video.style.top = '';
                video.style.left = '';
                video.style.width = '';
                video.style.height = '';
                video.style.zIndex = '';
                video.style.backgroundColor = '';
                video.style.objectFit = '';
                
                // Then exit native fullscreen if active
                if (isCurrentlyFullscreen) {
                    if (document.exitFullscreen) {
                        await document.exitFullscreen();
                    } else if ((document as any).webkitExitFullscreen) {
                        (document as any).webkitExitFullscreen();
                    } else if ((document as any).mozCancelFullScreen) {
                        (document as any).mozCancelFullScreen();
                    } else if ((document as any).msExitFullscreen) {
                        (document as any).msExitFullscreen();
                    }
                }
                
                setIsFullscreen(false);
            }
        } catch (err) {
            console.error('🚨 Fullscreen error:', err);
            // Fallback: clear all styles and reset state
            if (videoRef.current) {
                const video = videoRef.current;
                video.style.position = '';
                video.style.top = '';
                video.style.left = '';
                video.style.width = '';
                video.style.height = '';
                video.style.zIndex = '';
                video.style.backgroundColor = '';
                video.style.objectFit = '';
            }
            setIsFullscreen(false);
        }
    };

    // Listen for fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            const isCurrentlyFullscreen = !!(document.fullscreenElement || 
                (document as any).webkitFullscreenElement || 
                (document as any).mozFullScreenElement || 
                (document as any).msFullscreenElement);
            
            setIsFullscreen(isCurrentlyFullscreen);
            console.log('🎬 Fullscreen state changed:', isCurrentlyFullscreen);
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            // Exit fullscreen on Escape key
            if (e.key === 'Escape' && isFullscreen && videoRef.current) {
                const video = videoRef.current;
                console.log('🎬 Escape key pressed, clearing fullscreen');
                
                // Clear all CSS styles
                video.style.position = '';
                video.style.top = '';
                video.style.left = '';
                video.style.width = '';
                video.style.height = '';
                video.style.zIndex = '';
                video.style.backgroundColor = '';
                video.style.objectFit = '';
                
                setIsFullscreen(false);
            }
        };

        // Add event listeners for all browsers
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isFullscreen]);

    const retryLoad = () => {
        setError(null);
        setIsLoading(true);
        if (hlsInstance) {
            hlsInstance.startLoad();
        } else {
            // Reload the component
            window.location.reload();
        }
    };

    if (!mounted) {
        return (
            <Card className="w-full">
                <CardContent className="p-0">
                    <div className="w-full aspect-video bg-muted animate-pulse rounded-lg" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full overflow-hidden">
            <CardContent className="p-0">
                <div className="relative group bg-black">
                    <video
                        ref={videoRef}
                        className="w-full aspect-video bg-black cursor-pointer active:opacity-80 select-none transition-all duration-300"
                        poster={poster}
                        playsInline
                        muted={isMuted}
                        controls={false}
                        autoPlay={true}
                        onClick={togglePlay}
                        onTouchStart={(e) => {
                            e.stopPropagation();
                        }}
                        onTouchEnd={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            togglePlay();
                        }}
                    >
                        Il tuo browser non supporta lo streaming video.
                    </video>

                    {/* Error Overlay */}
                    {error && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                            <div className="text-center text-white max-w-sm px-4">
                                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-400" />
                                <p className="text-sm mb-4">{error}</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={retryLoad}
                                    className="bg-white/20 hover:bg-white/30 text-white border-white/20"
                                >
                                    Riprova
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Controls */}
                    {!error && (
                        <div className={`absolute inset-0 transition-opacity duration-300 ${
                            isFullscreen 
                                ? 'opacity-100 z-[10000]' 
                                : 'opacity-100 sm:opacity-0 sm:hover:opacity-100'
                        }`}>
                            {/* Fullscreen exit overlay for mobile */}
                            {isFullscreen && (
                                <div 
                                    className="absolute inset-0 bg-transparent"
                                    onTouchEnd={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        // Double tap to exit fullscreen
                                        toggleFullscreen();
                                    }}
                                />
                            )}
                            
                            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            togglePlay();
                                        }}
                                        onTouchStart={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}
                                        className="bg-black/50 hover:bg-black/70 active:bg-black/80 text-white border-0 touch-manipulation"
                                    >
                                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            toggleMute();
                                        }}
                                        onTouchStart={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}
                                        className="bg-black/50 hover:bg-black/70 active:bg-black/80 text-white border-0 touch-manipulation"
                                    >
                                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            toggleFullscreen();
                                        }}
                                        onTouchStart={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}
                                        className="bg-black/50 hover:bg-black/70 active:bg-black/80 text-white border-0 touch-manipulation"
                                    >
                                        {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                                    </Button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="text-white text-xs bg-black/50 px-2 py-1 rounded">
                                        🔴 LIVE
                                    </div>
                                    {isFullscreen && (
                                        <div className="text-white text-xs bg-blue-500/80 px-2 py-1 rounded animate-pulse">
                                            📱 Tocca per uscire
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Title overlay */}
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
