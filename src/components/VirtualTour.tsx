"use client";

import { useState } from "react";
import { Play, Maximize2, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface VirtualTourProps {
  url?: string;
  title?: string;
}

export default function VirtualTour({ url, title = "Virtual Tour" }: VirtualTourProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // For demo purposes, using a placeholder tour
  const tourUrl = url || "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1";

  const startTour = () => {
    setIsPlaying(true);
  };

  if (!isPlaying) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Play className="h-5 w-5 mr-2 text-blue-600" />
            Virtual Tour
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Tour Preview */}
            <div
              className="relative h-64 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg cursor-pointer group overflow-hidden"
              onClick={startTour}
            >
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="w-full h-full" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}></div>
              </div>

              {/* Content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="bg-white bg-opacity-20 rounded-full p-6 mb-4 group-hover:bg-opacity-30 transition-all">
                    <Play className="h-12 w-12 text-white ml-1" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">360° Virtual Tour</h3>
                  <p className="text-white text-opacity-90">
                    Explore every corner of this property from the comfort of your home
                  </p>
                </div>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
            </div>

            {/* Tour Features */}
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full p-2 w-fit mx-auto mb-2">
                  <Maximize2 className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-sm font-medium">360° Views</div>
                <div className="text-xs text-gray-500">Full panoramic experience</div>
              </div>
              <div className="text-center">
                <div className="bg-green-100 rounded-full p-2 w-fit mx-auto mb-2">
                  <Play className="h-4 w-4 text-green-600" />
                </div>
                <div className="text-sm font-medium">HD Quality</div>
                <div className="text-xs text-gray-500">Crystal clear imagery</div>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 rounded-full p-2 w-fit mx-auto mb-2">
                  <Volume2 className="h-4 w-4 text-purple-600" />
                </div>
                <div className="text-sm font-medium">Audio Guide</div>
                <div className="text-xs text-gray-500">Professional narration</div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Button onClick={startTour} size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Play className="h-5 w-5 mr-2" />
                Start Virtual Tour
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Play className="h-5 w-5 mr-2 text-blue-600" />
            Virtual Tour
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPlaying(false)}
            >
              Close Tour
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
            {/* Virtual Tour Iframe */}
            <iframe
              src={`${tourUrl}&mute=${isMuted ? 1 : 0}`}
              width="100%"
              height="100%"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
              title="Virtual Property Tour"
            />
          </div>

          {/* Tour Navigation */}
          <div className="mt-4 bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between text-sm">
              <div className="text-gray-600">
                💡 <strong>Tip:</strong> Use your mouse to look around and click hotspots to navigate
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">Quality:</span>
                <select className="text-sm border rounded px-2 py-1">
                  <option>HD</option>
                  <option>4K</option>
                  <option>Auto</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tour Information */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">About This Virtual Tour</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Professional 360° photography with 4K resolution</li>
              <li>• Interactive hotspots with detailed room information</li>
              <li>• Floor plan navigation for easy orientation</li>
              <li>• Measurements and annotations available</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
