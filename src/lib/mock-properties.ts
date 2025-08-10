import type { Property } from '@/types/property';

// Mock property database - In production, this would be a real database
export const mockProperties: Property[] = [
  {
    id: 1,
    title: 'Luxury Oceanfront Villa',
    price: 650000,
    location: 'Santa Maria',
    island: 'Sal',
    type: 'villa',
    bedrooms: 4,
    bathrooms: 3,
    area: 320,
    description: 'Stunning oceanfront villa with panoramic views, private pool, and direct beach access. Features modern amenities and traditional Cape Verdean architecture.',
    features: ['Ocean View', 'Private Pool', 'Beach Access', 'Modern Kitchen', 'Terrace', 'Garage'],
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    mainImage: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    status: 'available',
    dateAdded: '2024-12-15',
    lastUpdated: '2024-12-20',
    coordinates: { lat: 16.7338, lng: -22.9349 },
    verified: true,
    featured: true,
    newListing: false,
    pricePerSqm: 2031,
    agent: {
      id: 1,
      name: 'Maria Santos',
      company: 'Atlantic Real Estate',
      email: 'maria@atlanticre.cv',
      phone: '+238 123 4567',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      experience: 8,
      propertiesSold: 156,
      rating: 4.9,
      reviews: 47,
      verified: true
    }
  },
  {
    id: 2,
    title: 'Modern City Apartment',
    price: 185000,
    location: 'Praia',
    island: 'Santiago',
    type: 'apartment',
    bedrooms: 2,
    bathrooms: 2,
    area: 85,
    description: 'Contemporary apartment in the heart of the capital with modern finishes and city views.',
    features: ['City View', 'Modern Kitchen', 'Balcony', 'Parking', 'Elevator'],
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    mainImage: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    status: 'available',
    dateAdded: '2024-12-10',
    lastUpdated: '2024-12-18',
    coordinates: { lat: 14.9218, lng: -23.5087 },
    verified: true,
    featured: false,
    newListing: true,
    pricePerSqm: 2176,
    agent: {
      id: 2,
      name: 'João Silva',
      company: 'Urban Properties',
      email: 'joao@urbanprops.cv',
      phone: '+238 987 6543',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      experience: 5,
      propertiesSold: 89,
      rating: 4.7,
      reviews: 23,
      verified: true
    }
  },
  {
    id: 3,
    title: 'Beachfront Penthouse',
    price: 450000,
    location: 'Mindelo',
    island: 'São Vicente',
    type: 'penthouse',
    bedrooms: 3,
    bathrooms: 3,
    area: 180,
    description: 'Exclusive penthouse with panoramic ocean views and luxury amenities.',
    features: ['Ocean View', 'Rooftop Terrace', 'Jacuzzi', 'Premium Finishes'],
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    mainImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    status: 'available',
    dateAdded: '2024-12-12',
    lastUpdated: '2024-12-19',
    coordinates: { lat: 16.8635, lng: -24.9956 },
    verified: true,
    featured: true,
    newListing: false,
    pricePerSqm: 2500,
    agent: {
      id: 3,
      name: 'Ana Costa',
      company: 'Luxury Estates CV',
      email: 'ana@luxuryestates.cv',
      phone: '+238 456 7890',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      experience: 12,
      propertiesSold: 234,
      rating: 4.8,
      reviews: 67,
      verified: true
    }
  }
];
