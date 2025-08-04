"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { motion } from "framer-motion"

// Tipi per la configurazione della bottom bar
interface BottomBarItem {
    id: string
    icon: React.ComponentType<{ className?: string }>
    label: string
    href?: string
    onClick?: () => void
    badge?: string | number
    isActive?: boolean
    disabled?: boolean
}

interface BottomBarProps {
    items: BottomBarItem[]
    activeItemId?: string
    onItemClick?: (item: BottomBarItem) => void
    className?: string
    showLabels?: boolean
    variant?: "default" | "floating"
}

const BottomBar = React.forwardRef<HTMLDivElement, BottomBarProps>(
    ({
        items,
        activeItemId,
        onItemClick,
        className,
        showLabels = false,
        variant = "default",
        ...props
    }, ref) => {
        const handleItemClick = (item: BottomBarItem) => {
            if (item.disabled) return

            if (item.onClick) {
                item.onClick()
            }

            if (onItemClick) {
                onItemClick(item)
            }
        }

        return (
            <TooltipProvider>
                <motion.div
                    ref={ref}
                    className={cn(
                        // Base styles
                        "fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
                        "border-t border-border/40",
                        "safe-area-inset-bottom", // Per gestire la safe area su iOS

                        // Variant styles
                        variant === "floating" && [
                            "mx-4 mb-4 rounded-2xl border border-border/40 shadow-lg",
                            "left-4 right-4 bottom-4",
                        ],

                        // Responsive: solo su mobile
                        "block md:hidden",

                        className
                    )}
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                        duration: 0.4
                    }}
                    {...props}
                >
                    <nav className="flex items-center justify-around px-2 py-1">
                        {items.map((item) => {
                            const isActive = activeItemId ? item.id === activeItemId : item.isActive
                            const IconComponent = item.icon

                            return (
                                <Tooltip key={item.id}>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className={cn(
                                                "relative flex h-14 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2",
                                                "text-muted-foreground transition-all duration-200 ease-in-out",
                                                "hover:bg-accent/80 hover:text-accent-foreground",
                                                "focus-visible:bg-accent focus-visible:text-accent-foreground",
                                                "active:bg-accent",
                                                "disabled:pointer-events-none disabled:opacity-50",

                                                // Stili per item attivo semplificati
                                                isActive && [
                                                    "bg-primary/15 text-primary",
                                                    "shadow-sm",
                                                    "hover:bg-primary/20",
                                                ],

                                                item.disabled && "opacity-50 cursor-not-allowed"
                                            )}
                                            onClick={() => handleItemClick(item)}
                                            disabled={item.disabled}
                                            aria-label={item.label}
                                            aria-current={isActive ? "page" : undefined}
                                        >
                                            {/* Icona semplificata */}
                                            <IconComponent
                                                className={cn(
                                                    "h-5 w-5 transition-all duration-200",
                                                    isActive && "text-primary"
                                                )}
                                            />

                                            {/* Label semplificata */}
                                            {showLabels && (
                                                <span
                                                    className={cn(
                                                        "text-xs font-medium leading-none transition-all duration-200",
                                                        "max-w-full truncate",
                                                        isActive && "font-semibold text-primary"
                                                    )}
                                                >
                                                    {item.label}
                                                </span>
                                            )}
                                        </Button>
                                    </TooltipTrigger>

                                    {!showLabels && (
                                        <TooltipContent
                                            side="top"
                                            className="mb-2"
                                            sideOffset={8}
                                        >
                                            <p>{item.label}</p>
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                            )
                        })}
                    </nav>
                </motion.div>
            </TooltipProvider>
        )
    }
)

BottomBar.displayName = "BottomBar"

export { BottomBar, type BottomBarItem, type BottomBarProps }
