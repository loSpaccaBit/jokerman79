"use client";

import { ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { BannerDisclamer } from "../BannerDisclamer";
import { MobileBottomBar } from "../MobileBottomBar";
import { FullscreenProvider, useFullscreen } from "@/contexts/FullscreenContext";

type PageProps = {
    children?: ReactNode;
};

function SideBarContent({ children }: PageProps) {
    const { isFullscreen } = useFullscreen();

    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "15rem",
                } as React.CSSProperties
            }
        >
            <AppSidebar />
            <SidebarInset>
                <header role="banner" className="mt-2 mx-2 md:mt-4 md:mr-2 md:ml-2 pt-16 md:pt-0">
                    <BannerDisclamer />
                </header>
                <div className="m-2 pb-20 md:pb-2" role="main">
                    {children}
                </div>
            </SidebarInset>
            {!isFullscreen && <MobileBottomBar />}
        </SidebarProvider>
    );
}

export function SideBar({ children }: PageProps) {
    return (
        <FullscreenProvider>
            <SideBarContent>{children}</SideBarContent>
        </FullscreenProvider>
    );
}
