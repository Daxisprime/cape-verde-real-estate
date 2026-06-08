import { NextRequest, NextResponse } from 'next/server';
import {
  getUserLinks,
  getPublicUserLinks,
  upsertUserLink,
  deleteUserLink,
  toggleLinkVisibility,
  updateLinkOrder,
  type LinkPlatform,
  type UserLinkInput,
  PLATFORM_CONFIG
} from '@/lib/user-links';
import { isSupabaseConfigured } from '@/lib/supabase';

// GET /api/user-links - Get links for a user
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const publicOnly = searchParams.get('public') === 'true';

  if (!userId) {
    return NextResponse.json(
      { error: 'userId parameter is required' },
      { status: 400 }
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    );
  }

  try {
    const links = publicOnly
      ? await getPublicUserLinks(userId)
      : await getUserLinks(userId);

    return NextResponse.json({
      links,
      platforms: PLATFORM_CONFIG,
    });
  } catch (error) {
    console.error('Error fetching user links:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user links' },
      { status: 500 }
    );
  }
}

// POST /api/user-links - Create or update a link
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { userId, platform, raw_input, display_label, is_public, display_order } = body;

    // Validate required fields
    if (!userId || !platform || !raw_input) {
      return NextResponse.json(
        { error: 'userId, platform, and raw_input are required' },
        { status: 400 }
      );
    }

    // Validate platform
    if (!PLATFORM_CONFIG[platform as LinkPlatform]) {
      return NextResponse.json(
        { error: `Invalid platform. Must be one of: ${Object.keys(PLATFORM_CONFIG).join(', ')}` },
        { status: 400 }
      );
    }

    const input: UserLinkInput = {
      platform: platform as LinkPlatform,
      raw_input,
      display_label,
      is_public,
      display_order,
    };

    const result = await upsertUserLink(userId, input);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      link: result.link,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating/updating user link:', error);
    return NextResponse.json(
      { error: 'Failed to create/update user link' },
      { status: 500 }
    );
  }
}

// PATCH /api/user-links - Update link visibility or order
export async function PATCH(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { userId, action } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'userId and action are required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'toggle_visibility': {
        const { platform, is_public } = body;
        if (!platform || is_public === undefined) {
          return NextResponse.json(
            { error: 'platform and is_public are required for toggle_visibility' },
            { status: 400 }
          );
        }

        const result = await toggleLinkVisibility(userId, platform as LinkPlatform, is_public);
        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 500 });
        }

        return NextResponse.json({ success: true });
      }

      case 'update_order': {
        const { orders } = body;
        if (!orders || !Array.isArray(orders)) {
          return NextResponse.json(
            { error: 'orders array is required for update_order' },
            { status: 400 }
          );
        }

        const result = await updateLinkOrder(userId, orders);
        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 500 });
        }

        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error updating user link:', error);
    return NextResponse.json(
      { error: 'Failed to update user link' },
      { status: 500 }
    );
  }
}

// DELETE /api/user-links - Delete a link
export async function DELETE(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const platform = searchParams.get('platform');

    if (!userId || !platform) {
      return NextResponse.json(
        { error: 'userId and platform are required' },
        { status: 400 }
      );
    }

    // Validate platform
    if (!PLATFORM_CONFIG[platform as LinkPlatform]) {
      return NextResponse.json(
        { error: `Invalid platform. Must be one of: ${Object.keys(PLATFORM_CONFIG).join(', ')}` },
        { status: 400 }
      );
    }

    const result = await deleteUserLink(userId, platform as LinkPlatform);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user link:', error);
    return NextResponse.json(
      { error: 'Failed to delete user link' },
      { status: 500 }
    );
  }
}
