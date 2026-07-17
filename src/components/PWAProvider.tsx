"use client";

import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

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
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const registerServiceWorker = async () => {
      await new Promise(resolve => setTimeout(resolve, 3000));

      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none'
        });

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                toast({
                  title: "Atualiza\u00e7\u00e3o dispon\u00edvel",
                  description: "Uma nova vers\u00e3o do ProCV est\u00e1 pronta. Atualize a p\u00e1gina.",
                });
              }
            });
          }
        });

      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    };

    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }

    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setShowInstallPrompt(false);
      toast({
        title: "App Instalada",
        description: "ProCV foi adicionado ao seu ecr\u00e3 inicial!",
      });
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [toast]);

  const handleInstallApp = async () => {
    if (!installPrompt || !installPrompt.prompt) return;

    try {
      const result = await installPrompt.prompt();
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
    sessionStorage.setItem('installPromptDismissed', 'true');
  };

  useEffect(() => {
    const dismissed = sessionStorage.getItem('installPromptDismissed');
    if (dismissed) {
      setShowInstallPrompt(false);
    }
  }, []);

  return (
    <>
      {children}

      {showInstallPrompt && installPrompt && (
        <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:w-96">
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span role="img" aria-label="phone">📱</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900">
                  Instalar ProCV
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Obtenha a experi&ecirc;ncia completa com notifica&ccedil;&otilde;es push.
                </p>
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={handleInstallApp}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Instalar
                  </button>
                  <button
                    onClick={dismissInstallPrompt}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Agora n&atilde;o
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @media (display-mode: standalone) {
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
