"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, ExternalLink, Copy, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function MapboxInstructions() {
  const [copied, setCopied] = useState(false);

  const envExample = `# Add this to your .env.local file:
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoieW91cl91c2VybmFtZSIsImEiOiJjbXl0b2tlbiJ9.your_token_here`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(envExample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="h-6 w-6 mr-2 text-blue-600" />
          🗺️ Real Map Integration Setup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-bold text-blue-900 mb-2">🎉 Mapbox Integration Ready!</h3>
          <p className="text-blue-800 text-sm">
            Your Cape Verde real estate platform now supports real interactive maps with zoom,
            satellite view, and precise property locations!
          </p>
        </div>

        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <div className="flex items-center mb-2">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3">1</span>
              <h4 className="font-semibold">Get Your Mapbox Account</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Sign up for a free Mapbox account to get your API token:
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://account.mapbox.com/auth/signup/', '_blank')}
              className="flex items-center"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Create Mapbox Account
            </Button>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex items-center mb-2">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3">2</span>
              <h4 className="font-semibold">Get Your Access Token</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              After signing up, go to your account dashboard and copy your "Default public token"
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://account.mapbox.com/access-tokens/', '_blank')}
              className="flex items-center"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Get Access Token
            </Button>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex items-center mb-2">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3">3</span>
              <h4 className="font-semibold">Add to Environment Variables</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Add your token to the .env.local file in your project root:
            </p>
            <div className="bg-gray-100 rounded p-3 text-sm font-mono relative">
              <pre className="whitespace-pre-wrap">{envExample}</pre>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
                className="absolute top-2 right-2 h-6 w-6 p-0"
              >
                {copied ? (
                  <CheckCircle className="h-3 w-3 text-green-600" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex items-center mb-2">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3">4</span>
              <h4 className="font-semibold">Restart Development Server</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Restart your development server to load the new environment variable:
            </p>
            <div className="bg-gray-100 rounded p-3 text-sm font-mono">
              <code>bun run dev</code>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-bold text-green-900 mb-2">🎯 What You'll Get:</h3>
          <ul className="text-green-800 text-sm space-y-1">
            <li>• Real Cape Verde geography with streets and landmarks</li>
            <li>• Zoom in/out functionality for detailed exploration</li>
            <li>• Satellite and street view options</li>
            <li>• Precise property markers at actual locations</li>
            <li>• Interactive popups with property details</li>
            <li>• Professional map controls and navigation</li>
          </ul>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>💡 <strong>Tip:</strong> Mapbox offers 50,000 free map loads per month, perfect for testing and small deployments!</p>
        </div>
      </CardContent>
    </Card>
  );
}
