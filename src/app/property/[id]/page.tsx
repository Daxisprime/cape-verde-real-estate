import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Header from "@/components/Header";
import PropertyDetailClient from "@/components/PropertyDetailClient";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

async function getPropertyData(id: string) {
  if (!supabaseUrl || !supabaseAnonKey) return null;

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    title: data.title,
    titlePt: data.title,
    titleCv: data.title,
    price: Number(data.price),
    location: data.location,
    island: data.island,
    type: data.property_type,
    bedrooms: data.bedrooms,
    bathrooms: data.bathrooms,
    area: Number(data.total_area) || 0,
    lotSize: Math.round((Number(data.total_area) || 0) * 1.2),
    yearBuilt: data.year_built || 2020,
    parking: data.property_type === 'Villa' ? 2 : data.property_type === 'House' ? 1 : 0,
    featured: data.is_featured,
    description: data.description || '',
    descriptionPt: data.description || '',
    descriptionCv: data.description || '',
    features: data.features || [],
    featuresPt: data.features || [],
    featuresCv: data.features || [],
    images: data.images || [],
    virtualTourUrl: null,
    agent: {
      name: "ProCV Real Estate",
      company: "ProCV",
      phone: "+238 260 1234",
      email: "info@procv.com",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face"
    },
    coordinates: data.latitude && data.longitude ? [data.latitude, data.longitude] : [-23.5133, 14.9177],
    priceHistory: [
      { date: "2024-01", price: Math.round(Number(data.price) * 0.95) },
      { date: "2024-06", price: Math.round(Number(data.price) * 0.98) },
      { date: "2024-12", price: Number(data.price) }
    ]
  };
}

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property = await getPropertyData(id);

  if (!property) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <PropertyDetailClient property={property} />
    </div>
  );
}
