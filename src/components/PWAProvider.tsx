"use client";

import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

// TypeScript interfaces for PWA install prompt event
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

interface PWAProviderProps {
  children: React.ReactNode;
}

export default function PWAProvider({ children }: PWAProviderProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none'
        });

        console.log('Service Worker registered:', registration);

        // Handle service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available
                toast({
                  title: "🔄 Update Available",
                  description: "A new version of ProCV is ready. Refresh to update.",
                });
              }
            });
          }
        });

        // Handle service worker messages
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'CACHE_UPDATED') {
            toast({
              title: "📦 Cache Updated",
              description: "New content is available for offline use.",
            });
          }
        });

      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    };

    // Register service worker
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }

    // Setup online/offline listeners
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "🌐 Back Online",
        description: "Your connection has been restored.",
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "📡 Offline Mode",
        description: "You're now offline. Some features may be limited.",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Setup PWA install prompt
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);

    // Handle app installed
    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setShowInstallPrompt(false);
      toast({
        title: "🎉 App Installed",
        description: "ProCV has been added to your home screen!",
      });
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [toast]);

  const handleInstallApp = async () => {
    if (!installPrompt || !installPrompt.prompt) return;

    try {
      const result = await installPrompt.prompt();
      console.log('Install prompt result:', result);

      if (result.outcome === 'accepted') {
        setInstallPrompt(null);
        setShowInstallPrompt(false);
      }
    } catch (error) {
      console.error('Error showing install prompt:', error);
    }
  };

  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false);
    // Don't show again for this session
    sessionStorage.setItem('installPromptDismissed', 'true');
  };

  // Check if install prompt was already dismissed this session
  useEffect(() => {
    const dismissed = sessionStorage.getItem('installPromptDismissed');
    if (dismissed) {
      setShowInstallPrompt(false);
    }
  }, []);

  return (
    <>
      {children}

      {/* PWA Install Prompt */}
      {showInstallPrompt && installPrompt && (
        <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:w-96">
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  📱
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900">
                  Install ProCV App
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Get the full experience with offline access and push notifications.
                </p>
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={handleInstallApp}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Install
                  </button>
                  <button
                    onClick={dismissInstallPrompt}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Not now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connection Status Indicator */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white text-center py-2 text-sm">
          📡 You're offline - Some features may be limited
        </div>
      )}

      {/* PWA Meta Tags (injected via Next.js Head) */}
      <style jsx global>{`
        @media (display-mode: standalone) {
          /* PWA-specific styles when running as installed app */
          body {
            -webkit-user-select: none;
            -webkit-touch-callout: none;
            -webkit-tap-highlight-color: transparent;
          }
        }
      `}</style>
    </>
  );
}
