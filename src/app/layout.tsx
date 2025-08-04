import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import { SideBar } from "@/components/layout/SideBar";
import { Footer } from "@/components/layout/Footer";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { ResourcePreloader } from "@/components/ui/resource-preloader";
import { WebVitals } from "@/components/analytics/WebVitals";
import { StructuredData } from "@/components/seo/StructuredData";
import { getOrganizationSchema, getWebSiteSchema } from "@/lib/structured-data";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { GlobalSearchProvider } from "@/contexts/GlobalSearchContext";
import { CookieConsentProvider } from "@/contexts/CookieConsentContext";
import { AgeVerificationProvider } from "@/contexts/AgeVerificationContext";
import { SkipLinks, ScreenReaderAnnouncer, AccessibilityControlPanel } from "@/components/accessibility";
import { RegisterSW } from "@/components/pwa/RegisterSW";
import { ApolloWrapper } from "@/components/providers/ApolloWrapper";
import { GlobalSearchModal } from "@/components/shared/GlobalSearchModal";
import { CookieConsentBanner } from "@/components/cookie-consent/CookieConsentBanner";
import { AgeVerificationModal } from "@/components/age-verification/AgeVerificationModal";

// Phase 1: Error & Loading Management
import { ErrorBoundaryProvider } from "@/components/providers/ErrorBoundaryProvider";
import { AppStateProvider } from "@/contexts/AppStateContext";
import { GlobalLoadingOverlay } from "@/components/loading/LoadingComponents";
import { GlobalErrorBanner, NetworkErrorBanner, NotificationContainer } from "@/components/errors/ErrorComponents";
import { GlobalKeyboardShortcuts } from "@/components/shared/GlobalKeyboardShortcuts";

// Font locali
const tanker = localFont({
  src: "../../public/fonts/Tanker-Regular.woff2",
  variable: "--font-tanker",
  display: "swap",
});

const satoshi = localFont({
  src: "../../public/fonts/Satoshi-Variable.woff2",
  variable: "--font-satoshi",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Jokerman79 - Slot Demo Gratuite e Statistiche Live",
    template: "%s | Jokerman79"
  },
  description: "Scopri le migliori slot demo gratuite, statistiche live e recensioni dei provider. Gioca responsabilmente con le slot machine più popolari.",
  keywords: ["slot demo", "slot gratuite", "casino online", "statistiche slot", "provider slot", "gioco responsabile"],
  authors: [{ name: "Jokerman79" }],
  creator: "Jokerman79",
  publisher: "Jokerman79",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://jokerman79.com'),
  alternates: {
    canonical: '/',
  },
  manifest: '/manifest.json',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' }
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Jokerman79',
    startupImage: [
      '/icons/icon-512x512.png'
    ]
  },
  other: {
    'msapplication-TileColor': '#000000',
    'msapplication-config': '/browserconfig.xml'
  },
  icons: {
    icon: [
      { url: '/icons/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' }
    ],
    shortcut: '/icons/icon-192x192.png'
  },
  openGraph: {
    type: 'website',
    locale: 'it_IT',
    url: 'https://jokerman79.com',
    siteName: 'Jokerman79',
    title: 'Jokerman79 - Slot Demo Gratuite e Statistiche Live',
    description: 'Scopri le migliori slot demo gratuite, statistiche live e recensioni dei provider.',
    images: [
      {
        url: '/assets/logo.svg',
        width: 1200,
        height: 630,
        alt: 'Jokerman79 - Slot Demo Gratuite',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@jokerman79',
    creator: '@jokerman79',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // google: 'verification-code',
    // yandex: 'verification-code',
    // yahoo: 'verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it-IT" suppressHydrationWarning>
      <body
        className={`${tanker.variable} ${satoshi.variable} antialiased`}
      >
        <RegisterSW />
        <ResourcePreloader
          images={[
            '/assets/aimg/slot_avatar.png',
            '/assets/aimg/stats_avatar.png',
            'assets/aimg/blog_avatar.png',
            '/assets/aimg/provider_avatar.png',
            '/assets/logo.svg'
          ]}
        />

        <AccessibilityProvider>
          {/* Age Verification - Must be highest priority for legal compliance */}
          <AgeVerificationProvider>
            {/* Cookie Consent Management - Must be high in tree */}
            <CookieConsentProvider>
            {/* Phase 1: Global Error & Loading Management */}
            <ErrorBoundaryProvider>
              <AppStateProvider>
                <ApolloWrapper>
                  <GlobalSearchProvider>
                    <ThemeProvider
                      attribute="class"
                      defaultTheme="system"
                      enableSystem
                      disableTransitionOnChange
                    >
                    {/* Structured Data globali */}
                    <StructuredData data={[
                      getOrganizationSchema(),
                      getWebSiteSchema()
                    ]} />

                    {/* Skip Links per navigazione da tastiera */}
                    <SkipLinks />

                    {/* Announcer per screen reader */}
                    <ScreenReaderAnnouncer message="" />

                    <WebVitals />

                    {/* Error and Network Status Indicators */}
                    <GlobalErrorBanner />
                    <NetworkErrorBanner />

                    <div className="relative flex min-h-screen flex-col">
                      <SideBar>
                        <main role="main" id="main-content" tabIndex={-1}>
                          {children}
                        </main>
                        <Footer />
                      </SideBar>
                    </div>

                    <ScrollToTop />

                    {/* Global Loading Overlay */}
                    <GlobalLoadingOverlay />

                    {/* Notification System */}
                    <NotificationContainer />

                    {/* Pannello controllo accessibilità */}
                    <AccessibilityControlPanel />

                    {/* Modal di ricerca globale */}
                    <GlobalSearchModal />

                    {/* Scorciatoie da tastiera globali */}
                    <GlobalKeyboardShortcuts />

                    {/* Cookie Consent Banner - GDPR Compliance */}
                    <CookieConsentBanner position="bottom" />

                    {/* Age Verification Modal - Legal Compliance */}
                    <AgeVerificationModal />
                  </ThemeProvider>
                </GlobalSearchProvider>
              </ApolloWrapper>
            </AppStateProvider>
          </ErrorBoundaryProvider>
            </CookieConsentProvider>
          </AgeVerificationProvider>
        </AccessibilityProvider>
      </body>
    </html>
  );
}
