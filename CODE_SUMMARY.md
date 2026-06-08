# PropertyCV - Code Summary for AI Review

## Project Structure
```
property-cv/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   ├── map/
│   │   │   ├── page.tsx        # Map page (dynamic import)
│   │   │   └── MapPageClient.tsx
│   │   └── buy/page.tsx        # Buy page
│   ├── components/
│   │   ├── MapboxMap.tsx       # Vanilla Mapbox component
│   │   ├── Header.tsx          # Site header
│   │   └── ui/                 # shadcn components
│   └── data/
│       └── cape-verde-properties.ts
├── package.json
└── next.config.js
```

## Key Files

### 1. package.json
```json
{
  "dependencies": {
    "next": "15.3.2",
    "react": "^18.3.1",
    "mapbox-gl": "2.15.0",
    "@supabase/supabase-js": "^2.107.0",
    "lucide-react": "^0.475.0",
    "tailwindcss": "^3.4.17"
  }
}
```

### 2. app/layout.tsx
```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import ErrorBoundary from "@/components/ErrorBoundary";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ProCV - Cape Verde Real Estate",
  description: "Find your dream property in Cape Verde.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-white`}>
        <ErrorBoundary>
          <div className="relative">
            {children}
            <Toaster />
          </div>
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

### 3. app/map/page.tsx
```tsx
import dynamic from 'next/dynamic';
import { MapPin } from 'lucide-react';

const MapPageClient = dynamic(() => import('./MapPageClient'), {
  ssr: false,
  loading: () => (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <MapPin className="h-12 w-12 mx-auto text-blue-500 mb-4 animate-pulse" />
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  )
});

export default function MapPage() {
  return <MapPageClient />;
}
```

### 4. components/MapboxMap.tsx
```tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

export default function MapboxMap() {
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainer.current || typeof window === 'undefined') return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-23.5126, 14.9212], // Praia, Cape Verde
      zoom: 12
    });

    return () => map.remove();
  }, []);

  return <div ref={mapContainer} className="w-full h-full min-h-[400px]" />;
}
```

### 5. next.config.js
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  reactStrictMode: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'same-assets.com' }
    ],
  },
};
module.exports = nextConfig;
```

## Current Issues
1. Map page was timing out during SSR - fixed with dynamic import
2. Heavy dependencies removed (Stripe, Socket.io, etc.)
3. Layout simplified (removed 8 context providers)

## Environment Variables Needed
```
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.xxx
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```
