"use client";

import Link from "next/link";
import { Brain, Monitor, Smartphone, Shield, BarChart3, Sparkles, ArrowRight, Zap, Target, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PropTechShowcase() {
  const propTechFeatures = [
    {
      id: "ai-valuation",
      title: "AI Property Valuation",
      description: "Get instant, ML-powered property valuations with 95% accuracy using advanced algorithms and comprehensive market data.",
      icon: Brain,
      color: "purple",
      href: "/ai-valuation",
      badge: "AI-Powered",
      stats: "95% Accuracy",
      gradient: "from-purple-600 to-blue-600"
    },
    {
      id: "vr-tours",
      title: "Virtual Reality Tours",
      description: "Experience immersive 360° VR property tours from anywhere in the world with WebXR technology.",
      icon: Monitor,
      color: "pink",
      href: "/vr-tours",
      badge: "Immersive",
      stats: "360° Experience",
      gradient: "from-purple-600 to-pink-600"
    },
    {
      id: "mobile-app",
      title: "Progressive Web App",
      description: "Native app experience with offline capabilities, push notifications, and real-time property alerts.",
      icon: Smartphone,
      color: "blue",
      href: "/mobile-app",
      badge: "PWA Ready",
      stats: "Offline Capable",
      gradient: "from-blue-600 to-green-600"
    },
    {
      id: "blockchain",
      title: "Blockchain Verification",
      description: "Secure property ownership verification with smart contracts and NFT certificates on the blockchain.",
      icon: Shield,
      color: "indigo",
      href: "/blockchain",
      badge: "Secure",
      stats: "Blockchain Verified",
      gradient: "from-purple-600 to-indigo-600"
    },
    {
      id: "analytics",
      title: "Market Analytics",
      description: "AI-powered market predictions, investment insights, and comprehensive real estate intelligence.",
      icon: BarChart3,
      color: "blue",
      href: "/analytics",
      badge: "Predictive",
      stats: "Market Intelligence",
      gradient: "from-blue-600 to-purple-600"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 text-purple-600 mr-3" />
            <Badge className="bg-purple-100 text-purple-800 text-lg px-4 py-1">
              Revolutionary PropTech
            </Badge>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Next-Generation Real Estate Technology
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Experience the future of property search with AI, VR, blockchain, and advanced analytics.
            ProCV leads the PropTech revolution in Cape Verde.
          </p>
        </div>

        {/* Main Feature Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* AI Valuation - Large Feature */}
          <Card className="lg:row-span-2 overflow-hidden border-0 shadow-xl bg-gradient-to-br from-purple-600 to-blue-600 text-white">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-4">
                <Brain className="h-12 w-12 text-white" />
                <Badge className="bg-white bg-opacity-20 text-white">AI-Powered</Badge>
              </div>
              <CardTitle className="text-3xl font-bold mb-2">
                AI Property Valuation
              </CardTitle>
              <p className="text-purple-100 text-lg">
                Machine learning algorithms analyze 50+ market factors to provide instant, accurate property valuations with confidence scoring.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold">95%</div>
                  <div className="text-sm text-purple-100">Accuracy Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">&lt;30s</div>
                  <div className="text-sm text-purple-100">Valuation Time</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">50+</div>
                  <div className="text-sm text-purple-100">Market Factors</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">ML</div>
                  <div className="text-sm text-purple-100">Algorithms</div>
                </div>
              </div>
              <Link href="/ai-valuation">
                <Button className="w-full bg-white text-purple-600 hover:bg-gray-100 font-semibold">
                  <Brain className="h-4 w-4 mr-2" />
                  Try AI Valuation
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* VR Tours */}
          <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-purple-600 to-pink-600 text-white">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Monitor className="h-8 w-8 text-white" />
                <Badge className="bg-white bg-opacity-20 text-white">Immersive</Badge>
              </div>
              <CardTitle className="text-xl font-bold">Virtual Reality Tours</CardTitle>
              <p className="text-purple-100 text-sm">
                360° VR experiences with WebXR support
              </p>
            </CardHeader>
            <CardContent>
              {/* VR Tour Demo Image */}
              <div className="mb-4 bg-white bg-opacity-10 rounded-lg p-4">
                <div className="aspect-video bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-black bg-opacity-20" />
                  {/* VR Interface Elements */}
                  <div className="absolute top-3 left-3 flex space-x-2">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                    <div className="w-3 h-3 bg-white rounded-full opacity-60" />
                    <div className="w-3 h-3 bg-white rounded-full opacity-60" />
                  </div>
                  <div className="absolute top-3 right-3 bg-white bg-opacity-20 px-2 py-1 rounded text-xs">
                    360° VIEW
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="bg-white bg-opacity-20 rounded p-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span>🏠 Living Room</span>
                        <span>👆 Click & Drag</span>
                      </div>
                    </div>
                  </div>
                  {/* Hotspot indicators */}
                  <div className="absolute top-1/2 left-1/3 w-4 h-4 bg-white rounded-full border-2 border-purple-300 animate-ping" />
                  <div className="absolute top-2/3 right-1/4 w-4 h-4 bg-white rounded-full border-2 border-purple-300" />
                </div>
              </div>
              <Link href="/vr-tours">
                <Button className="w-full bg-white text-purple-600 hover:bg-gray-100">
                  <Monitor className="h-4 w-4 mr-2" />
                  Experience VR
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Mobile App */}
          <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-blue-600 to-green-600 text-white">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Smartphone className="h-8 w-8 text-white" />
                <Badge className="bg-white bg-opacity-20 text-white">PWA Ready</Badge>
              </div>
              <CardTitle className="text-xl font-bold">Mobile App Platform</CardTitle>
              <p className="text-blue-100 text-sm">
                Native experience with offline capabilities
              </p>
            </CardHeader>
            <CardContent>
              {/* Mobile App Demo */}
              <div className="mb-4 flex justify-center">
                <div className="w-32 h-56 bg-white bg-opacity-10 rounded-2xl p-2">
                  <div className="w-full h-full bg-gradient-to-b from-white to-gray-100 rounded-xl relative overflow-hidden">
                    {/* Mobile Header */}
                    <div className="bg-blue-600 text-white p-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold">pro•cv</span>
                        <div className="flex space-x-1">
                          <div className="w-3 h-1 bg-white rounded" />
                          <div className="w-1 h-1 bg-white rounded" />
                          <div className="w-2 h-1 bg-white rounded" />
                        </div>
                      </div>
                    </div>

                    {/* Search Bar */}
                    <div className="p-2">
                      <div className="bg-gray-200 rounded text-xs p-1 mb-2">
                        🔍 Search properties...
                      </div>
                    </div>

                    {/* Property Cards */}
                    <div className="px-2 space-y-1">
                      <div className="bg-blue-50 rounded p-1">
                        <div className="w-full h-6 bg-blue-200 rounded mb-1" />
                        <div className="text-xs text-blue-800">€450k</div>
                      </div>
                      <div className="bg-green-50 rounded p-1">
                        <div className="w-full h-6 bg-green-200 rounded mb-1" />
                        <div className="text-xs text-green-800">€320k</div>
                      </div>
                    </div>

                    {/* Bottom Navigation */}
                    <div className="absolute bottom-1 left-1 right-1 bg-gray-100 rounded flex justify-around p-1">
                      <div className="w-4 h-2 bg-blue-600 rounded text-xs" />
                      <div className="w-4 h-2 bg-gray-300 rounded" />
                      <div className="w-4 h-2 bg-gray-300 rounded" />
                    </div>

                    {/* PWA Indicator */}
                    <div className="absolute top-8 right-1 bg-green-500 rounded-full w-2 h-2" />
                  </div>
                </div>
              </div>
              <Link href="/mobile-app">
                <Button className="w-full bg-white text-blue-600 hover:bg-gray-100">
                  <Smartphone className="h-4 w-4 mr-2" />
                  Get Mobile App
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Blockchain */}
          <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <Shield className="h-6 w-6 text-indigo-600" />
                </div>
                <Badge className="bg-indigo-100 text-indigo-800">Secure</Badge>
              </div>
              <CardTitle className="text-lg font-bold text-gray-900">Blockchain Verification</CardTitle>
              <p className="text-gray-600 text-sm">
                Property ownership verification with smart contracts and NFT certificates
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  <Zap className="h-4 w-4 inline mr-1" />
                  Ethereum & Polygon
                </div>
                <Link href="/blockchain">
                  <Button variant="outline" size="sm">
                    Learn More
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Analytics */}
          <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <Badge className="bg-blue-100 text-blue-800">Predictive</Badge>
              </div>
              <CardTitle className="text-lg font-bold text-gray-900">Market Analytics</CardTitle>
              <p className="text-gray-600 text-sm">
                AI-powered market predictions and comprehensive investment insights
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  <Target className="h-4 w-4 inline mr-1" />
                  Investment Intelligence
                </div>
                <Link href="/analytics">
                  <Button variant="outline" size="sm">
                    View Analytics
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
            <Globe className="h-12 w-12 mx-auto mb-4 text-white" />
            <h3 className="text-3xl font-bold mb-4">
              Leading PropTech Innovation in Cape Verde
            </h3>
            <p className="text-lg text-purple-100 mb-6 max-w-2xl mx-auto">
              Join thousands of users experiencing the future of real estate with ProCV's revolutionary technology platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/ai-valuation">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 font-semibold">
                  <Brain className="h-5 w-5 mr-2" />
                  Start AI Valuation
                </Button>
              </Link>
              <Link href="/vr-tours">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
                  <Monitor className="h-5 w-5 mr-2" />
                  Experience VR Tours
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
