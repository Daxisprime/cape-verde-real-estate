import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, isSupabaseConfigured, Property, CAPE_VERDE_ISLANDS, PROPERTY_TYPES } from '@/lib/supabase';

// Mock data for when Supabase is not configured or empty
const mockProperties: Partial<Property>[] = [
  {
    id: 'mock-1',
    title: 'Luxury Beachfront Villa in Santa Maria',
    description: 'Stunning 4-bedroom villa with direct beach access',
    price: 890000,
    price_currency: 'EUR',
    price_type: 'sale',
    property_type: 'villa',
    bedrooms: 4,
    bathrooms: 3,
    total_area: 280,
    island: 'Sal',
    city: 'Santa Maria',
    images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800'],
    features: ['Ocean View', 'Pool', 'Beach Access'],
    status: 'active',
    is_featured: true,
    is_verified: true,
  },
  {
    id: 'mock-2',
    title: 'Modern Apartment in Praia',
    description: 'Beautiful apartment in the heart of the capital',
    price: 185000,
    price_currency: 'EUR',
    price_type: 'sale',
    property_type: 'apartment',
    bedrooms: 2,
    bathrooms: 2,
    total_area: 95,
    island: 'Santiago',
    city: 'Praia',
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
    features: ['City View', 'Balcony', 'Parking'],
    status: 'active',
    is_featured: false,
    is_verified: true,
  },
];

// GET /api/properties - Fetch properties with filters
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Parse query parameters
  const filters = {
    island: searchParams.get('island'),
    city: searchParams.get('city'),
    propertyType: searchParams.get('type') || searchParams.get('propertyType'),
    priceType: searchParams.get('priceType'),
    minPrice: searchParams.get('minPrice'),
    maxPrice: searchParams.get('maxPrice'),
    bedrooms: searchParams.get('bedrooms'),
    bathrooms: searchParams.get('bathrooms'),
    featured: searchParams.get('featured'),
    status: searchParams.get('status') || 'active',
    agentId: searchParams.get('agentId'),
    search: searchParams.get('search') || searchParams.get('q'),
    limit: parseInt(searchParams.get('limit') || '20'),
    offset: parseInt(searchParams.get('offset') || '0'),
    sortBy: searchParams.get('sortBy') || 'created_at',
    sortOrder: searchParams.get('sortOrder') || 'desc',
  };

  // Return mock data if Supabase not configured
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      properties: mockProperties,
      total: mockProperties.length,
      source: 'mock',
    });
  }

  try {
    const supabase = createSupabaseServerClient();
    if (!supabase) {
      throw new Error('Failed to create Supabase client');
    }

    // Build query - select properties without join for compatibility
    let query = supabase
      .from('properties')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.island && filters.island !== 'all') {
      query = query.eq('island', filters.island);
    }

    // City filter - only works with v2 schema
    // if (filters.city) {
    //   query = query.ilike('city', `%${filters.city}%`);
    // }

    if (filters.propertyType && filters.propertyType !== 'all') {
      query = query.eq('property_type', filters.propertyType);
    }

    if (filters.priceType && filters.priceType !== 'all') {
      query = query.eq('price_type', filters.priceType);
    }

    if (filters.minPrice) {
      query = query.gte('price', parseInt(filters.minPrice));
    }

    if (filters.maxPrice) {
      query = query.lte('price', parseInt(filters.maxPrice));
    }

    if (filters.bedrooms) {
      query = query.gte('bedrooms', parseInt(filters.bedrooms));
    }

    if (filters.bathrooms) {
      query = query.gte('bathrooms', parseInt(filters.bathrooms));
    }

    if (filters.featured === 'true') {
      query = query.eq('is_featured', true);
    }

    if (filters.agentId) {
      query = query.eq('agent_id', filters.agentId);
    }

    if (filters.search) {
      // Search in title and description (compatible with both old and new schema)
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    // Apply sorting
    const ascending = filters.sortOrder === 'asc';
    if (filters.sortBy === 'price') {
      query = query.order('price', { ascending });
    } else if (filters.sortBy === 'bedrooms') {
      query = query.order('bedrooms', { ascending });
    } else {
      query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
    }

    // Apply pagination
    query = query.range(filters.offset, filters.offset + filters.limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    // Fall back to mock if no data
    if (!data || data.length === 0) {
      return NextResponse.json({
        properties: mockProperties,
        total: mockProperties.length,
        source: 'mock-fallback',
      });
    }

    return NextResponse.json({
      properties: data,
      total: count || data.length,
      source: 'supabase',
      filters: {
        islands: CAPE_VERDE_ISLANDS,
        propertyTypes: PROPERTY_TYPES,
      },
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties', properties: mockProperties, source: 'error-fallback' },
      { status: 500 }
    );
  }
}

// POST /api/properties - Create a new property (agents only)
export async function POST(request: NextRequest) {
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

    const body = await request.json();

    // Validate required fields
    const required = ['title', 'price', 'property_type', 'island', 'city'];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate island
    if (!CAPE_VERDE_ISLANDS.includes(body.island)) {
      return NextResponse.json(
        { error: `Invalid island. Must be one of: ${CAPE_VERDE_ISLANDS.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate property type
    if (!PROPERTY_TYPES.includes(body.property_type)) {
      return NextResponse.json(
        { error: `Invalid property type. Must be one of: ${PROPERTY_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('properties')
      .insert([{
        title: body.title,
        description: body.description || null,
        price: body.price,
        price_currency: body.price_currency || 'EUR',
        price_type: body.price_type || 'sale',
        property_type: body.property_type,
        bedrooms: body.bedrooms || 0,
        bathrooms: body.bathrooms || 0,
        total_area: body.total_area || null,
        lot_size: body.lot_size || null,
        year_built: body.year_built || null,
        island: body.island,
        city: body.city,
        address: body.address || null,
        postal_code: body.postal_code || null,
        coordinates: body.coordinates || null,
        images: body.images || [],
        video_url: body.video_url || null,
        virtual_tour_url: body.virtual_tour_url || null,
        features: body.features || [],
        agent_id: body.agent_id || null,
        status: body.status || 'draft',
        is_featured: body.is_featured || false,
        is_verified: false,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating property:', error);
      throw error;
    }

    return NextResponse.json({ property: data, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    );
  }
}
