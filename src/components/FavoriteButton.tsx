'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import type { FavoriteButtonProps } from '@/types/favorites';

export default function FavoriteButton({
  propertyId,
  initialFavorited = false,
  onToggle,
  size = 'md',
  className
}: FavoriteButtonProps) {
  const { isAuthenticated, user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isLoading, setIsLoading] = useState(false);

  const checkFavoriteStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await fetch(`/api/favorites/${propertyId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsFavorited(data.favorited);
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  }, [propertyId]);

  // Check favorite status on mount if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      checkFavoriteStatus();
    }
  }, [isAuthenticated, user, propertyId, checkFavoriteStatus]);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      // Show auth modal or redirect to login
      alert('Please sign in to save properties to favorites');
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }

      const method = isFavorited ? 'DELETE' : 'POST';
      const response = await fetch(`/api/favorites/${propertyId}`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const newFavoritedState = !isFavorited;
        setIsFavorited(newFavoritedState);
        onToggle?.(newFavoritedState);
      } else {
        const errorData = await response.json();
        console.error('Failed to toggle favorite:', errorData.error);
        alert('Failed to update favorites. Please try again.');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-8 w-8 p-0';
      case 'lg':
        return 'h-12 w-12 p-0';
      default:
        return 'h-10 w-10 p-0';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4';
      case 'lg':
        return 'h-6 w-6';
      default:
        return 'h-5 w-5';
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className={cn(
        getSizeClasses(),
        'rounded-full border-2 border-white bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-200',
        isFavorited && 'bg-red-50 border-red-200 hover:bg-red-100',
        isLoading && 'opacity-50 cursor-not-allowed',
        className
      )}
      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        className={cn(
          getIconSize(),
          'transition-all duration-200',
          isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600 hover:text-red-500'
        )}
      />
    </Button>
  );
}

// Favorite count component for displaying number of favorites
export function FavoriteCount({
  count,
  className
}: {
  count: number;
  className?: string;
}) {
  if (count === 0) return null;

  return (
    <div className={cn(
      'flex items-center space-x-1 text-sm text-gray-500',
      className
    )}>
      <Heart className="h-4 w-4 fill-red-500 text-red-500" />
      <span>{count.toLocaleString()}</span>
    </div>
  );
}

// Favorite indicator for property cards
export function FavoriteIndicator({
  isFavorited,
  className
}: {
  isFavorited: boolean;
  className?: string;
}) {
  if (!isFavorited) return null;

  return (
    <div className={cn(
      'absolute top-2 right-2 bg-red-100 border border-red-200 rounded-full p-2',
      className
    )}>
      <Heart className="h-4 w-4 fill-red-500 text-red-500" />
    </div>
  );
}
