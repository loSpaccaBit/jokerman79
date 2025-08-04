"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Gamepad, Dices, Users, Newspaper, Server, Activity } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

import Autoplay from "embla-carousel-autoplay"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel"

import { ModeToggle } from "./ModeToggle"
import { AdsCard } from "./layout/AdsCard"
import { GlobalSearchButton } from "./shared/GlobalSearchButton"
import { useLocalAdvertisements, type Advertisement } from "@/hooks/useAdvertisements"

// Funzione per creare gli item basati sul pathname
const createNavItems = (pathname: string) => ({
  navMain: [
    {
      items: [
        {
          title: "Home",
          url: "/",
          icon: Home,
          isActive: pathname === "/",
        },
        {
          title: "Slot Demo Gratis",
          url: "/slots",
          icon: Gamepad,
          isActive: pathname.startsWith("/slots"),
        },
        {
          title: "Statistiche Live",
          url: "/stats",
          icon: Dices,
          isActive: pathname === "/stats",
        },
        {
          title: "Provider",
          url: "/providers",
          icon: Users,
          isActive: pathname === "/providers",
        },
        {
          title: "Blog",
          url: "/blog",
          icon: Newspaper,
          isActive: pathname === "/blog",
        },
      ],
    }
  ],
})

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const data = createNavItems(pathname)
  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true })
  )

  // Get advertisements from local JSON data
  const { advertisements, loading: adsLoading, error } = useLocalAdvertisements(5, 'sidebar');

  // Debug logging - limitato per evitare spam nei log
  const logRef = React.useRef<string>('');
  React.useEffect(() => {
    const currentState = JSON.stringify({
      count: advertisements?.length || 0,
      adsLoading,
      hasError: !!error
    });

    // Log sempre per debug iniziale
    console.log('🔍 Current local ads state:', {
      advertisements,
      count: advertisements?.length || 0,
      adsLoading,
      error: error?.message || error,
      errorType: error?.constructor?.name
    });

    // Log solo se lo stato è cambiato
    if (logRef.current !== currentState) {
      logRef.current = currentState;

      if (error) {
        console.group('🚨 Local Ads Error Details');
        console.error('Full error object:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.groupEnd();
      }
    }
  }, [advertisements?.length, adsLoading, error?.message]);

  // Memoizza le advertisements per evitare re-render non necessari
  const memoizedAdvertisements = React.useMemo(() => {
    try {
      if (!advertisements || advertisements.length === 0) return [];

      return advertisements.filter((advertisement: Advertisement) => {
        if (!advertisement || !advertisement.id) {
          console.warn('Invalid advertisement found:', advertisement);
          return false;
        }
        return true;
      });
    } catch (error) {
      console.error('Error processing advertisements:', error);
      return [];
    }
  }, [advertisements]);

  return (
    <Sidebar
      variant="floating"
      role="navigation"
      aria-label="Menu principale di navigazione"
      {...props}
    >
      <SidebarHeader>
        <span className="flex items-center justify-center">
          <Link href="/" aria-label="Vai alla homepage di Jokerman79">
            <Image
              src={'/assets/logo.svg'}
              alt="Jokerman79 Logo"
              height={100}
              width={100}
              className="w-full max-w-30 h-auto"
            />
          </Link>
        </span>
        {/* Pulsante di ricerca globale */}
        <div className="px-2 pb-2">
          <GlobalSearchButton />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-2" role="list">
            {data.navMain.map((item, index) => (
              <SidebarMenuItem key={index} role="listitem">
                {item.items?.length ? (
                  <SidebarMenuSub className="ml-0 border-l-0 px-1.5" role="list">
                    {item.items.map((navItem) => (
                      <SidebarMenuSubItem key={navItem.title} role="listitem">
                        <SidebarMenuSubButton asChild isActive={navItem.isActive}>
                          <Link
                            href={navItem.url}
                            className="flex items-center gap-2"
                            aria-current={navItem.isActive ? "page" : undefined}
                            aria-label={`Vai a ${navItem.title}`}
                          >
                            {navItem.icon && <navItem.icon className="h-4 w-4" aria-hidden="true" />}
                            {navItem.title}
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                ) : null}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <div role="complementary" aria-label="Pubblicità">
            <Carousel
              plugins={[plugin.current]}
              className="w-full max-w-xs mx-auto"
              onMouseEnter={plugin.current.stop}
              onMouseLeave={plugin.current.reset}
              opts={{
                align: "start",
                loop: true,
              }}
            >
              <CarouselContent className="-ml-1">
                {adsLoading ? (
                  // Loading placeholder
                  Array.from({ length: 3 }).map((_, index) => (
                    <CarouselItem key={`loading-${index}`} className="pl-1">
                      <div className="w-full h-48 bg-muted animate-pulse rounded-lg" />
                    </CarouselItem>
                  ))
                ) : memoizedAdvertisements.length > 0 ? (
                  // Actual advertisements from Strapi
                  memoizedAdvertisements
                    .map((advertisement: Advertisement) => {
                      try {
                        return (
                          <CarouselItem key={advertisement.id} className="pl-1">
                            <AdsCard advertisement={advertisement} />
                          </CarouselItem>
                        );
                      } catch (error) {
                        console.error(`Error rendering advertisement ${advertisement.id}:`, error);
                        return (
                          <CarouselItem key={`error-${advertisement.id}`} className="pl-1">
                            <div className="w-full h-48 bg-red-100 rounded-lg flex items-center justify-center">
                              <p className="text-red-600 text-xs">Errore caricamento ads</p>
                            </div>
                          </CarouselItem>
                        );
                      }
                    })
                ) : (
                  // No ads available message
                  <CarouselItem className="pl-1">
                    <div className="w-full h-48 bg-muted/20 rounded-lg flex flex-col items-center justify-center p-4">
                      <p className="text-muted-foreground text-sm text-center mb-2">
                        {error ? 'Errore nel caricamento delle pubblicità locali' : 'Nessuna pubblicità disponibile al momento'}
                      </p>
                      {error && (
                        <div className="text-xs text-destructive text-center space-y-1">
                          <p>Errore dati locali</p>
                          <p className="text-xs opacity-70">
                            Verificare il file /data/advertisements.json
                          </p>
                          {error.message && (
                            <p className="text-xs opacity-50 font-mono">
                              {error.message.substring(0, 100)}...
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </CarouselItem>
                )}
              </CarouselContent>
            </Carousel>
          </div>
        </SidebarGroup>
      </SidebarContent>
      <span className="p-2" role="toolbar" aria-label="Strumenti tema">
        <ModeToggle />
      </span>
    </Sidebar>
  )
}
