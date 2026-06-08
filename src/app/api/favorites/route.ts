import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, isSupabaseConfigured } from '@/lib/supabase';

// GET /api/favorites - Get user's favorites
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json(
      { error: 'User ID required' },
      { status: 400 }
    );
  }

  if (!isSupabaseConfigured()) {
    // Return empty array for mock mode
    return NextResponse.json({
      favorites: [],
      source: 'mock'
    });
  }

  try {
    const supabase = createSupabaseServerClient();
    if (!supabase) {
      throw new Error('Failed to create Supabase client');
    }

    const { data, error } = await supabase
      .from('favorites')
      .select(`
        id,
        property_id,
        created_at,
        properties (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      favorites: data,
      source: 'supabase'
    });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}

// POST /api/favorites - Add a favorite
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Database not configured', message: 'Running in demo mode' },
      { status: 503 }
    );
  }

  try {
    const supabase = createSupabaseServerClient();
    if (!supabase) {
      throw new Error('Failed to create Supabase client');
    }

    const { userId, propertyId } = await request.json();

    if (!userId || !propertyId) {
      return NextResponse.json(
        { error: 'User ID and Property ID required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('favorites')
      .insert([{ user_id: userId, property_id: propertyId }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Already in favorites' },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json({ favorite: data }, { status: 201 });
  } catch (error) {
    console.error('Error adding favorite:', error);
    return NextResponse.json(
      { error: 'Failed to add favorite' },
      { status: 500 }
    );
  }
}

// DELETE /api/favorites - Remove a favorite
export async function DELETE(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    );
  }

  try {
    const supabase = createSupabaseServerClient();
    if (!supabase) {
      throw new Error('Failed to create Supabase client');
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const propertyId = searchParams.get('propertyId');

    if (!userId || !propertyId) {
      return NextResponse.json(
        { error: 'User ID and Property ID required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('property_id', propertyId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing favorite:', error);
    return NextResponse.json(
      { error: 'Failed to remove favorite' },
      { status: 500 }
    );
  }
}
