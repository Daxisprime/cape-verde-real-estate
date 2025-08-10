// Social media integration TypeScript interfaces

export interface SocialMediaLink {
  id: string;
  platform: SocialPlatform;
  url: string;
  username?: string;
  displayName?: string;
  isVerified?: boolean;
  isPublic: boolean;
  isActive: boolean;
  addedAt: string;
  updatedAt: string;
}

export type SocialPlatform =
  | 'facebook'
  | 'instagram'
  | 'whatsapp'
  | 'linkedin'
  | 'twitter'
  | 'youtube'
  | 'tiktok'
  | 'telegram'
  | 'website'
  | 'blog'
  | 'other';

export interface SocialPlatformConfig {
  name: string;
  icon: string;
  color: string;
  urlPattern: string;
  placeholder: string;
  description: string;
  popular: boolean;
  businessFriendly: boolean;
}

export interface UserSocialProfile {
  userId: string;
  links: SocialMediaLink[];
  preferences: {
    showOnProfile: boolean;
    showOnListings: boolean;
    allowMessaging: boolean;
    verificationBadge: boolean;
  };
  statistics?: {
    totalClicks: number;
    clicksByPlatform: Record<SocialPlatform, number>;
    lastActivity: string;
  };
}

export interface AgentSocialProfile extends UserSocialProfile {
  businessInfo: {
    businessName?: string;
    businessType: 'individual' | 'agency' | 'developer';
    licenseNumber?: string;
    yearsExperience?: number;
    serviceAreas: string[];
    specialties: string[];
  };
  marketingPreferences: {
    autoPostListings: boolean;
    crossPlatformSharing: boolean;
    scheduledPosts: boolean;
    socialAdvertising: boolean;
  };
}

export interface SocialShareContent {
  type: 'property' | 'market_update' | 'success_story' | 'testimonial';
  title: string;
  description: string;
  imageUrl?: string;
  url: string;
  hashtags: string[];
  propertyId?: string;
  agentId?: string;
}

export interface SocialAnalytics {
  period: string;
  metrics: {
    totalReach: number;
    totalEngagement: number;
    clickThroughRate: number;
    leadGeneration: number;
    platformBreakdown: Record<SocialPlatform, {
      reach: number;
      engagement: number;
      clicks: number;
      leads: number;
    }>;
  };
  topPosts: Array<{
    id: string;
    platform: SocialPlatform;
    content: string;
    reach: number;
    engagement: number;
    clicks: number;
    createdAt: string;
  }>;
}

export interface SocialIntegration {
  platform: SocialPlatform;
  isConnected: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  permissions: string[];
  lastSync?: string;
  settings: {
    autoPost: boolean;
    crossPost: boolean;
    schedulePosts: boolean;
    analytics: boolean;
  };
}

// Cape Verde specific social platforms
export const CAPE_VERDE_SOCIAL_PLATFORMS: SocialPlatformConfig[] = [
  {
    name: 'WhatsApp',
    icon: '📱',
    color: '#25D366',
    urlPattern: 'https://wa.me/{phone}',
    placeholder: '+238 123 456 789',
    description: 'Primary communication platform in Cape Verde',
    popular: true,
    businessFriendly: true
  },
  {
    name: 'Facebook',
    icon: '📘',
    color: '#1877F2',
    urlPattern: 'https://facebook.com/{username}',
    placeholder: 'your.profile.name',
    description: 'Most popular social platform for property listings',
    popular: true,
    businessFriendly: true
  },
  {
    name: 'Instagram',
    icon: '📷',
    color: '#E4405F',
    urlPattern: 'https://instagram.com/{username}',
    placeholder: 'your_username',
    description: 'Visual platform perfect for property photos',
    popular: true,
    businessFriendly: true
  },
  {
    name: 'LinkedIn',
    icon: '💼',
    color: '#0077B5',
    urlPattern: 'https://linkedin.com/in/{username}',
    placeholder: 'your-name',
    description: 'Professional networking for real estate agents',
    popular: false,
    businessFriendly: true
  },
  {
    name: 'YouTube',
    icon: '📺',
    color: '#FF0000',
    urlPattern: 'https://youtube.com/c/{channel}',
    placeholder: 'your-channel',
    description: 'Property tours and market insights videos',
    popular: false,
    businessFriendly: true
  },
  {
    name: 'TikTok',
    icon: '🎵',
    color: '#000000',
    urlPattern: 'https://tiktok.com/@{username}',
    placeholder: '@yourusername',
    description: 'Short videos and property showcases',
    popular: true,
    businessFriendly: false
  },
  {
    name: 'Telegram',
    icon: '✈️',
    color: '#0088CC',
    urlPattern: 'https://t.me/{username}',
    placeholder: 'yourusername',
    description: 'Secure messaging for business communications',
    popular: false,
    businessFriendly: true
  },
  {
    name: 'Website',
    icon: '🌐',
    color: '#6B7280',
    urlPattern: 'https://{domain}',
    placeholder: 'www.yourwebsite.com',
    description: 'Personal or business website',
    popular: false,
    businessFriendly: true
  }
];

// Pre-defined hashtags for Cape Verde real estate
export const CAPE_VERDE_HASHTAGS = [
  '#CapeVerde', '#CaboVerde', '#RealEstate', '#Property',
  '#Investment', '#Beachfront', '#VillaLife', '#IslandLiving',
  '#Santiago', '#Sal', '#SaoVicente', '#BoaVista', '#Praia',
  '#Mindelo', '#SantaMaria', '#PropertyInvestment', '#Expat',
  '#Diaspora', '#TropicalProperty', '#AfricanProperty'
];

// Component prop types
export interface SocialLinksManagerProps {
  userId: string;
  userType: 'user' | 'agent';
  initialLinks?: SocialMediaLink[];
  onUpdate?: (links: SocialMediaLink[]) => void;
  maxLinks?: number;
  allowedPlatforms?: SocialPlatform[];
}

export interface SocialShareButtonProps {
  content: SocialShareContent;
  platform: SocialPlatform;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'button' | 'icon' | 'text';
  className?: string;
  onClick?: () => void;
}

export interface SocialProfileDisplayProps {
  links: SocialMediaLink[];
  layout?: 'horizontal' | 'vertical' | 'grid';
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
  maxVisible?: number;
  className?: string;
}

// API types
export interface SocialLinksResponse {
  success: boolean;
  data?: SocialMediaLink[];
  error?: string;
}

export interface SocialAnalyticsResponse {
  success: boolean;
  data?: SocialAnalytics;
  error?: string;
}

// Utility functions types
export type SocialUrlValidator = (url: string, platform: SocialPlatform) => boolean;
export type SocialUsernameExtractor = (url: string, platform: SocialPlatform) => string | null;
export type SocialShareUrlGenerator = (content: SocialShareContent, platform: SocialPlatform) => string;
