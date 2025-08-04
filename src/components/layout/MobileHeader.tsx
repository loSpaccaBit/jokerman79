"use client"

import Image from "next/image"
import Link from "next/link"

export function MobileHeader() {
    return (
        <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border px-4 py-2">
            <Link href="/" className="flex items-center justify-center">
                <Image
                    src={'/assets/logo.svg'}
                    alt="Jokerman79 Logo"
                    height={40}
                    width={40}
                    className="h-8 w-auto"
                />
            </Link>
        </div>
    )
}
