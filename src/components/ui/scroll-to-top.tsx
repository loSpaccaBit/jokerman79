"use client"

import { useState, useEffect } from "react"
import { ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface ScrollToTopProps {
    showAfter?: number
    smooth?: boolean
    className?: string
}

export function ScrollToTop({
    showAfter = 400,
    smooth = true,
    className
}: ScrollToTopProps) {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const toggleVisibility = () => {
            const scrolled = window.scrollY || window.pageYOffset || document.documentElement.scrollTop
            setIsVisible(scrolled > showAfter)
        }

        toggleVisibility()
        window.addEventListener("scroll", toggleVisibility, { passive: true })

        return () => window.removeEventListener("scroll", toggleVisibility)
    }, [showAfter])

    const scrollToTop = () => {
        if (smooth) {
            // Controlla se il browser supporta smooth scroll
            if ('scrollBehavior' in document.documentElement.style) {
                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                })
            } else {
                // Fallback animato per browser che non supportano smooth scroll
                const start = window.pageYOffset
                const startTime = performance.now()
                const duration = 800 // Durata in millisecondi

                const animateScroll = (currentTime: number) => {
                    const timeElapsed = currentTime - startTime
                    const progress = Math.min(timeElapsed / duration, 1)

                    // Easing function per movimento fluido
                    const ease = 1 - Math.pow(1 - progress, 3)

                    window.scrollTo(0, start * (1 - ease))

                    if (progress < 1) {
                        requestAnimationFrame(animateScroll)
                    }
                }

                requestAnimationFrame(animateScroll)
            }
        } else {
            window.scrollTo(0, 0)
        }
    }

    if (!isVisible) return null

    return (
        <button
            onClick={scrollToTop}
            className={cn(
                // Posizionamento fisso - responsive per mobile
                "fixed z-50",
                "bottom-32 right-2 md:bottom-6 md:right-6", // Più in alto e sul lato per mobile
                // Styling minimal e pulito
                "w-10 h-10 rounded-full",
                "bg-background/80 backdrop-blur-sm",
                "border-2 border-primary/60 hover:border-primary", // Bordo primario
                "text-muted-foreground hover:text-foreground",
                "shadow-sm hover:shadow-md",
                // Transizioni fluide
                "transition-all duration-200 ease-out",
                "hover:scale-105 active:scale-95",
                "opacity-80 hover:opacity-100",
                // Focus e accessibilità
                "focus:outline-none focus:ring-2 focus:ring-primary/20",
                "flex items-center justify-center",
                className
            )}
            aria-label="Torna in cima"
        >
            <ArrowUp className="w-4 h-4" />
        </button>
    )
}
