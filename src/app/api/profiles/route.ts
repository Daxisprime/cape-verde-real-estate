import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, isSupabaseConfigured, Profile } from '@/lib/supabase';

// GET /api/profiles - Get profile(s)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const email = searchParams.get('email');
  const role = searchParams.get('role');

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  try {
    const supabase = createSupabaseServerClient();
    if (!supabase) throw new Error('Failed to create Supabase client');

    let query = supabase.from('profiles').select('*');

    if (id) {
      query = query.eq('id', id);
    }

    if (email) {
      query = query.eq('email', email);
    }

    if (role) {
      query = query.contains('roles', [role]);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      profiles: data,
      total: data?.length || 0,
    });
  } catch (error) {
    console.error('Error fetching profiles:', error);
    return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 });
  }
}

// PATCH /api/profiles - Update a profile
export async function PATCH(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  try {
    const supabase = createSupabaseServerClient();
    if (!supabase) throw new Error('Failed to create Supabase client');

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Profile ID required' }, { status: 400 });
    }

    // Validate roles if being updated
    if (updates.roles) {
      const validRoles = ['buyer', 'agent', 'vendor', 'admin'];
      const invalidRoles = updates.roles.filter((r: string) => !validRoles.includes(r));
      if (invalidRoles.length > 0) {
        return NextResponse.json(
          { error: `Invalid roles: ${invalidRoles.join(', ')}` },
          { status: 400 }
        );
      }
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ profile: data, success: true });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
