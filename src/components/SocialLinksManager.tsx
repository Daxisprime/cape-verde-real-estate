'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Globe, Eye, EyeOff, ExternalLink, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type {
  SocialMediaLink,
  SocialPlatform,
  SocialLinksManagerProps,
  SocialPlatformConfig,
  UserSocialProfile
} from '@/types/social';
import { CAPE_VERDE_SOCIAL_PLATFORMS } from '@/types/social';

export default function SocialLinksManager({
  userId,
  userType,
  initialLinks = [],
  onUpdate,
  maxLinks = 8,
  allowedPlatforms
}: SocialLinksManagerProps) {
  const [links, setLinks] = useState<SocialMediaLink[]>(initialLinks);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<SocialMediaLink | null>(null);
  const [newLink, setNewLink] = useState({
    platform: '' as SocialPlatform,
    url: '',
    displayName: '',
    isPublic: true
  });

  const availablePlatforms = allowedPlatforms
    ? CAPE_VERDE_SOCIAL_PLATFORMS.filter(p => allowedPlatforms.includes(p.name.toLowerCase() as SocialPlatform))
    : CAPE_VERDE_SOCIAL_PLATFORMS;

  // Validate social media URL
  const validateUrl = (url: string, platform: SocialPlatform): boolean => {
    if (!url) return false;

    const platformConfig = availablePlatforms.find(p => p.name.toLowerCase() === platform);
    if (!platformConfig) return false;

    // Basic URL validation
    try {
      new URL(url);
      return true;
    } catch {
      // Check if it's a username/handle format
      const urlPattern = platformConfig.urlPattern;
      if (urlPattern.includes('{username}') || urlPattern.includes('{phone}')) {
        return url.length > 0;
      }
      return false;
    }
  };

  // Format URL for storage
  const formatUrl = (url: string, platform: SocialPlatform): string => {
    const platformConfig = availablePlatforms.find(p => p.name.toLowerCase() === platform);
    if (!platformConfig) return url;

    // If it's already a full URL, use it
    try {
      new URL(url);
      return url;
    } catch {
      // Format as full URL
      if (platform === 'whatsapp') {
        // Remove any non-digits and format as WhatsApp link
        const phone = url.replace(/\D/g, '');
        return `https://wa.me/${phone}`;
      } else if (platform === 'website') {
        return url.startsWith('http') ? url : `https://${url}`;
      } else {
        return platformConfig.urlPattern.replace('{username}', url).replace('{phone}', url);
      }
    }
  };

  // Extract display name from URL
  const extractDisplayName = (url: string, platform: SocialPlatform): string => {
    if (platform === 'whatsapp') {
      const phone = url.match(/\d+/)?.[0];
      return phone ? `+${phone}` : url;
    }

    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname.replace('/', '');
      return path.replace('@', '') || urlObj.hostname;
    } catch {
      return url.replace('@', '');
    }
  };

  // Add new social link
  const handleAddLink = () => {
    if (!newLink.platform || !newLink.url) return;

    if (!validateUrl(newLink.url, newLink.platform)) {
      alert('Please enter a valid URL or username');
      return;
    }

    // Check if platform already exists
    if (links.some(link => link.platform === newLink.platform)) {
      alert('You already have a link for this platform');
      return;
    }

    const formattedUrl = formatUrl(newLink.url, newLink.platform);
    const displayName = newLink.displayName || extractDisplayName(formattedUrl, newLink.platform);

    const socialLink: SocialMediaLink = {
      id: `social_${Date.now()}`,
      platform: newLink.platform,
      url: formattedUrl,
      displayName,
      isPublic: newLink.isPublic,
      isActive: true,
      addedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedLinks = [...links, socialLink];
    setLinks(updatedLinks);
    onUpdate?.(updatedLinks);

    // Reset form
    setNewLink({
      platform: '' as SocialPlatform,
      url: '',
      displayName: '',
      isPublic: true
    });
    setIsAddModalOpen(false);
  };

  // Update existing link
  const handleUpdateLink = (linkId: string, updates: Partial<SocialMediaLink>) => {
    const updatedLinks = links.map(link =>
      link.id === linkId
        ? { ...link, ...updates, updatedAt: new Date().toISOString() }
        : link
    );
    setLinks(updatedLinks);
    onUpdate?.(updatedLinks);
  };

  // Delete link
  const handleDeleteLink = (linkId: string) => {
    if (confirm('Are you sure you want to delete this social media link?')) {
      const updatedLinks = links.filter(link => link.id !== linkId);
      setLinks(updatedLinks);
      onUpdate?.(updatedLinks);
    }
  };

  // Get platform config
  const getPlatformConfig = (platform: SocialPlatform): SocialPlatformConfig | undefined => {
    return availablePlatforms.find(p => p.name.toLowerCase() === platform);
  };

  // Get platform icon
  const getPlatformIcon = (platform: SocialPlatform): string => {
    const config = getPlatformConfig(platform);
    return config?.icon || '🔗';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Social Media Links
            <Badge variant="outline" className="ml-2">
              {links.length}/{maxLinks}
            </Badge>
          </div>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={links.length >= maxLinks}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Link
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Social Media Link</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="platform">Platform</Label>
                  <Select
                    value={newLink.platform}
                    onValueChange={(value: SocialPlatform) => setNewLink(prev => ({ ...prev, platform: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Choose platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePlatforms.map(platform => (
                        <SelectItem
                          key={platform.name}
                          value={platform.name.toLowerCase()}
                          disabled={links.some(link => link.platform === platform.name.toLowerCase())}
                        >
                          <div className="flex items-center">
                            <span className="mr-2">{platform.icon}</span>
                            <span>{platform.name}</span>
                            {platform.popular && <Badge variant="secondary" className="ml-2 text-xs">Popular</Badge>}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {newLink.platform && (
                    <p className="text-xs text-gray-500 mt-1">
                      {getPlatformConfig(newLink.platform)?.description}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="url">URL or Username</Label>
                  <Input
                    id="url"
                    value={newLink.url}
                    onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                    placeholder={newLink.platform ? getPlatformConfig(newLink.platform)?.placeholder : 'Enter URL or username'}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="displayName">Display Name (Optional)</Label>
                  <Input
                    id="displayName"
                    value={newLink.displayName}
                    onChange={(e) => setNewLink(prev => ({ ...prev, displayName: e.target.value }))}
                    placeholder="How it appears to others"
                    className="mt-1"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="isPublic">Make Public</Label>
                  <Switch
                    id="isPublic"
                    checked={newLink.isPublic}
                    onCheckedChange={(checked) => setNewLink(prev => ({ ...prev, isPublic: checked }))}
                  />
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button onClick={handleAddLink} className="flex-1">
                    Add Link
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {links.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="mb-2">No social media links added yet</p>
            <p className="text-sm">Add your social profiles to connect with clients</p>
          </div>
        ) : (
          <div className="space-y-3">
            {links.map(link => {
              const platformConfig = getPlatformConfig(link.platform);
              return (
                <div key={link.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg"
                      style={{ backgroundColor: platformConfig?.color || '#6B7280' }}
                    >
                      {getPlatformIcon(link.platform)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium capitalize">{link.platform}</span>
                        {!link.isPublic && <EyeOff className="h-4 w-4 text-gray-400" />}
                        {link.isPublic && <Eye className="h-4 w-4 text-green-500" />}
                      </div>
                      <div className="text-sm text-gray-600">
                        {link.displayName || link.url}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(link.url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUpdateLink(link.id, { isPublic: !link.isPublic })}
                    >
                      {link.isPublic ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteLink(link.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {userType === 'agent' && links.length > 0 && (
          <Alert className="mt-4">
            <Globe className="h-4 w-4" />
            <AlertDescription>
              Your social links will appear on your agent profile and property listings.
              Use the eye icon to control which links are visible to the public.
            </AlertDescription>
          </Alert>
        )}

        {/* Popular platforms suggestions */}
        {links.length < maxLinks && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Popular in Cape Verde:</h4>
            <div className="flex flex-wrap gap-2">
              {availablePlatforms
                .filter(p => p.popular && !links.some(l => l.platform === p.name.toLowerCase()))
                .map(platform => (
                  <Badge
                    key={platform.name}
                    variant="outline"
                    className="cursor-pointer hover:bg-blue-100"
                    onClick={() => {
                      setNewLink(prev => ({ ...prev, platform: platform.name.toLowerCase() as SocialPlatform }));
                      setIsAddModalOpen(true);
                    }}
                  >
                    {platform.icon} {platform.name}
                  </Badge>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Social links display component for showing links on profiles
export function SocialLinksDisplay({
  links,
  layout = 'horizontal',
  showLabels = true,
  size = 'md',
  maxVisible = 6,
  className = ''
}: {
  links: SocialMediaLink[];
  layout?: 'horizontal' | 'vertical' | 'grid';
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
  maxVisible?: number;
  className?: string;
}) {
  const visibleLinks = links.filter(link => link.isPublic && link.isActive).slice(0, maxVisible);

  if (visibleLinks.length === 0) return null;

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'w-6 h-6 text-xs';
      case 'lg': return 'w-12 h-12 text-lg';
      default: return 'w-8 h-8 text-sm';
    }
  };

  const getLayoutClasses = () => {
    switch (layout) {
      case 'vertical': return 'flex flex-col space-y-2';
      case 'grid': return 'grid grid-cols-3 gap-2';
      default: return 'flex space-x-2';
    }
  };

  const getPlatformIcon = (platform: SocialPlatform): string => {
    const config = CAPE_VERDE_SOCIAL_PLATFORMS.find(p => p.name.toLowerCase() === platform);
    return config?.icon || '🔗';
  };

  const getPlatformConfig = (platform: SocialPlatform) => {
    return CAPE_VERDE_SOCIAL_PLATFORMS.find(p => p.name.toLowerCase() === platform);
  };

  return (
    <div className={`${getLayoutClasses()} ${className}`}>
      {visibleLinks.map(link => {
        const platformConfig = getPlatformConfig(link.platform);
        return (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${getSizeClasses()} rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform`}
            style={{ backgroundColor: platformConfig?.color || '#6B7280' }}
            title={showLabels ? `${link.displayName || link.platform}` : undefined}
          >
            {getPlatformIcon(link.platform)}
          </a>
        );
      })}
    </div>
  );
}
