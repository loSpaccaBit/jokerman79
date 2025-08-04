"use client"

import { SimpleSearch } from "@/components/shared/SimpleSearch";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { ReactNode } from "react";

interface HeroSectionProps {
    title: string;
    description: string;
    titleClassName?: string;
    descriptionClassName?: string;
    showSearchBar?: boolean;
    searchPlaceholder?: string;
    onSearch?: (query: string) => void;
    searchClassName?: string;
    showImage?: boolean;
    imageSrc?: string;
    imageAlt?: string;
    imageWidth?: number;
    imageHeight?: number;
    imageClassName?: string;
    backgroundColor?: string;
    containerClassName?: string;
    contentClassName?: string;
    imageGlow?: boolean;
    glowColors?: {
        from: string;
        to: string;
    };
    children?: ReactNode;
}

export function HeroSection({
    title,
    description,
    titleClassName = "",
    descriptionClassName = "",
    showSearchBar = true,
    searchPlaceholder = "Cerca...",
    onSearch,
    searchClassName = "",
    showImage = true,
    imageSrc = "/assets/aimg/slot_avatar.png",
    imageAlt = "Hero Image",
    imageWidth = 280,
    imageHeight = 280,
    imageClassName = "",
    backgroundColor = "bg-gradient-to-br from-primary/5 via-background to-secondary/5",
    containerClassName = "",
    contentClassName = "",
    imageGlow = true,
    glowColors = {
        from: "from-primary/20",
        to: "to-secondary/20"
    },
    children
}: HeroSectionProps) {
    return (
        <section className={`relative ${backgroundColor} px-6 py-12 md:py-16 ${containerClassName}`}>
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    {/* Content */}
                    <div className={`space-y-6 order-2 lg:order-1 ${contentClassName}`}>
                        <div className="space-y-4">
                            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold font-tanker bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent ${titleClassName}`}>
                                {title}
                            </h1>
                            <p className={`text-lg md:text-xl text-muted-foreground font-satoshi max-w-lg ${descriptionClassName}`}>
                                {description}
                            </p>
                        </div>

                        {/* Search Bar */}
                        {showSearchBar && (
                            <div className="pt-4">
                                <SimpleSearch
                                    placeholder={searchPlaceholder}
                                    onSearch={onSearch || (() => { })}
                                    className={`max-w-2xl ${searchClassName}`}
                                />
                            </div>
                        )}

                        {/* Custom Children Content */}
                        {children}
                    </div>

                    {/* Image */}
                    {showImage && (
                        <div className="flex justify-center lg:justify-end order-1 lg:order-2">
                            <div className="relative">
                                {imageGlow && (
                                    <>
                                        {/* Glow principale */}
                                        <div className={`absolute inset-0 bg-gradient-to-r ${glowColors.from} ${glowColors.to} rounded-full blur-3xl scale-125 opacity-60`}></div>
                                        {/* Glow secondario per sfumatura */}
                                        <div className={`absolute inset-0 bg-gradient-to-r ${glowColors.from} ${glowColors.to} rounded-full blur-2xl scale-110 opacity-40`}></div>
                                        {/* Glow interno per transizione morbida */}
                                        <div className={`absolute inset-0 bg-gradient-to-r ${glowColors.from} ${glowColors.to} rounded-full blur-xl scale-105 opacity-20`}></div>
                                    </>
                                )}
                                <OptimizedImage
                                    src={imageSrc}
                                    alt={imageAlt}
                                    width={imageWidth}
                                    height={imageHeight}
                                    priority={true}
                                    className={`relative z-10 drop-shadow-2xl w-48 h-48 md:w-64 md:h-64 lg:w-[280px] lg:h-[280px] object-contain ${imageClassName}`}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
