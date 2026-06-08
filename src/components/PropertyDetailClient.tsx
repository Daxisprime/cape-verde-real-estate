"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Heart, Share2, MapPin, Bed, Bath, Square, Car, Phone, Mail, MessageCircle, Brain, Monitor, Shield, Sparkles } from "lucide-react";
import { useMountedState } from "@/lib/mounting";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import PhotoGallery from "@/components/PhotoGallery";
import PropertyContactForm from "@/components/PropertyContactForm";
import VirtualTour from "@/components/VirtualTour";
import ViewingScheduler from "@/components/ViewingScheduler";
import AIValuationEngine from "@/components/AIValuationEngine";
import VRPropertyTours from "@/components/VRPropertyTours";
import BlockchainIntegration from "@/components/BlockchainIntegration";

interface PropertyDetailClientProps {
  property: {
    id: string;
    title: string;
    titlePt: string;
    titleCv: string;
    price: number;
    location: string;
    island: string;
    type: string;
    bedrooms: number;
    bathrooms: number;
    area: number;
    lotSize: number;
    yearBuilt: number;
    parking: number;
    featured: boolean;
    description: string;
    descriptionPt: string;
    descriptionCv: string;
    features: string[];
    featuresPt: string[];
    featuresCv: string[];
    images: string[];
    virtualTourUrl: string;
    agent: {
      name: string;
      company: string;
      phone: string;
      email: string;
      avatar: string;
    };
    coordinates: number[];
    priceHistory: Array<{ date: string; price: number }>;
  };
}

export default function PropertyDetailClient({ property }: PropertyDetailClientProps) {
  const router = useRouter();
  const isMounted = useMountedState();
  const { currentLanguage } = useLanguage();
  const { isFavorite, addToFavorites, removeFromFavorites, addToViewingHistory, isAuthenticated } = useAuth();
  const { createPropertyInquiry } = useChat();
  const [isViewingSchedulerOpen, setIsViewingSchedulerOpen] = useState(false);

  const handleAskQuestion = () => {
    if (!isAuthenticated) {
      // Could trigger login modal
      return;
    }

    createPropertyInquiry(
      property.id,
      property.agent.name,
      `Hi ${property.agent.name}, I have some questions about the property "${getPropertyTitle()}" in ${property.location}. Could you please provide more details?`
    ).catch(console.error);
  };

  // Add to user's viewing history
  React.useEffect(() => {
    addToViewingHistory(property.id);
  }, [property.id, addToViewingHistory]);

  const getPropertyTitle = () => {
    switch (currentLanguage) {
      case 'pt': return property.titlePt;
      case 'cv': return property.titleCv;
      default: return property.title;
    }
  };

  const getPropertyDescription = () => {
    switch (currentLanguage) {
      case 'pt': return property.descriptionPt;
      case 'cv': return property.descriptionCv;
      default: return property.description;
    }
  };

  const getPropertyFeatures = () => {
    switch (currentLanguage) {
      case 'pt': return property.featuresPt;
      case 'cv': return property.featuresCv;
      default: return property.features;
    }
  };

  const handleFavoriteToggle = () => {
    if (isFavorite(property.id)) {
      removeFromFavorites(property.id);
    } else {
      addToFavorites(property.id);
    }
  };

  // Convert property data for next-gen components
  const aiValuationFeatures = {
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    area: property.area,
    lotSize: property.lotSize,
    yearBuilt: property.yearBuilt,
    location: property.location,
    island: property.island,
    propertyType: property.type.toLowerCase(),
    oceanView: property.features.some(f => f.toLowerCase().includes('ocean view')),
    beachAccess: property.features.some(f => f.toLowerCase().includes('beach')),
    pool: property.features.some(f => f.toLowerCase().includes('pool')),
    garage: property.parking > 0,
    solarPanels: property.features.some(f => f.toLowerCase().includes('solar')),
    modernKitchen: property.features.some(f => f.toLowerCase().includes('kitchen')),
    airConditioning: property.features.some(f => f.toLowerCase().includes('air conditioning')),
    securitySystem: property.features.some(f => f.toLowerCase().includes('security'))
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Properties
            </Link>
            {isMounted && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFavoriteToggle}
                  className={isFavorite(property.id) ? "bg-red-50 border-red-200 text-red-600" : ""}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isFavorite(property.id) ? "fill-current" : ""}`} />
                  {isFavorite(property.id) ? "Saved" : "Save"}
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100"
                  onClick={() => router.push(`/map?property=${property.id}&lat=${property.coordinates[1]}&lng=${property.coordinates[0]}&zoom=17`)}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  View on Map
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Photo Gallery */}
            <PhotoGallery images={property.images} title={getPropertyTitle()} />

            {/* Property Info */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-3xl font-bold">{getPropertyTitle()}</CardTitle>
                    <div className="flex items-center text-gray-600 mt-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{property.location}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">
                      €{property.price.toLocaleString()}
                    </div>
                    {property.featured && (
                      <Badge className="bg-red-600 text-white mt-2">Featured</Badge>
                    )}
                  </div>
                </div>

                {/* View on Map Button */}
                {isMounted && (
                  <div className="mt-4 flex justify-end">
                    <Button
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => router.push(`/map?property=${property.id}&lat=${property.coordinates[1]}&lng=${property.coordinates[0]}&zoom=17`)}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      View on Map
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <Bed className="h-6 w-6 mx-auto text-gray-400 mb-2" />
                    <div className="font-semibold">{property.bedrooms}</div>
                    <div className="text-sm text-gray-500">Bedrooms</div>
                  </div>
                  <div className="text-center">
                    <Bath className="h-6 w-6 mx-auto text-gray-400 mb-2" />
                    <div className="font-semibold">{property.bathrooms}</div>
                    <div className="text-sm text-gray-500">Bathrooms</div>
                  </div>
                  <div className="text-center">
                    <Square className="h-6 w-6 mx-auto text-gray-400 mb-2" />
                    <div className="font-semibold">{property.area}m²</div>
                    <div className="text-sm text-gray-500">Floor Area</div>
                  </div>
                  <div className="text-center">
                    <Car className="h-6 w-6 mx-auto text-gray-400 mb-2" />
                    <div className="font-semibold">{property.parking}</div>
                    <div className="text-sm text-gray-500">Parking</div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div>
                  <h3 className="text-xl font-bold mb-4">Property Description</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {getPropertyDescription()}
                  </p>
                </div>


              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle>Property Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {getPropertyFeatures().map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Next-Generation PropTech Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
                  PropTech Features
                  <Badge className="ml-2 bg-purple-100 text-purple-800">Next-Gen</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="vr-tours" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="vr-tours" className="flex items-center">
                      <Monitor className="h-4 w-4 mr-2" />
                      VR Tours
                    </TabsTrigger>
                    <TabsTrigger value="ai-valuation" className="flex items-center">
                      <Brain className="h-4 w-4 mr-2" />
                      AI Valuation
                    </TabsTrigger>
                    <TabsTrigger value="blockchain" className="flex items-center">
                      <Shield className="h-4 w-4 mr-2" />
                      Blockchain
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="vr-tours" className="mt-6">
                    <VRPropertyTours
                      propertyId={property.id}
                      propertyTitle={getPropertyTitle()}
                    />
                  </TabsContent>

                  <TabsContent value="ai-valuation" className="mt-6">
                    <AIValuationEngine
                      propertyId={property.id}
                      initialFeatures={aiValuationFeatures}
                    />
                  </TabsContent>

                  <TabsContent value="blockchain" className="mt-6">
                    <BlockchainIntegration
                      propertyId={property.id}
                      propertyTitle={getPropertyTitle()}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Virtual Tour */}
            <VirtualTour url={property.virtualTourUrl} />

            {/* Property Details */}
            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-500">Property Type:</span>
                    <span className="ml-2 font-semibold">{property.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Year Built:</span>
                    <span className="ml-2 font-semibold">{property.yearBuilt}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Lot Size:</span>
                    <span className="ml-2 font-semibold">{property.lotSize}m²</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Island:</span>
                    <span className="ml-2 font-semibold">{property.island}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Agent Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Agent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-4">
                  <Image
                    src={property.agent.avatar}
                    alt={property.agent.name}
                    width={60}
                    height={60}
                    className="rounded-full mr-4"
                  />
                  <div>
                    <div className="font-semibold">{property.agent.name}</div>
                    <div className="text-sm text-gray-500">{property.agent.company}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    className="w-full bg-red-600 hover:bg-red-700"
                    onClick={() => window.open(`tel:${property.agent.phone}`, '_self')}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call Agent
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(`mailto:${property.agent.email}`, '_self')}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email Agent
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setIsViewingSchedulerOpen(true)}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Schedule Viewing
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100"
                    onClick={handleAskQuestion}
                    disabled={!isAuthenticated}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Ask a Question
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Property Contact Form */}
            <PropertyContactForm
              isOpen={true}
              onClose={() => {}}
              property={{
                id: property.id,
                title: property.title,
                price: property.price,
                location: property.location,
                island: property.island,
                type: property.type,
                bedrooms: property.bedrooms,
                bathrooms: property.bathrooms,
                totalArea: property.area,
                images: property.images,
                features: property.features,
                description: property.description,
                isFeatured: property.featured,
                coordinates: property.coordinates as [number, number],
                pricePerSqm: Math.round(property.price / property.area),
                yearBuilt: property.yearBuilt,
                furnished: false,
                oceanView: false,
                beachDistance: 1000,
                agentId: 'agent-demo',
                listingDate: '2024-01-01',
                propertyId: property.id
              }} />

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Price Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Property Price:</span>
                    <span className="font-semibold">€{property.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price per m²:</span>
                    <span className="font-semibold">€{Math.round(property.price / property.area).toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Last Updated:</span>
                    <span>Today</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* PropTech Quick Access */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="h-4 w-4 mr-2 text-purple-600" />
                  PropTech Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push(`/map?property=${property.id}&lat=${property.coordinates[1]}&lng=${property.coordinates[0]}&zoom=17`)}
                >
                  <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                  View Property on Map
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push('/ai-valuation')}
                >
                  <Brain className="h-4 w-4 mr-2 text-purple-600" />
                  AI Property Valuation
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push('/vr-tours')}
                >
                  <Monitor className="h-4 w-4 mr-2 text-purple-600" />
                  Virtual Reality Tours
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push('/blockchain')}
                >
                  <Shield className="h-4 w-4 mr-2 text-indigo-600" />
                  Blockchain Verification
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Viewing Scheduler Modal */}
      <ViewingScheduler
        isOpen={isViewingSchedulerOpen}
        onClose={() => setIsViewingSchedulerOpen(false)}
        property={{
          id: property.id,
          title: getPropertyTitle(),
          location: property.location,
          image: property.images[0],
          agent: property.agent
        }}
        mode="book"
      />
    </div>
  );
}
