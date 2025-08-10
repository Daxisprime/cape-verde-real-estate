"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  X, Heart, Share2, MapPin, Bed, Bath, Square, Calendar,
  TrendingUp, Phone, Mail, MessageCircle, ChevronLeft, ChevronRight,
  Home, Car, Waves, Mountain, Star, Eye
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import ViewingScheduler from '@/components/ViewingScheduler';
import PropertyContactForm from '@/components/PropertyContactForm';

interface PropertyData {
  property_id: string;
  title: string;
  price: number;
  property_type: string;
  island: string;
  total_area: number;
  bedrooms: number;
  bathrooms: number;
  zone_type: string;
  investment_rating: string;
  beach_distance?: number;
  features: string[];
  image: string;
  location: string;
  coordinates: [number, number];
  description: string;
}

interface PropertyDetailModalProps {
  property: PropertyData | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PropertyDetailModal({ property, isOpen, onClose }: PropertyDetailModalProps) {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isViewingSchedulerOpen, setIsViewingSchedulerOpen] = useState(false);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);

  if (!property) return null;

  // Mock additional images for the gallery
  const images = [
    property.image,
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=600&fit=crop"
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const pricePerSqm = Math.round(property.price / property.total_area);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleFavoriteToggle = () => {
    setIsFavorited(!isFavorited);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: `Check out this property in ${property.location}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto p-0">
        <div className="relative">
          {/* Header with close button */}
          <div className="absolute top-4 right-4 z-10">
            <Button
              variant="secondary"
              size="sm"
              className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-lg"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Image Gallery - Larger */}
          <div className="relative h-96 bg-gray-200">
            <Image
              src={images[currentImageIndex]}
              alt={property.title}
              fill
              className="object-cover"
            />

            {/* Image navigation */}
            {images.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0 bg-white/90 hover:bg-white"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0 bg-white/90 hover:bg-white"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>

                {/* Image indicators */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      className={`w-3 h-3 rounded-full ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Property type badge */}
            <div className="absolute top-4 left-4">
              <Badge className="bg-blue-600 text-white text-sm px-3 py-1">
                {property.property_type}
              </Badge>
            </div>
          </div>

          {/* Content - Larger layout */}
          <div className="p-8">
            {/* Header section */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                  {property.title}
                </h1>
                <div className="flex items-center text-gray-600 mb-3">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span className="text-lg">{property.location}</span>
                </div>
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {formatPrice(property.price)}
                </div>
                <div className="text-lg text-gray-500">
                  {formatPrice(pricePerSqm)}/m²
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleFavoriteToggle}
                  className="h-12 w-12 p-0"
                >
                  <Heart className={`h-5 w-5 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleShare}
                  className="h-12 w-12 p-0"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Property details grid - Larger */}
            <div className="grid grid-cols-4 gap-6 mb-8">
              {property.bedrooms > 0 && (
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <Bed className="h-8 w-8 mx-auto mb-3 text-gray-600" />
                  <div className="font-semibold text-2xl">{property.bedrooms}</div>
                  <div className="text-sm text-gray-500">Bedrooms</div>
                </div>
              )}
              {property.bathrooms > 0 && (
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <Bath className="h-8 w-8 mx-auto mb-3 text-gray-600" />
                  <div className="font-semibold text-2xl">{property.bathrooms}</div>
                  <div className="text-sm text-gray-500">Bathrooms</div>
                </div>
              )}
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <Square className="h-8 w-8 mx-auto mb-3 text-gray-600" />
                <div className="font-semibold text-2xl">{property.total_area}m²</div>
                <div className="text-sm text-gray-500">Floor Area</div>
              </div>
              {property.beach_distance && (
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <Waves className="h-8 w-8 mx-auto mb-3 text-gray-600" />
                  <div className="font-semibold text-2xl">{property.beach_distance}m</div>
                  <div className="text-sm text-gray-500">To Beach</div>
                </div>
              )}
            </div>

            <Separator className="my-8" />

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Description</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                {property.description}
              </p>
            </div>

            {/* Features */}
            {property.features.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Features & Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-gray-600">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mr-3" />
                      <span className="text-base">{feature.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator className="my-8" />

            {/* Investment info */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Investment Details</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 text-base">Investment Rating</span>
                  <Badge className="bg-green-600 text-white text-sm">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    {property.investment_rating}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 text-base">Zone Type</span>
                  <span className="font-medium capitalize text-base">
                    {property.zone_type.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact section */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2 text-lg">
                      Interested in this property?
                    </h4>
                    <p className="text-blue-700">
                      Contact our agent for more information or to schedule a viewing
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <Button
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => window.open(`tel:+238260123`)}
                    >
                      <Phone className="h-5 w-5 mr-2" />
                      Call
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-blue-300 text-blue-700"
                      onClick={() => setIsContactFormOpen(true)}
                    >
                      <MessageCircle className="h-5 w-5 mr-2" />
                      Message
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bottom action buttons */}
            <div className="flex space-x-4 mt-8">
              <Button
                className="flex-1 h-12 text-base"
                onClick={() => {
                  onClose();
                  router.push(`/property/${property.property_id}`);
                }}
              >
                <Eye className="h-5 w-5 mr-2" />
                View Full Details
              </Button>
              <Button
                variant="outline"
                className="flex-1 h-12 text-base"
                onClick={() => setIsViewingSchedulerOpen(true)}
              >
                <Calendar className="h-5 w-5 mr-2" />
                Schedule Viewing
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Viewing Scheduler Modal */}
      <ViewingScheduler
        isOpen={isViewingSchedulerOpen}
        onClose={() => setIsViewingSchedulerOpen(false)}
        property={{
          id: property.property_id,
          title: property.title,
          location: property.location,
          image: property.image,
          agent: {
            name: "Property Agent",
            company: "Cape Verde Properties",
            phone: "+238 260 1234",
            email: "agent@procv.com",
            avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face"
          }
        }}
        mode="book"
      />

      {/* Contact Form Modal */}
      <PropertyContactForm
        property={{
          id: property.property_id,
          title: property.title,
          price: property.price,
          location: property.location,
          island: property.island,
          type: property.property_type,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          totalArea: property.total_area,
          images: [property.image],
          features: property.features,
          description: property.description,
          isFeatured: false,
          coordinates: property.coordinates,
          pricePerSqm: Math.round(property.price / property.total_area),
          yearBuilt: 2020,
          furnished: false,
          oceanView: false,
          beachDistance: property.beach_distance || 1000,
          agentId: 'agent-demo',
          listingDate: '2024-01-01',
          propertyId: property.property_id
        }}
        isOpen={isContactFormOpen}
        onClose={() => setIsContactFormOpen(false)}
      />
    </Dialog>
  );
}
