import { NextResponse } from 'next/server';
import { createSupabaseServerClient, isSupabaseConfigured } from '@/lib/supabase';

// Properties to seed
const seedProperties = [
  {
    title: 'Modern Beachfront Villa',
    description: 'Stunning villa with ocean views and direct beach access',
    price: 450000,
    property_type: 'Villa',
    listing_type: 'sale',
    bedrooms: 4,
    bathrooms: 3,
    total_area: 280,
    location: 'Santa Maria, Sal',
    island: 'Sal',
    images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800'],
    features: ['Ocean View', 'Pool', 'Garden', 'Garage'],
    is_featured: true,
    is_verified: true,
    status: 'active'
  },
  {
    title: 'City Center Apartment',
    description: 'Modern apartment in the heart of Praia',
    price: 185000,
    property_type: 'Apartment',
    listing_type: 'sale',
    bedrooms: 2,
    bathrooms: 2,
    total_area: 95,
    location: 'Praia, Santiago',
    island: 'Santiago',
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
    features: ['City View', 'Balcony', 'Parking'],
    is_featured: false,
    is_verified: true,
    status: 'active'
  },
  {
    title: 'Ocean View Penthouse',
    description: 'Luxury penthouse with panoramic ocean views',
    price: 680000,
    property_type: 'Penthouse',
    listing_type: 'sale',
    bedrooms: 3,
    bathrooms: 3,
    total_area: 220,
    location: 'Mindelo, Sao Vicente',
    island: 'Sao Vicente',
    images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'],
    features: ['Ocean View', 'Roof Terrace', 'Elevator'],
    is_featured: true,
    is_verified: true,
    status: 'active'
  },
  {
    title: 'Traditional Stone House',
    description: 'Charming renovated house with authentic architecture',
    price: 220000,
    property_type: 'House',
    listing_type: 'sale',
    bedrooms: 3,
    bathrooms: 2,
    total_area: 150,
    location: 'Ribeira Grande, Santo Antao',
    island: 'Santo Antao',
    images: ['https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800'],
    features: ['Mountain View', 'Garden', 'Traditional'],
    is_featured: false,
    is_verified: true,
    status: 'active'
  },
  {
    title: 'Beachfront Resort Condo',
    description: 'Investment opportunity in a 5-star resort',
    price: 320000,
    property_type: 'Apartment',
    listing_type: 'sale',
    bedrooms: 1,
    bathrooms: 1,
    total_area: 65,
    location: 'Sal Rei, Boa Vista',
    island: 'Boa Vista',
    images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'],
    features: ['Beach Access', 'Resort Amenities', 'Rental Income'],
    is_featured: true,
    is_verified: true,
    status: 'active'
  },
  {
    title: 'Mountain Retreat',
    description: 'Peaceful property with volcanic landscape views',
    price: 175000,
    property_type: 'House',
    listing_type: 'sale',
    bedrooms: 2,
    bathrooms: 1,
    total_area: 120,
    location: 'Cha das Caldeiras, Fogo',
    island: 'Fogo',
    images: ['https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800'],
    features: ['Mountain View', 'Garden', 'Quiet Location'],
    is_featured: false,
    is_verified: true,
    status: 'active'
  },
  {
    title: 'Luxury Beach Villa',
    description: 'Exclusive beachfront property with private pool',
    price: 890000,
    property_type: 'Villa',
    listing_type: 'sale',
    bedrooms: 5,
    bathrooms: 4,
    total_area: 350,
    location: 'Santa Maria, Sal',
    island: 'Sal',
    images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'],
    features: ['Private Beach', 'Pool', 'Staff Quarters', 'Garage'],
    is_featured: true,
    is_verified: true,
    status: 'active'
  },
  {
    title: 'Modern Studio Apartment',
    description: 'Perfect for young professionals or investors',
    price: 95000,
    property_type: 'Apartment',
    listing_type: 'sale',
    bedrooms: 0,
    bathrooms: 1,
    total_area: 45,
    location: 'Praia, Santiago',
    island: 'Santiago',
    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
    features: ['City Center', 'Modern Kitchen', 'Balcony'],
    is_featured: false,
    is_verified: true,
    status: 'active'
  },
  {
    title: 'Seaside Townhouse',
    description: 'Beautiful townhouse steps from the beach',
    price: 275000,
    property_type: 'Townhouse',
    listing_type: 'sale',
    bedrooms: 3,
    bathrooms: 2,
    total_area: 160,
    location: 'Tarrafal, Santiago',
    island: 'Santiago',
    images: ['https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800'],
    features: ['Near Beach', 'Terrace', 'Parking'],
    is_featured: false,
    is_verified: true,
    status: 'active'
  },
  {
    title: 'Investment Land Plot',
    description: 'Prime development land with approved permits',
    price: 150000,
    property_type: 'Land',
    listing_type: 'sale',
    bedrooms: 0,
    bathrooms: 0,
    total_area: 1500,
    location: 'Espargos, Sal',
    island: 'Sal',
    images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800'],
    features: ['Building Permit', 'Utilities Available', 'Road Access'],
    is_featured: false,
    is_verified: true,
    status: 'active'
  }
];

// POST /api/seed - Seed the database with properties
export async function POST() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Supabase not configured' },
      { status: 503 }
    );
  }

  try {
    const supabase = createSupabaseServerClient();
    if (!supabase) {
      throw new Error('Failed to create Supabase client');
    }

    // Insert properties
    const { data, error } = await supabase
      .from('properties')
      .insert(seedProperties)
      .select();

    if (error) {
      console.error('Seed error:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${data?.length || 0} properties`,
      properties: data
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed database', details: String(error) },
      { status: 500 }
    );
  }
}

// GET /api/seed - Check seed status
export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ configured: false, message: 'Supabase not configured' });
  }

  try {
    const supabase = createSupabaseServerClient();
    if (!supabase) {
      throw new Error('Failed to create Supabase client');
    }

    const { count, error } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      configured: true,
      propertyCount: count || 0,
      needsSeeding: (count || 0) === 0
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check database', details: String(error) },
      { status: 500 }
    );
  }
}
