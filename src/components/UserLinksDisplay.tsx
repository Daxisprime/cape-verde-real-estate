'use client';

import React from 'react';
import {
  ExternalLink, CheckCircle, Phone, Mail, Globe,
  MessageCircle, Send, Facebook, Instagram, Twitter,
  Linkedin, Youtube
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { type LinkPlatform, PLATFORM_CONFIG } from '@/lib/user-links';

interface UserLink {
  id: string;
  platform: LinkPlatform;
  formatted_url: string;
  display_label: string | null;
  is_public: boolean;
  is_verified: boolean;
}

interface UserLinksDisplayProps {
  links: UserLink[];
  variant?: 'default' | 'compact' | 'icons-only' | 'buttons';
  showVerified?: boolean;
  maxDisplay?: number;
  className?: string;
}

// Platform icon component
function PlatformIcon({ platform, className = "h-4 w-4" }: { platform: LinkPlatform; className?: string }) {
  const iconProps = { className };

  switch (platform) {
    case 'whatsapp':
      return <MessageCircle {...iconProps} className={`${className} text-green-600`} />;
    case 'messenger':
      return <MessageCircle {...iconProps} className={`${className} text-blue-500`} />;
    case 'facebook':
      return <Facebook {...iconProps} className={`${className} text-blue-600`} />;
    case 'instagram':
      return <Instagram {...iconProps} className={`${className} text-pink-600`} />;
    case 'twitter':
      return <Twitter {...iconProps} className={`${className} text-sky-500`} />;
    case 'linkedin':
      return <Linkedin {...iconProps} className={`${className} text-blue-700`} />;
    case 'telegram':
      return <Send {...iconProps} className={`${className} text-blue-400`} />;
    case 'youtube':
      return <Youtube {...iconProps} className={`${className} text-red-600`} />;
    case 'website':
      return <Globe {...iconProps} className={`${className} text-gray-600`} />;
    case 'email':
      return <Mail {...iconProps} className={`${className} text-gray-600`} />;
    case 'phone':
      return <Phone {...iconProps} className={`${className} text-gray-600`} />;
    default:
      return <ExternalLink {...iconProps} className={`${className} text-gray-600`} />;
  }
}

// Get platform-specific colors for buttons
function getPlatformColors(platform: LinkPlatform): string {
  switch (platform) {
    case 'whatsapp':
      return 'bg-green-600 hover:bg-green-700 text-white';
    case 'messenger':
    case 'facebook':
      return 'bg-blue-600 hover:bg-blue-700 text-white';
    case 'instagram':
      return 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white';
    case 'twitter':
      return 'bg-sky-500 hover:bg-sky-600 text-white';
    case 'linkedin':
      return 'bg-blue-700 hover:bg-blue-800 text-white';
    case 'telegram':
      return 'bg-blue-400 hover:bg-blue-500 text-white';
    case 'youtube':
      return 'bg-red-600 hover:bg-red-700 text-white';
    case 'email':
      return 'bg-gray-600 hover:bg-gray-700 text-white';
    case 'phone':
      return 'bg-green-600 hover:bg-green-700 text-white';
    default:
      return 'bg-gray-600 hover:bg-gray-700 text-white';
  }
}

export default function UserLinksDisplay({
  links,
  variant = 'default',
  showVerified = true,
  maxDisplay,
  className = '',
}: UserLinksDisplayProps) {
  // Filter to only public links
  const publicLinks = links.filter(l => l.is_public);

  if (publicLinks.length === 0) return null;

  // Limit display if maxDisplay is set
  const displayLinks = maxDisplay ? publicLinks.slice(0, maxDisplay) : publicLinks;
  const hiddenCount = publicLinks.length - displayLinks.length;

  // Icons only variant - compact for cards
  if (variant === 'icons-only') {
    return (
      <TooltipProvider>
        <div className={`flex items-center gap-1 ${className}`}>
          {displayLinks.map(link => (
            <Tooltip key={link.id}>
              <TooltipTrigger asChild>
                <a
                  href={link.formatted_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <PlatformIcon platform={link.platform} className="h-5 w-5" />
                </a>
              </TooltipTrigger>
              <TooltipContent>
                <p>{link.display_label || PLATFORM_CONFIG[link.platform].label}</p>
                {link.is_verified && showVerified && (
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </p>
                )}
              </TooltipContent>
            </Tooltip>
          ))}
          {hiddenCount > 0 && (
            <span className="text-xs text-gray-500 ml-1">+{hiddenCount}</span>
          )}
        </div>
      </TooltipProvider>
    );
  }

  // Compact variant - small pills
  if (variant === 'compact') {
    return (
      <div className={`flex flex-wrap gap-1.5 ${className}`}>
        {displayLinks.map(link => (
          <a
            key={link.id}
            href={link.formatted_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium transition-colors"
          >
            <PlatformIcon platform={link.platform} className="h-3 w-3" />
            <span>{PLATFORM_CONFIG[link.platform].label}</span>
            {link.is_verified && showVerified && (
              <CheckCircle className="h-3 w-3 text-green-600" />
            )}
          </a>
        ))}
        {hiddenCount > 0 && (
          <span className="inline-flex items-center px-2 py-1 text-xs text-gray-500">
            +{hiddenCount} more
          </span>
        )}
      </div>
    );
  }

  // Buttons variant - styled action buttons
  if (variant === 'buttons') {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {displayLinks.map(link => (
          <Button
            key={link.id}
            asChild
            size="sm"
            className={getPlatformColors(link.platform)}
          >
            <a
              href={link.formatted_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <PlatformIcon platform={link.platform} className="h-4 w-4 mr-1.5 text-current" />
              {link.display_label || PLATFORM_CONFIG[link.platform].label}
              {link.is_verified && showVerified && (
                <CheckCircle className="h-3 w-3 ml-1" />
              )}
            </a>
          </Button>
        ))}
      </div>
    );
  }

  // Default variant - labeled links with icons
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {displayLinks.map(link => (
        <a
          key={link.id}
          href={link.formatted_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors group"
          title={link.display_label || PLATFORM_CONFIG[link.platform].label}
        >
          <PlatformIcon platform={link.platform} />
          <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
            {link.display_label || PLATFORM_CONFIG[link.platform].label}
          </span>
          {link.is_verified && showVerified && (
            <CheckCircle className="h-3.5 w-3.5 text-green-600" />
          )}
          <ExternalLink className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>
      ))}
      {hiddenCount > 0 && (
        <span className="inline-flex items-center px-3 py-2 text-sm text-gray-500">
          +{hiddenCount} more links
        </span>
      )}
    </div>
  );
}

// Quick contact buttons - commonly used for agent profiles
export function QuickContactLinks({ links }: { links: UserLink[] }) {
  const contactLinks = links.filter(l =>
    l.is_public && ['whatsapp', 'phone', 'email', 'messenger'].includes(l.platform)
  );

  if (contactLinks.length === 0) return null;

  return (
    <div className="flex gap-2">
      {contactLinks.map(link => {
        const config = PLATFORM_CONFIG[link.platform];
        return (
          <Button
            key={link.id}
            asChild
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <a
              href={link.formatted_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <PlatformIcon platform={link.platform} className="h-4 w-4 mr-2" />
              {link.platform === 'whatsapp' ? 'WhatsApp' :
               link.platform === 'phone' ? 'Call' :
               link.platform === 'email' ? 'Email' :
               config.label}
            </a>
          </Button>
        );
      })}
    </div>
  );
}

// Social media icons row - for profile headers
export function SocialLinksRow({ links }: { links: UserLink[] }) {
  const socialLinks = links.filter(l =>
    l.is_public && ['facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'tiktok'].includes(l.platform)
  );

  if (socialLinks.length === 0) return null;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-3">
        {socialLinks.map(link => (
          <Tooltip key={link.id}>
            <TooltipTrigger asChild>
              <a
                href={link.formatted_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <PlatformIcon platform={link.platform} className="h-5 w-5" />
              </a>
            </TooltipTrigger>
            <TooltipContent>
              {PLATFORM_CONFIG[link.platform].label}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
