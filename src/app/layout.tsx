import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Providers } from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ProCV - Cape Verde Real Estate",
  description: "Find your dream property in Cape Verde. Browse luxury homes, apartments, and commercial properties.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-white`}
        suppressHydrationWarning
      >
        <ErrorBoundary>
          <Providers>
            <div className="relative">
              {children}
              <Toaster />
            </div>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
