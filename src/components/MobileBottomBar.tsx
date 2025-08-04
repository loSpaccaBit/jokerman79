"use client"

import { BottomBar, type BottomBarItem } from "@/components/ui/bottom-bar"
import { Home, Gamepad, Dices, Users, Newspaper } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"

// Configurazione degli item della bottom bar
const bottomBarItems: BottomBarItem[] = [
    {
        id: "home",
        icon: Home,
        label: "Home",
        href: "/",
    },
    {
        id: "slots",
        icon: Gamepad,
        label: "Slot Demo",
        href: "/slots"
    },
    {
        id: "stats",
        icon: Dices,
        label: "Statistiche",
        href: "/stats"
    },
    {
        id: "provider",
        icon: Users,
        label: "Provider",
        href: "/providers"
    },
    {
        id: "blog",
        icon: Newspaper,
        label: "Blog",
        href: "/blog",
    },
]

export function MobileBottomBar() {
    const router = useRouter()
    const pathname = usePathname()
    const [activeItemId, setActiveItemId] = useState("home")
    const [isHeaderVisible, setIsHeaderVisible] = useState(true)
    const [lastScrollY, setLastScrollY] = useState(0)

    // Gestione scroll per nascondere/mostrare header
    const handleScroll = useCallback(() => {
        const currentScrollY = window.scrollY

        // Se siamo in cima alla pagina, mostra sempre l'header
        if (currentScrollY < 10) {
            setIsHeaderVisible(true)
        }
        // Se scrolliamo verso il basso, nascondi l'header
        else if (currentScrollY > lastScrollY && currentScrollY > 100) {
            setIsHeaderVisible(false)
        }
        // Se scrolliamo verso l'alto, mostra l'header
        else if (currentScrollY < lastScrollY) {
            setIsHeaderVisible(true)
        }

        setLastScrollY(currentScrollY)
    }, [lastScrollY])

    // Effect per il listener dello scroll
    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [handleScroll])

    // Aggiorna l'item attivo basato sul pathname corrente
    useEffect(() => {
        const currentItem = bottomBarItems.find(item =>
            item.href === pathname ||
            (item.href !== "/" && pathname.startsWith(item.href || ""))
        )
        if (currentItem) {
            setActiveItemId(currentItem.id)
        }
    }, [pathname])

    const handleItemClick = (item: BottomBarItem) => {
        // Aggiorna l'item attivo
        setActiveItemId(item.id)

        // Naviga se c'è un href
        if (item.href) {
            router.push(item.href)
        }

        // Feedback tattile se disponibile
        if (navigator.vibrate) {
            navigator.vibrate(50)
        }

        // Log per debug
        console.log("Clicked item:", item.label)
    }

    return (
        <div className="md:hidden">
            {/* Mobile Header con Logo - Hide/Show on Scroll */}
            <header
                className={`fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border transition-transform duration-300 ease-in-out ${isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
                    }`}
                role="banner"
                aria-label="Header mobile"
            >
                <div className="flex items-center justify-center px-4 py-3">
                    <Link
                        href="/"
                        className="transition-transform hover:scale-105 active:scale-95"
                        aria-label="Vai alla homepage di Jokerman79"
                    >
                        <Image
                            src="/assets/logo.svg"
                            alt="Logo Jokerman79"
                            height={32}
                            width={32}
                            className="h-8 w-auto"
                            priority
                        />
                    </Link>
                </div>
            </header>

            {/* Mobile Bottom Navigation */}
            <nav role="navigation" aria-label="Navigazione mobile principale">
                <BottomBar
                    items={bottomBarItems}
                    activeItemId={activeItemId}
                    onItemClick={handleItemClick}
                    showLabels={true}
                    variant="default"
                />
            </nav>
        </div>
    )
}

export default MobileBottomBar
