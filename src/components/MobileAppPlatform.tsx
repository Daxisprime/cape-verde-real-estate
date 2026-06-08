"use client";

import { useState, useEffect } from "react";
import { Smartphone, Download, Bell, Share2, QrCode, Apple, Play, Globe, Wifi, WifiOff, Battery, Signal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import QRCodeLib from "qrcode";

interface AppFeature {
  id: string;
  name: string;
  description: string;
  icon: string;
  available: boolean;
  beta?: boolean;
}

interface PushNotificationSettings {
  priceAlerts: boolean;
  newListings: boolean;
  viewingReminders: boolean;
  marketUpdates: boolean;
  agentMessages: boolean;
}

interface PWACapabilities {
  offline: boolean;
  installable: boolean;
  pushNotifications: boolean;
  backgroundSync: boolean;
  cameraAccess: boolean;
  geolocation: boolean;
  nativeSharing: boolean;
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface MobileAppPlatformProps {
  onInstallPWA?: () => void;
}

export default function MobileAppPlatform({ onInstallPWA }: MobileAppPlatformProps) {
  const [isInstallPromptOpen, setIsInstallPromptOpen] = useState(false);
  const [isQRCodeOpen, setIsQRCodeOpen] = useState(false);
  const [qrCodeDataURL, setQRCodeDataURL] = useState<string>("");
  const [isOnline, setIsOnline] = useState(true);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [signalStrength, setSignalStrength] = useState(4);

  const [notificationSettings, setNotificationSettings] = useState<PushNotificationSettings>({
    priceAlerts: true,
    newListings: true,
    viewingReminders: true,
    marketUpdates: false,
    agentMessages: true
  });

  const [pwaCapabilities, setPwaCapabilities] = useState<PWACapabilities>({
    offline: false,
    installable: false,
    pushNotifications: false,
    backgroundSync: false,
    cameraAccess: false,
    geolocation: false,
    nativeSharing: false
  });

  const appFeatures: AppFeature[] = [
    {
      id: "ar-view",
      name: "AR Property View",
      description: "View properties in augmented reality",
      icon: "🥽",
      available: true,
      beta: true
    },
    {
      id: "offline-mode",
      name: "Offline Browsing",
      description: "Browse cached properties without internet",
      icon: "📱",
      available: true
    },
    {
      id: "push-notifications",
      name: "Smart Notifications",
      description: "Real-time property alerts and updates",
      icon: "🔔",
      available: true
    },
    {
      id: "location-based",
      name: "Location Search",
      description: "Find properties based on your location",
      icon: "📍",
      available: true
    },
    {
      id: "voice-search",
      name: "Voice Search",
      description: "Search properties using voice commands",
      icon: "🎤",
      available: true,
      beta: true
    },
    {
      id: "biometric-auth",
      name: "Biometric Login",
      description: "Secure login with fingerprint/face ID",
      icon: "🔒",
      available: true
    },
    {
      id: "camera-search",
      name: "Visual Search",
      description: "Search similar properties by taking photos",
      icon: "📸",
      available: false
    },
    {
      id: "nfc-sharing",
      name: "NFC Sharing",
      description: "Share property details via NFC",
      icon: "📲",
      available: false
    }
  ];

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Check PWA capabilities
    checkPWASupport();

    // Define the handler
    const beforeInstallPromptHandler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', beforeInstallPromptHandler);

    // Check if already installed
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Monitor online status
    if (navigator && navigator.onLine !== undefined) {
      setIsOnline(navigator.onLine);
      window.addEventListener('online', () => setIsOnline(true));
      window.addEventListener('offline', () => setIsOnline(false));
    }

    // Generate QR code
    generateQRCode();

    // Simulate battery and signal
    const cleanupSimulation = simulateDeviceStatus();

    return () => {
      window.removeEventListener('beforeinstallprompt', beforeInstallPromptHandler);
      window.removeEventListener('online', () => setIsOnline(true));
      window.removeEventListener('offline', () => setIsOnline(false));
      if (cleanupSimulation) {
        cleanupSimulation();
      }
    };
  }, []);

  const checkPWASupport = () => {
    const capabilities: PWACapabilities = {
      offline: 'serviceWorker' in navigator,
      installable: 'BeforeInstallPromptEvent' in window,
      pushNotifications: 'PushManager' in window && 'Notification' in window,
      backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
      cameraAccess: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
      geolocation: 'geolocation' in navigator,
      nativeSharing: 'share' in navigator
    };

    setPwaCapabilities(capabilities);
  };



  const installPWA = async () => {
    if (installPrompt) {
      const result = await installPrompt.prompt();
      if (result.outcome === 'accepted') {
        setIsInstalled(true);
        setInstallPrompt(null);
        onInstallPWA?.();
      }
    }
  };

  const generateQRCode = async () => {
    try {
      if (typeof window === 'undefined') return;
      const url = window.location?.origin || 'https://procv.app';
      const dataURL = await QRCodeLib.toDataURL(url, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQRCodeDataURL(dataURL);
    } catch (error) {
      console.error('QR Code generation failed:', error);
    }
  };

  const simulateDeviceStatus = () => {
    if (typeof window === 'undefined') return () => {};

    // Simulate battery level changes
    const batteryInterval = setInterval(() => {
      setBatteryLevel(prev => {
        const change = Math.random() > 0.5 ? 1 : -1;
        return Math.max(10, Math.min(100, prev + change));
      });
    }, 30000);

    // Simulate signal strength changes
    const signalInterval = setInterval(() => {
      setSignalStrength(Math.floor(Math.random() * 5));
    }, 45000);

    return () => {
      clearInterval(batteryInterval);
      clearInterval(signalInterval);
    };
  };

  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        // Send welcome notification
        new Notification('ProCV Mobile Ready!', {
          body: 'You\'ll now receive property alerts and updates',
          icon: '/favicon.ico',
          badge: '/favicon.ico'
        });
      }
    }
  };

  const updateNotificationSetting = (setting: keyof PushNotificationSettings, value: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [setting]: value }));
  };

  const shareApp = async () => {
    if (typeof window === 'undefined') return;

    if (navigator && navigator.share) {
      try {
        await navigator.share({
          title: 'ProCV - Cape Verde Properties',
          text: 'Discover amazing properties in Cape Verde',
          url: window.location.origin
        });
      } catch (error) {
        console.log('Sharing cancelled');
      }
    } else if (navigator && navigator.clipboard) {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.origin);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mobile App Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Smartphone className="h-6 w-6 mr-2 text-blue-600" />
              ProCV Mobile App
              {isInstalled && (
                <Badge className="ml-2 bg-green-100 text-green-800">Installed</Badge>
              )}
            </div>

            {/* Device Status Indicators */}
            <div className="flex items-center space-x-3 text-sm">
              <div className="flex items-center">
                {isOnline ? (
                  <Wifi className="h-4 w-4 text-green-600" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-600" />
                )}
              </div>

              <div className="flex items-center">
                <Signal className="h-4 w-4 mr-1" />
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-1 h-3 rounded ${
                        i < signalStrength ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center">
                <Battery className="h-4 w-4 mr-1" />
                <span className="text-xs">{batteryLevel}%</span>
              </div>
            </div>
          </CardTitle>
          <p className="text-gray-600">
            Access ProCV anywhere with our progressive web app. Get native app experience with offline capabilities.
          </p>
        </CardHeader>
      </Card>

      {/* Installation Options */}
      <Card>
        <CardHeader>
          <CardTitle>Get the Mobile App</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pwa" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pwa">Progressive Web App</TabsTrigger>
              <TabsTrigger value="ios">iOS App Store</TabsTrigger>
              <TabsTrigger value="android">Google Play</TabsTrigger>
            </TabsList>

            <TabsContent value="pwa" className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center">
                  <Globe className="h-4 w-4 mr-2" />
                  Install Progressive Web App
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Get native app experience instantly without app store downloads. Works offline with push notifications.
                </p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">0 MB</div>
                    <div className="text-xs text-gray-500">Installation Size</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">Instant</div>
                    <div className="text-xs text-gray-500">Available Now</div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={installPrompt ? installPWA : () => setIsInstallPromptOpen(true)}
                    disabled={isInstalled}
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isInstalled ? 'Already Installed' : 'Install PWA'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsQRCodeOpen(true)}
                  >
                    <QrCode className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* PWA Capabilities */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(pwaCapabilities).map(([key, supported]) => (
                  <div key={key} className="text-center p-2 border rounded">
                    <div className={`text-lg ${supported ? 'text-green-600' : 'text-red-600'}`}>
                      {supported ? '✓' : '✗'}
                    </div>
                    <div className="text-xs capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="ios" className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <Apple className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h4 className="font-semibold mb-2">Coming to App Store</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Native iOS app is in development. Join our waitlist to be notified when it's available.
                </p>
                <Button variant="outline" disabled>
                  <Apple className="h-4 w-4 mr-2" />
                  Coming Soon
                </Button>
                <div className="mt-4 text-xs text-gray-500">
                  Expected release: Q2 2025
                </div>
              </div>
            </TabsContent>

            <TabsContent value="android" className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <Play className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h4 className="font-semibold mb-2">Coming to Google Play</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Native Android app is in development. Join our waitlist to be notified when it's available.
                </p>
                <Button variant="outline" disabled>
                  <Play className="h-4 w-4 mr-2" />
                  Coming Soon
                </Button>
                <div className="mt-4 text-xs text-gray-500">
                  Expected release: Q2 2025
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Mobile App Features */}
      <Card>
        <CardHeader>
          <CardTitle>Mobile Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {appFeatures.map((feature) => (
              <div
                key={feature.id}
                className={`p-4 rounded-lg border ${
                  feature.available
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{feature.icon}</span>
                    <h4 className="font-semibold">{feature.name}</h4>
                  </div>
                  <div className="flex space-x-1">
                    {feature.available ? (
                      <Badge className="bg-green-100 text-green-800 text-xs">Available</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                    )}
                    {feature.beta && (
                      <Badge variant="outline" className="text-xs">Beta</Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Push Notifications
            </div>
            <Button
              onClick={requestNotificationPermission}
              size="sm"
              variant="outline"
            >
              Enable Notifications
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(notificationSettings).map(([key, enabled]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <div className="font-medium capitalize">
                  {key.replace(/([A-Z])/g, ' $1')}
                </div>
                <div className="text-sm text-gray-600">
                  {key === 'priceAlerts' && 'Get notified when property prices change'}
                  {key === 'newListings' && 'Instant alerts for new property listings'}
                  {key === 'viewingReminders' && 'Reminders for scheduled property viewings'}
                  {key === 'marketUpdates' && 'Weekly market insights and trends'}
                  {key === 'agentMessages' && 'Messages from estate agents'}
                </div>
              </div>
              <Switch
                checked={enabled}
                onCheckedChange={(value) => updateNotificationSetting(key as keyof PushNotificationSettings, value)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Sharing Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Share2 className="h-5 w-5 mr-2" />
            Share ProCV
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={shareApp}
              variant="outline"
              className="h-16 flex flex-col"
            >
              <Share2 className="h-5 w-5 mb-1" />
              <span className="text-sm">Native Share</span>
            </Button>

            <Button
              onClick={() => setIsQRCodeOpen(true)}
              variant="outline"
              className="h-16 flex flex-col"
            >
              <QrCode className="h-5 w-5 mb-1" />
              <span className="text-sm">QR Code</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* QR Code Modal */}
      <Dialog open={isQRCodeOpen} onOpenChange={setIsQRCodeOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scan to Install ProCV</DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            {qrCodeDataURL && (
              <img
                src={qrCodeDataURL}
                alt="QR Code for ProCV"
                className="mx-auto border rounded"
              />
            )}
            <p className="text-sm text-gray-600">
              Scan this QR code with your mobile device to install ProCV instantly
            </p>
            <div className="text-xs text-gray-500">
              {typeof window !== 'undefined' ? window.location.origin : 'https://procv.app'}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Install Prompt Modal */}
      <Dialog open={isInstallPromptOpen} onOpenChange={setIsInstallPromptOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Install ProCV App</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              Add ProCV to your home screen for quick access and offline browsing capabilities.
            </p>
            <div className="bg-blue-50 p-3 rounded-lg text-sm">
              <strong>Benefits:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Works offline</li>
                <li>Push notifications</li>
                <li>Faster loading</li>
                <li>Native app experience</li>
              </ul>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => setIsInstallPromptOpen(false)}
                variant="outline"
                className="flex-1"
              >
                Later
              </Button>
              <Button
                onClick={() => {
                  setIsInstallPromptOpen(false);
                  // Manual installation instructions
                  alert('To install: Open browser menu → "Add to Home Screen" or "Install App"');
                }}
                className="flex-1"
              >
                Install
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
