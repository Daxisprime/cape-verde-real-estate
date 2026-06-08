import { notFound } from "next/navigation";
import Header from "@/components/Header";
import PropertyDetailClient from "@/components/PropertyDetailClient";
import { capeVerdeProperties, agentDatabase } from "@/data/cape-verde-properties";

interface PropertyWithExtras {
  propertyId?: string;
  agentId?: string;
}

// Generate static params for all properties for static export
export async function generateStaticParams() {
  const params = [];

  // Add all property IDs and simple numeric IDs
  capeVerdeProperties.forEach((property, index) => {
    const prop = property as typeof property & PropertyWithExtras;
    params.push({ id: property.id });
    params.push({ id: (index + 1).toString() });
    if (prop.propertyId) {
      params.push({ id: prop.propertyId });
    }
  });

  return params;
}

// Get property data from our actual database
const getPropertyData = (id: string) => {
  // Try to find property by id or propertyId, or by a simple numeric match
  const property = capeVerdeProperties.find(p =>
    p.id === id ||
    (p as typeof p & PropertyWithExtras).propertyId === id ||
    p.id === `cv-${id.padStart(3, '0')}` ||
    (p as typeof p & PropertyWithExtras).propertyId === `CV-SGO-${id.padStart(3, '0')}` ||
    p.id.includes(id)
  );

  if (!property) {
    return null;
  }

  // Get agent information
  const agent = property.agentId ? agentDatabase[property.agentId as keyof typeof agentDatabase] : {
    name: "Cape Verde Properties",
    company: "ProCV Real Estate",
    phone: "+238 260 1234",
    email: "info@procv.com",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face"
  };

  // Convert our property data to the format expected by PropertyDetailClient
  return {
    id: property.id,
    title: property.title,
    titlePt: property.title, // We could add Portuguese translations later
    titleCv: property.title, // We could add Creole translations later
    price: property.price,
    location: property.location,
    island: property.island,
    type: property.type,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    area: property.totalArea,
    lotSize: property.totalArea * 1.2, // Estimated lot size
    yearBuilt: property.yearBuilt || 2020,
    parking: property.type === 'Villa' ? 2 : property.type === 'House' ? 1 : 0,
    featured: property.isFeatured || false,
    description: property.description,
    descriptionPt: property.description, // We could add Portuguese translations later
    descriptionCv: property.description, // We could add Creole translations later
    features: property.features,
    featuresPt: property.features, // We could add Portuguese translations later
    featuresCv: property.features, // We could add Creole translations later
    images: property.images,
    virtualTourUrl: `https://www.example.com/virtual-tour-${property.id}`,
    agent: {
      name: agent.name,
      company: agent.company,
      phone: agent.phone,
      email: agent.email,
      avatar: agent.image
    },
    coordinates: property.coordinates,
    priceHistory: [
      { date: "2024-01", price: Math.round(property.price * 0.95) },
      { date: "2024-06", price: Math.round(property.price * 0.98) },
      { date: "2024-12", price: property.price }
    ]
  };
};

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property = getPropertyData(id);

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
