export interface MockVendorProfile {
  id: string;
  full_name: string;
  avatar_url: string;
  phone: string;
  whatsapp: string;
  bio: string;
  type: "agent" | "merchant";
  company?: string;
  facebook_url: string;
  instagram_url: string;
  facebook_shop_url?: string;
  listings: MockVendorListing[];
}

export interface MockVendorListing {
  id: string;
  mode: "real_estate" | "item_service";
  title: string;
  price: number;
  island: string;
  zone: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  square_meters: number | null;
  images: string[];
}

export const mockProfiles: MockVendorProfile[] = [
  {
    id: "vendor-1",
    full_name: "Manuel Silva (Santiago Properties)",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    phone: "+2389912345",
    whatsapp: "+2389912345",
    bio: "Specializing in luxury apartments and rentals across Palmarejo and Praia.",
    type: "agent",
    company: "Santiago Properties",
    facebook_url: "https://facebook.com",
    instagram_url: "https://instagram.com",
    facebook_shop_url: "",
    listings: [
      {
        id: "listing-v1-1",
        mode: "real_estate",
        title: "Modern Ocean-View Apartment in Palmarejo",
        price: 12500000,
        island: "Santiago",
        zone: "Palmarejo",
        bedrooms: 3,
        bathrooms: 2,
        square_meters: 120,
        images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"],
      },
      {
        id: "listing-v1-2",
        mode: "real_estate",
        title: "2-Bedroom Rental Near Sucupira Market",
        price: 45000,
        island: "Santiago",
        zone: "Fazenda",
        bedrooms: 2,
        bathrooms: 1,
        square_meters: 75,
        images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"],
      },
    ],
  },
  {
    id: "vendor-2",
    full_name: "Crioulo Marketplace & Furniture",
    avatar_url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face",
    phone: "+2389954321",
    whatsapp: "+2389954321",
    bio: "Custom handmade island furniture and imported home appliances. Located in Mindelo.",
    type: "merchant",
    company: "Crioulo Marketplace",
    facebook_url: "https://facebook.com",
    instagram_url: "https://instagram.com",
    facebook_shop_url: "https://facebook.com/marketplace",
    listings: [
      {
        id: "listing-v2-1",
        mode: "item_service",
        title: "Handcrafted Teak Dining Table (6 Seater)",
        price: 85000,
        island: "Sao Vicente",
        zone: "Mindelo",
        bedrooms: null,
        bathrooms: null,
        square_meters: null,
        images: ["https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800"],
      },
      {
        id: "listing-v2-2",
        mode: "item_service",
        title: "Samsung Smart Fridge - Brand New",
        price: 120000,
        island: "Sao Vicente",
        zone: "Mindelo",
        bedrooms: null,
        bathrooms: null,
        square_meters: null,
        images: ["https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800"],
      },
    ],
  },
  {
    id: "vendor-3",
    full_name: "EletroPraia Maintenance",
    avatar_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face",
    phone: "+2389978910",
    whatsapp: "+2389978910",
    bio: "Certified residential electrical installations, lighting setups, and emergency repairs.",
    type: "merchant",
    company: "EletroPraia",
    facebook_url: "https://facebook.com",
    instagram_url: "",
    facebook_shop_url: "",
    listings: [
      {
        id: "listing-v3-1",
        mode: "item_service",
        title: "Full Home Electrical Rewiring Service",
        price: 150000,
        island: "Santiago",
        zone: "Praia",
        bedrooms: null,
        bathrooms: null,
        square_meters: null,
        images: ["https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800"],
      },
    ],
  },
];
