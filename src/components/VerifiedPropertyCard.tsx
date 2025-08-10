"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Heart, MapPin, Bed, Bath, Square, Share2, GitCompare
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMountedState } from '@/lib/mounting';
import { useAuth } from '@/contexts/AuthContext';

import { type Property } from '@/data/cape-verde-properties';

interface VerifiedPropertyCardProps {
  property: Property;
  showVerificationDetails?: boolean;
  className?: string;
  enableComparison?: boolean;
  onCompareToggle?: (property: Property, selected: boolean) => void;
  isInComparison?: boolean;
}

export default function VerifiedPropertyCard({
  property,
  showVerificationDetails = false,
  className = '',
  enableComparison = false,
  onCompareToggle,
  isInComparison = false
}: VerifiedPropertyCardProps) {
  const router = useRouter();
  const isMounted = useMountedState();
  const { user, addToFavorites, removeFromFavorites, isFavorite, addToViewingHistory } = useAuth();

  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const handleCardClick = () => {
    // Add to viewing history
    if (user) {
      addToViewingHistory(property.id);
    }
    router.push(`/property/${property.id}`);
  };

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      // Redirect to login or show auth modal
      router.push('/login');
      return;
    }

    if (isFavorite(property.id)) {
      removeFromFavorites(property.id);
    } else {
      addToFavorites(property.id);
    }
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: `Check out this property in ${property.location}`,
        url: window.location.origin + `/property/${property.id}`
      });
    } else {
      navigator.clipboard.writeText(window.location.origin + `/property/${property.id}`);
      // In a real app, you'd show a toast notification here
      alert('Property link copied to clipboard!');
    }
  };

  const handleCompareToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCompareToggle) {
      onCompareToggle(property, !isInComparison);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      <Card
        className={`group relative overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer ${
          isInComparison ? 'ring-2 ring-blue-500 bg-blue-50' : ''
        } ${className}`}
        onClick={handleCardClick}
      >
        {/* Property Image */}
        <div className="relative h-48 sm:h-56 overflow-hidden">
          <Image
            src={property.images[0] || "/api/placeholder/400/300"}
            alt={property.title}
            fill
            className={`object-cover group-hover:scale-105 transition-transform duration-300 ${
              isImageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setIsImageLoaded(true)}
          />

          {/* Image overlay for loading */}
          {!isImageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="w-8 h-8 bg-gray-300 rounded"></div>
            </div>
          )}




        </div>

        {/* Property Content */}
        <CardContent className="p-4">
          <div className="mb-3">
            <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-blue-600 transition-colors mb-2">
              {property.title}
            </h3>
            <div className="flex items-center text-gray-600 text-sm mb-2">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{property.location}, {property.island}</span>
            </div>
          </div>

          {/* Price */}
          <div className="mb-3">
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(property.price)}
            </div>
            <div className="text-sm text-gray-500">
              {formatCurrency(property.pricePerSqm)}/m²
            </div>
          </div>

          {/* Property Details - Clean and simple */}
          <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
            <div className="flex items-center space-x-4">
              {property.bedrooms && property.bedrooms > 0 && (
                <div className="flex items-center">
                  <Bed className="h-4 w-4 mr-1 text-gray-600" />
                  <span>{property.bedrooms}</span>
                </div>
              )}
              {property.bathrooms && property.bathrooms > 0 && (
                <div className="flex items-center">
                  <Bath className="h-4 w-4 mr-1 text-gray-600" />
                  <span>{property.bathrooms}</span>
                </div>
              )}
              <div className="flex items-center">
                <Square className="h-4 w-4 mr-1 text-gray-600" />
                <span>{property.totalArea}m²</span>
              </div>
            </div>
          </div>

          {/* Action buttons moved to content area */}
          {isMounted && (
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={handleFavoriteToggle}
              >
                <Heart className={`h-4 w-4 ${
                  user && isFavorite(property.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'
                }`} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={handleShareClick}
              >
                <Share2 className="h-4 w-4 text-gray-600" />
              </Button>
              {enableComparison && (
                <Button
                  variant={isInComparison ? "default" : "outline"}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={handleCompareToggle}
                >
                  <GitCompare className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}

          {/* Comparison indicator */}
          {isInComparison && (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700 text-center">
              Added to comparison
            </div>
          )}
        </CardContent>
      </Card>


    </>
  );
}
