"use client";

import { useState, useEffect, useRef, useMemo } from "react";

// TypeScript declarations for WebXR
declare global {
  interface Navigator {
    xr?: {
      requestSession: (mode: string) => Promise<unknown>;
    };
  }
}
import { Monitor, Play, Pause, RotateCcw, Maximize2, Volume2, VolumeX, Navigation, Eye, Settings, Smartphone, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface VRScene {
  id: string;
  name: string;
  description: string;
  thumbnailUrl: string;
  vrUrl: string;
  panoramaUrl: string;
  hotspots: Array<{
    x: number;
    y: number;
    title: string;
    description: string;
    linkedSceneId?: string;
    type: 'info' | 'navigation' | 'measurement';
  }>;
  ambientSound?: string;
  vrFeatures: {
    supports360: boolean;
    supportsVR: boolean;
    supportsAR: boolean;
    hasInteractiveElements: boolean;
  };
}

interface VRTourData {
  id: string;
  title: string;
  description: string;
  duration: number;
  scenes: VRScene[];
  tourGuide?: {
    name: string;
    avatar: string;
    voiceNarration: boolean;
  };
  createdDate: string;
  quality: '4K' | '8K' | 'HD';
}

interface VRPropertyToursProps {
  propertyId: string;
  propertyTitle: string;
}

export default function VRPropertyTours({ propertyId, propertyTitle }: VRPropertyToursProps) {
  const [currentTour, setCurrentTour] = useState<VRTourData | null>(null);
  const [currentScene, setCurrentScene] = useState<VRScene | null>(null);
  const [isVRMode, setIsVRMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [viewerMode, setViewerMode] = useState<'panorama' | 'vr' | 'ar'>('panorama');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rotationSpeed, setRotationSpeed] = useState([1]);
  const [isLoading, setIsLoading] = useState(false);
  const [deviceSupport, setDeviceSupport] = useState({
    webXR: false,
    webVR: false,
    gyroscope: false,
    fullscreen: false
  });

  const vrContainerRef = useRef<HTMLDivElement>(null);
  const panoramaRef = useRef<HTMLDivElement>(null);

  // Sample VR tour data
  const sampleTour: VRTourData = useMemo(() => ({
    id: "tour-1",
    title: `360° VR Tour - ${propertyTitle}`,
    description: "Immersive virtual reality experience showcasing every corner of this stunning property",
    duration: 12,
    quality: "8K",
    createdDate: "2024-12-28",
    tourGuide: {
      name: "Maria Santos",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
      voiceNarration: true
    },
    scenes: [
      {
        id: "entrance",
        name: "Grand Entrance",
        description: "Welcome to the magnificent entrance hall with soaring ceilings",
        thumbnailUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        vrUrl: "https://cdn.aframe.io/360-image-gallery-boilerplate/img/city.jpg",
        panoramaUrl: "https://cdn.aframe.io/360-image-gallery-boilerplate/img/city.jpg",
        ambientSound: "entrance-ambient.mp3",
        vrFeatures: {
          supports360: true,
          supportsVR: true,
          supportsAR: true,
          hasInteractiveElements: true
        },
        hotspots: [
          { x: 25, y: 50, title: "Chandelier", description: "Handcrafted crystal chandelier from Italy", type: "info" },
          { x: 75, y: 30, title: "Living Room", description: "Continue to the main living area", linkedSceneId: "living", type: "navigation" },
          { x: 50, y: 80, title: "Ceiling Height", description: "4.5m high ceilings", type: "measurement" }
        ]
      },
      {
        id: "living",
        name: "Living Room",
        description: "Spacious living room with panoramic ocean views",
        thumbnailUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        vrUrl: "https://cdn.aframe.io/360-image-gallery-boilerplate/img/forest.jpg",
        panoramaUrl: "https://cdn.aframe.io/360-image-gallery-boilerplate/img/forest.jpg",
        ambientSound: "ocean-waves.mp3",
        vrFeatures: {
          supports360: true,
          supportsVR: true,
          supportsAR: true,
          hasInteractiveElements: true
        },
        hotspots: [
          { x: 60, y: 40, title: "Ocean View", description: "180° panoramic ocean views", type: "info" },
          { x: 20, y: 60, title: "Kitchen", description: "Modern gourmet kitchen", linkedSceneId: "kitchen", type: "navigation" },
          { x: 80, y: 70, title: "Terrace", description: "Private ocean-facing terrace", linkedSceneId: "terrace", type: "navigation" }
        ]
      },
      {
        id: "kitchen",
        name: "Gourmet Kitchen",
        description: "State-of-the-art kitchen with premium appliances",
        thumbnailUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        vrUrl: "https://cdn.aframe.io/360-image-gallery-boilerplate/img/cubes.jpg",
        panoramaUrl: "https://cdn.aframe.io/360-image-gallery-boilerplate/img/cubes.jpg",
        vrFeatures: {
          supports360: true,
          supportsVR: true,
          supportsAR: false,
          hasInteractiveElements: true
        },
        hotspots: [
          { x: 40, y: 45, title: "Island Counter", description: "Marble waterfall island with seating for 6", type: "info" },
          { x: 70, y: 35, title: "Appliances", description: "Professional-grade stainless steel appliances", type: "info" },
          { x: 15, y: 55, title: "Pantry", description: "Walk-in pantry with custom storage", type: "info" }
        ]
      },
      {
        id: "master",
        name: "Master Bedroom",
        description: "Luxurious master suite with private balcony",
        thumbnailUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        vrUrl: "https://cdn.aframe.io/360-image-gallery-boilerplate/img/sechelt.jpg",
        panoramaUrl: "https://cdn.aframe.io/360-image-gallery-boilerplate/img/sechelt.jpg",
        vrFeatures: {
          supports360: true,
          supportsVR: true,
          supportsAR: true,
          hasInteractiveElements: true
        },
        hotspots: [
          { x: 50, y: 30, title: "Walk-in Closet", description: "Custom-designed walk-in closet", linkedSceneId: "closet", type: "navigation" },
          { x: 80, y: 50, title: "En-suite Bathroom", description: "Spa-like master bathroom", linkedSceneId: "bathroom", type: "navigation" },
          { x: 30, y: 70, title: "Private Balcony", description: "Ocean-view private balcony", type: "info" }
        ]
      },
      {
        id: "terrace",
        name: "Ocean Terrace",
        description: "Private terrace with infinity pool and ocean views",
        thumbnailUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        vrUrl: "https://cdn.aframe.io/360-image-gallery-boilerplate/img/lake.jpg",
        panoramaUrl: "https://cdn.aframe.io/360-image-gallery-boilerplate/img/lake.jpg",
        ambientSound: "pool-water.mp3",
        vrFeatures: {
          supports360: true,
          supportsVR: true,
          supportsAR: true,
          hasInteractiveElements: true
        },
        hotspots: [
          { x: 50, y: 60, title: "Infinity Pool", description: "25m infinity pool with ocean edge", type: "info" },
          { x: 70, y: 40, title: "Outdoor Kitchen", description: "Fully equipped outdoor kitchen", type: "info" },
          { x: 30, y: 80, title: "Lounge Area", description: "Covered outdoor lounge area", type: "info" }
        ]
      }
    ]
  }), [propertyTitle]);

  useEffect(() => {
    // Initialize tour
    setCurrentTour(sampleTour);
    setCurrentScene(sampleTour.scenes[0]);

    // Check device support
    checkDeviceSupport();
  }, [sampleTour]);

  const checkDeviceSupport = () => {
    if (typeof window === 'undefined') return;

    const support = {
      webXR: Boolean('xr' in navigator && navigator.xr && 'requestSession' in navigator.xr),
      webVR: 'getVRDisplays' in navigator,
      gyroscope: 'DeviceOrientationEvent' in window,
      fullscreen: 'requestFullscreen' in document.documentElement
    };
    setDeviceSupport(support);
  };

  const startVRExperience = async (mode: 'panorama' | 'vr' | 'ar') => {
    setIsLoading(true);
    setViewerMode(mode);

    // Simulate VR initialization
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (mode === 'vr' && deviceSupport.webXR) {
      try {
        // WebXR VR session initialization would go here
        setIsVRMode(true);
      } catch (error) {
        console.log('VR not available, falling back to 360° view');
        setViewerMode('panorama');
      }
    }

    setIsPlaying(true);
    setIsLoading(false);
  };

  const navigateToScene = (sceneId: string) => {
    const scene = currentTour?.scenes.find(s => s.id === sceneId);
    if (scene) {
      setCurrentScene(scene);
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen && vrContainerRef.current) {
      vrContainerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const resetView = () => {
    // Reset camera position and rotation
    setRotationSpeed([1]);
  };

  if (!currentTour || !currentScene) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Monitor className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">VR Tour Not Available</h3>
          <p className="text-gray-600">Virtual reality tour is being prepared for this property.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* VR Tour Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Monitor className="h-6 w-6 mr-2 text-purple-600" />
                {currentTour.title}
                <Badge className="ml-2 bg-purple-100 text-purple-800">{currentTour.quality}</Badge>
              </CardTitle>
              <p className="text-gray-600 mt-1">{currentTour.description}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Duration: {currentTour.duration} min</div>
              {currentTour.tourGuide && (
                <div className="flex items-center mt-2">
                  <img
                    src={currentTour.tourGuide.avatar}
                    alt={currentTour.tourGuide.name}
                    className="w-6 h-6 rounded-full mr-2"
                  />
                  <span className="text-sm">Guide: {currentTour.tourGuide.name}</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* VR Experience Modes */}
      <Card>
        <CardHeader>
          <CardTitle>Choose Your Experience</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={viewerMode} onValueChange={(value) => setViewerMode(value as 'panorama' | 'vr' | 'ar')}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="panorama" className="flex items-center">
                <Monitor className="h-4 w-4 mr-2" />
                360° Panorama
              </TabsTrigger>
              <TabsTrigger value="vr" disabled={!deviceSupport.webXR} className="flex items-center">
                <Monitor className="h-4 w-4 mr-2" />
                VR Headset
              </TabsTrigger>
              <TabsTrigger value="ar" disabled={!deviceSupport.webXR} className="flex items-center">
                <Smartphone className="h-4 w-4 mr-2" />
                AR Mobile
              </TabsTrigger>
            </TabsList>

            <TabsContent value="panorama" className="mt-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">360° Panoramic View</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Navigate through the property using your mouse or touch gestures. Click and drag to look around.
                </p>
                <Button
                  onClick={() => startVRExperience('panorama')}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? 'Loading...' : 'Start 360° Tour'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="vr" className="mt-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">VR Headset Experience</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Put on your VR headset for a fully immersive experience. Supports Oculus, HTC Vive, and WebXR compatible devices.
                </p>
                <div className="flex items-center space-x-2 mb-3">
                  <Badge variant={deviceSupport.webXR ? "default" : "destructive"}>
                    {deviceSupport.webXR ? "VR Ready" : "VR Not Available"}
                  </Badge>
                  {deviceSupport.webXR && (
                    <Badge variant="outline">WebXR Supported</Badge>
                  )}
                </div>
                <Button
                  onClick={() => startVRExperience('vr')}
                  disabled={!deviceSupport.webXR || isLoading}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isLoading ? 'Initializing VR...' : 'Enter VR Mode'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="ar" className="mt-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Augmented Reality</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Use your mobile device to place the property in your real environment using AR technology.
                </p>
                <div className="flex items-center space-x-2 mb-3">
                  <Badge variant={deviceSupport.webXR ? "default" : "destructive"}>
                    {deviceSupport.webXR ? "AR Ready" : "AR Not Available"}
                  </Badge>
                  {deviceSupport.gyroscope && (
                    <Badge variant="outline">Gyroscope Detected</Badge>
                  )}
                </div>
                <Button
                  onClick={() => startVRExperience('ar')}
                  disabled={!deviceSupport.webXR || isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? 'Loading AR...' : 'Start AR Experience'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* VR Viewer */}
      {isPlaying && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                {currentScene.name}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetView}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-gray-600">{currentScene.description}</p>
          </CardHeader>
          <CardContent>
            {/* VR Container */}
            <div
              ref={vrContainerRef}
              className="relative bg-black rounded-lg overflow-hidden"
              style={{ height: '500px' }}
            >
              {/* Simulated VR/360 View */}
              <div
                className="w-full h-full bg-gradient-to-b from-blue-400 to-blue-600 relative overflow-hidden"
                style={{
                  backgroundImage: `url(${currentScene.panoramaUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {/* VR Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-20" />

                {/* Scene Hotspots */}
                {currentScene.hotspots.map((hotspot, index) => (
                  <div
                    key={index}
                    className="absolute w-6 h-6 bg-white bg-opacity-90 rounded-full border-2 border-purple-500 cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform group"
                    style={{
                      left: `${hotspot.x}%`,
                      top: `${hotspot.y}%`
                    }}
                    onClick={() => hotspot.linkedSceneId && navigateToScene(hotspot.linkedSceneId)}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      {hotspot.type === 'navigation' && <Navigation className="h-3 w-3 text-purple-600" />}
                      {hotspot.type === 'info' && <div className="w-2 h-2 bg-purple-600 rounded-full" />}
                      {hotspot.type === 'measurement' && <div className="w-2 h-2 bg-yellow-600 rounded-full" />}
                    </div>

                    {/* Hotspot Tooltip */}
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      <div className="font-semibold">{hotspot.title}</div>
                      <div>{hotspot.description}</div>
                    </div>
                  </div>
                ))}

                {/* VR Mode Indicator */}
                {isVRMode && (
                  <div className="absolute top-4 left-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    VR MODE ACTIVE
                  </div>
                )}

                {/* Viewing Mode Badge */}
                <div className="absolute top-4 right-4">
                  <Badge className="bg-black bg-opacity-70 text-white">
                    {viewerMode === 'panorama' && '360° View'}
                    {viewerMode === 'vr' && 'VR Mode'}
                    {viewerMode === 'ar' && 'AR Mode'}
                  </Badge>
                </div>

                {/* Navigation Instructions */}
                <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white p-3 rounded-lg text-sm">
                  <div className="font-semibold mb-1">Navigation:</div>
                  <div>• Click and drag to look around</div>
                  <div>• Click hotspots to explore</div>
                  <div>• Use scroll to zoom</div>
                </div>
              </div>
            </div>

            {/* VR Controls */}
            <div className="mt-4 space-y-4">
              {/* Playback Controls */}
              <div className="flex items-center justify-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Rotation Speed:</span>
                  <div className="w-32">
                    <Slider
                      value={rotationSpeed}
                      onValueChange={setRotationSpeed}
                      max={3}
                      min={0}
                      step={0.5}
                    />
                  </div>
                </div>
              </div>

              {/* Scene Quality Info */}
              <div className="text-center text-sm text-gray-600">
                Quality: {currentTour.quality} • Scene: {currentScene.name}
                {currentScene.vrFeatures.supportsVR && <Badge className="ml-2 text-xs">VR Ready</Badge>}
                {currentScene.vrFeatures.supportsAR && <Badge className="ml-1 text-xs bg-green-100 text-green-800">AR Ready</Badge>}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scene Navigation */}
      <Card>
        <CardHeader>
          <CardTitle>Tour Scenes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {currentTour.scenes.map((scene) => (
              <div
                key={scene.id}
                className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                  currentScene?.id === scene.id
                    ? 'border-purple-500 ring-2 ring-purple-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setCurrentScene(scene)}
              >
                <div className="aspect-video">
                  <img
                    src={scene.thumbnailUrl}
                    alt={scene.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
                  <div className="p-2 w-full">
                    <h4 className="text-white font-semibold text-sm">{scene.name}</h4>
                  </div>
                </div>
                {currentScene?.id === scene.id && (
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Device Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Headphones className="h-5 w-5 mr-2" />
            Device Compatibility
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-2xl mb-2 ${deviceSupport.webXR ? 'text-green-600' : 'text-gray-400'}`}>
                {deviceSupport.webXR ? '✓' : '✗'}
              </div>
              <div className="text-sm font-medium">WebXR</div>
              <div className="text-xs text-gray-500">VR/AR Support</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl mb-2 ${deviceSupport.gyroscope ? 'text-green-600' : 'text-gray-400'}`}>
                {deviceSupport.gyroscope ? '✓' : '✗'}
              </div>
              <div className="text-sm font-medium">Gyroscope</div>
              <div className="text-xs text-gray-500">Motion Sensing</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl mb-2 ${deviceSupport.fullscreen ? 'text-green-600' : 'text-gray-400'}`}>
                {deviceSupport.fullscreen ? '✓' : '✗'}
              </div>
              <div className="text-sm font-medium">Fullscreen</div>
              <div className="text-xs text-gray-500">Immersive View</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2 text-green-600">✓</div>
              <div className="text-sm font-medium">360° View</div>
              <div className="text-xs text-gray-500">Always Available</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
