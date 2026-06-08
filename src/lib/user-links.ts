import { createSupabaseServerClient, createSupabaseBrowserClient, isSupabaseConfigured } from './supabase';

// Link platform types matching the PostgreSQL enum
export type LinkPlatform =
  | 'whatsapp'
  | 'messenger'
  | 'facebook'
  | 'instagram'
  | 'twitter'
  | 'linkedin'
  | 'telegram'
  | 'website'
  | 'email'
  | 'phone'
  | 'youtube'
  | 'tiktok'
  | 'other';

// Platform metadata for UI
export const PLATFORM_CONFIG: Record<LinkPlatform, {
  label: string;
  icon: string;
  placeholder: string;
  inputType: 'tel' | 'email' | 'url' | 'text';
  prefix?: string;
}> = {
  whatsapp: {
    label: 'WhatsApp',
    icon: '📱',
    placeholder: '+238 999 1234',
    inputType: 'tel',
  },
  messenger: {
    label: 'Messenger',
    icon: '💬',
    placeholder: 'username or profile URL',
    inputType: 'text',
  },
  facebook: {
    label: 'Facebook',
    icon: '📘',
    placeholder: 'username or profile URL',
    inputType: 'text',
  },
  instagram: {
    label: 'Instagram',
    icon: '📸',
    placeholder: '@username',
    inputType: 'text',
    prefix: '@',
  },
  twitter: {
    label: 'Twitter / X',
    icon: '🐦',
    placeholder: '@username',
    inputType: 'text',
    prefix: '@',
  },
  linkedin: {
    label: 'LinkedIn',
    icon: '💼',
    placeholder: 'username or profile URL',
    inputType: 'text',
  },
  telegram: {
    label: 'Telegram',
    icon: '✈️',
    placeholder: '@username',
    inputType: 'text',
    prefix: '@',
  },
  website: {
    label: 'Website',
    icon: '🌐',
    placeholder: 'https://example.com',
    inputType: 'url',
  },
  email: {
    label: 'Email',
    icon: '📧',
    placeholder: 'email@example.com',
    inputType: 'email',
  },
  phone: {
    label: 'Phone',
    icon: '📞',
    placeholder: '+238 999 1234',
    inputType: 'tel',
  },
  youtube: {
    label: 'YouTube',
    icon: '🎬',
    placeholder: '@channel or channel URL',
    inputType: 'text',
  },
  tiktok: {
    label: 'TikTok',
    icon: '🎵',
    placeholder: '@username',
    inputType: 'text',
    prefix: '@',
  },
  other: {
    label: 'Other',
    icon: '🔗',
    placeholder: 'https://...',
    inputType: 'url',
  },
};

// User link interface
export interface UserLink {
  id: string;
  user_id: string;
  platform: LinkPlatform;
  raw_input: string;
  formatted_url: string;
  display_label: string | null;
  is_public: boolean;
  is_verified: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// Input for creating/updating a link
export interface UserLinkInput {
  platform: LinkPlatform;
  raw_input: string;
  display_label?: string;
  is_public?: boolean;
  display_order?: number;
}

// Client-side URL formatting (mirrors the PostgreSQL function)
export function formatLinkUrl(platform: LinkPlatform, rawInput: string): string {
  const cleanInput = rawInput.trim();

  switch (platform) {
    case 'whatsapp': {
      const phoneNumber = cleanInput.replace(/[^0-9+]/g, '').replace(/^\+/, '');
      return `https://wa.me/${phoneNumber}`;
    }

    case 'messenger': {
      if (cleanInput.startsWith('http')) return cleanInput;
      return `https://m.me/${cleanInput}`;
    }

    case 'facebook': {
      if (cleanInput.startsWith('http')) return cleanInput;
      return `https://facebook.com/${cleanInput}`;
    }

    case 'instagram': {
      const username = cleanInput.replace(/^@/, '');
      if (cleanInput.startsWith('http')) return cleanInput;
      return `https://instagram.com/${username}`;
    }

    case 'twitter': {
      const username = cleanInput.replace(/^@/, '');
      if (cleanInput.startsWith('http')) return cleanInput;
      return `https://twitter.com/${username}`;
    }

    case 'linkedin': {
      if (cleanInput.startsWith('http')) return cleanInput;
      return `https://linkedin.com/in/${cleanInput}`;
    }

    case 'telegram': {
      const username = cleanInput.replace(/^@/, '');
      if (cleanInput.startsWith('http')) return cleanInput;
      return `https://t.me/${username}`;
    }

    case 'youtube': {
      if (cleanInput.startsWith('http')) return cleanInput;
      if (cleanInput.startsWith('@')) return `https://youtube.com/${cleanInput}`;
      return `https://youtube.com/@${cleanInput}`;
    }

    case 'tiktok': {
      const username = cleanInput.replace(/^@/, '');
      if (cleanInput.startsWith('http')) return cleanInput;
      return `https://tiktok.com/@${username}`;
    }

    case 'website': {
      if (cleanInput.startsWith('http')) return cleanInput;
      return `https://${cleanInput}`;
    }

    case 'email': {
      if (cleanInput.startsWith('mailto:')) return cleanInput;
      return `mailto:${cleanInput}`;
    }

    case 'phone': {
      const phoneNumber = cleanInput.replace(/[^0-9+]/g, '');
      return `tel:${phoneNumber}`;
    }

    default: {
      if (cleanInput.startsWith('http')) return cleanInput;
      return `https://${cleanInput}`;
    }
  }
}

// API Functions

/**
 * Get all links for a user (server-side)
 */
export async function getUserLinks(userId: string): Promise<UserLink[]> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured');
    return [];
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('user_links')
    .select('*')
    .eq('user_id', userId)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching user links:', error);
    return [];
  }

  return data as UserLink[];
}

/**
 * Get public links for a user (for profile display)
 */
export async function getPublicUserLinks(userId: string): Promise<UserLink[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('user_links')
    .select('*')
    .eq('user_id', userId)
    .eq('is_public', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching public user links:', error);
    return [];
  }

  return data as UserLink[];
}

/**
 * Upsert a user link (create or update)
 */
export async function upsertUserLink(
  userId: string,
  input: UserLinkInput
): Promise<{ success: boolean; link?: UserLink; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Database not configured' };
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return { success: false, error: 'Failed to create database client' };
  }

  const formattedUrl = formatLinkUrl(input.platform, input.raw_input);

  const { data, error } = await supabase
    .from('user_links')
    .upsert({
      user_id: userId,
      platform: input.platform,
      raw_input: input.raw_input,
      formatted_url: formattedUrl,
      display_label: input.display_label || null,
      is_public: input.is_public ?? true,
      display_order: input.display_order ?? 0,
    }, {
      onConflict: 'user_id,platform',
    })
    .select()
    .single();

  if (error) {
    console.error('Error upserting user link:', error);
    return { success: false, error: error.message };
  }

  return { success: true, link: data as UserLink };
}

/**
 * Delete a user link
 */
export async function deleteUserLink(
  userId: string,
  platform: LinkPlatform
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Database not configured' };
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return { success: false, error: 'Failed to create database client' };
  }

  const { error } = await supabase
    .from('user_links')
    .delete()
    .eq('user_id', userId)
    .eq('platform', platform);

  if (error) {
    console.error('Error deleting user link:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Update link order for a user
 */
export async function updateLinkOrder(
  userId: string,
  linkOrders: { platform: LinkPlatform; order: number }[]
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Database not configured' };
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return { success: false, error: 'Failed to create database client' };
  }

  // Update each link's order
  const updates = linkOrders.map(({ platform, order }) =>
    supabase
      .from('user_links')
      .update({ display_order: order })
      .eq('user_id', userId)
      .eq('platform', platform)
  );

  try {
    await Promise.all(updates);
    return { success: true };
  } catch (error) {
    console.error('Error updating link order:', error);
    return { success: false, error: 'Failed to update link order' };
  }
}

/**
 * Toggle link visibility
 */
export async function toggleLinkVisibility(
  userId: string,
  platform: LinkPlatform,
  isPublic: boolean
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Database not configured' };
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return { success: false, error: 'Failed to create database client' };
  }

  const { error } = await supabase
    .from('user_links')
    .update({ is_public: isPublic })
    .eq('user_id', userId)
    .eq('platform', platform);

  if (error) {
    console.error('Error toggling link visibility:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
