import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import 'mapbox-gl/dist/mapbox-gl.css';
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { PaymentProvider } from "@/contexts/PaymentContext";
import { PropertySearchProvider } from "@/contexts/PropertySearchContext";
import { Toaster } from "@/components/ui/toaster";
import FloatingChatButton from "@/components/chat/FloatingChatButton";
import PWAProvider from "@/components/PWAProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
import MountingProvider from "@/components/MountingProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ProCV - Professional Real Estate Platform for Cape Verde",
  description: "Modern real estate platform for Cape Verde featuring AI-powered property search, VR tours, blockchain verification, and comprehensive property management tools.",
  keywords: "Cape Verde real estate, property search, VR tours, blockchain, AI valuation, PropTech",
  authors: [{ name: "ProCV Team" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ProCV",
    startupImage: "/icons/icon-512x512.png",
  },
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
  },
  openGraph: {
    title: "ProCV - Professional Real Estate Platform for Cape Verde",
    description: "Discover your dream property in Cape Verde with our advanced PropTech platform featuring AI, VR tours, and blockchain verification.",
    type: "website",
    locale: "en_US",
    alternateLocale: ["pt_CV", "cv_CV"],
    url: "https://same-t08mrgjy1io-latest.netlify.app",
    siteName: "ProCV",
    images: [
      {
        url: "/icons/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "ProCV Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ProCV - Cape Verde Property Platform",
    description: "Discover exceptional properties with next-generation PropTech features",
    images: ["/icons/icon-512x512.png"],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "msapplication-TileColor": "#3B82F6",
    "msapplication-config": "/browserconfig.xml",
    "theme-color": "#3B82F6",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Defensive mounting globals initialization
              try {
                if (typeof window !== 'undefined') {
                  window.mounted = true;
                  window.isMounted = true;
                  window.clientMounted = true;
                }
              } catch (e) {
                console.log('Mounting globals setup:', e);
              }
            `
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-white`}
        suppressHydrationWarning
      >
        <MountingProvider>
          <PWAProvider>
            <ErrorBoundary>
              <LanguageProvider>
                <AuthProvider>
                  <PaymentProvider>
                    <ChatProvider>
                      <PropertySearchProvider>
                        <div className="relative">
                          {children}

                        {/* Floating Chat Button - Available on all pages */}
                        <FloatingChatButton />

                          {/* Toast Notifications */}
                          <Toaster />
                        </div>
                      </PropertySearchProvider>
                    </ChatProvider>
                  </PaymentProvider>
                </AuthProvider>
              </LanguageProvider>
            </ErrorBoundary>
          </PWAProvider>
        </MountingProvider>
      </body>
    </html>
  );
}
