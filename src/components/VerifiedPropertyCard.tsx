"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Heart, MapPin, Bed, Bath, Square, GitCompare, Clock
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMountedState } from '@/lib/mounting';
import { useAuth } from '@/contexts/AuthContext';
import ShareButton from '@/components/ShareButton';
import WhatsAppButton from '@/components/WhatsAppButton';

import { type Property } from '@/data/cape-verde-properties';
import { agentDatabase } from '@/data/cape-verde-properties';

interface VerifiedPropertyCardProps {
  property: Property;
  showVerificationDetails?: boolean;
  className?: string;
  enableComparison?: boolean;
  onCompareToggle?: (property: Property, selected: boolean) => void;
  isInComparison?: boolean;
  onSelect?: (property: Property) => void;
}

export default function VerifiedPropertyCard({
  property,
  showVerificationDetails = false,
  className = '',
  enableComparison = false,
  onCompareToggle,
  isInComparison = false,
  onSelect
}: VerifiedPropertyCardProps) {
  const router = useRouter();
  const isMounted = useMountedState();
  const { user, addToFavorites, removeFromFavorites, isFavorite, addToViewingHistory } = useAuth();

  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const handleCardClick = () => {
    if (user) {
      addToViewingHistory(property.id);
    }
    if (onSelect) {
      onSelect(property);
    } else {
      router.push(`/property/${property.id}`);
    }
  };

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      router.push('/auth');
      return;
    }

    if (isFavorite(property.id)) {
      removeFromFavorites(property.id);
    } else {
      addToFavorites(property.id);
    }
  };

  const agentPhone = property.agentId
    ? (agentDatabase as Record<string, { phone?: string }>)[property.agentId]?.phone || null
    : null;

  function timeAgo(dateStr?: string): string | null {
    if (!dateStr) return null;
    const diff = Date.now() - new Date(dateStr).getTime();
    if (diff < 0) return null;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
  }

  const postedAgo = timeAgo(property.listingDate);

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
          <img
            src={property.images[0]?.replace(/w=800/, 'w=400').replace(/h=600/, 'h=300') || "/api/placeholder/400/300"}
            alt={property.title}
            className={`absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
              isImageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
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
            <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-[#2563EB] transition-colors mb-2">
              {property.title}
            </h3>
            <div className="flex items-center text-gray-600 text-sm mb-2">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{property.location}, {property.island}</span>
            </div>
          </div>

          {/* Price */}
          <div className="mb-3">
            <div className="text-2xl font-bold text-gray-900">
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
            <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-100">
              {/* Left: freshness indicator */}
              <div className="flex items-center gap-1 text-xs text-gray-400">
                {postedAgo && (
                  <>
                    <Clock className="h-3 w-3" />
                    <span>{postedAgo}</span>
                  </>
                )}
              </div>

              {/* Right: action buttons */}
              <div className="flex items-center gap-1.5">
                <WhatsAppButton
                  phone={agentPhone}
                  message={`Olá, estou interessado na propriedade "${property.title}" em ${property.location}. Ainda está disponível?`}
                />
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
                <ShareButton
                  title={property.title}
                  text={`Check out this property in ${property.location}, Cape Verde`}
                  url={`/property/${property.id}`}
                />
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
            </div>
          )}

          {/* Comparison indicator */}
          {isInComparison && (
            <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700 text-center">
              Added to comparison
            </div>
          )}
        </CardContent>
      </Card>


    </>
  );
}
