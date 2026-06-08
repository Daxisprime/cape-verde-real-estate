import { notFound } from "next/navigation";
import Header from "@/components/Header";
import PropertyDetailClient from "@/components/PropertyDetailClient";
import type { SimilarProperty } from "@/components/PropertyDetailClient";
import { capeVerdeProperties, agentDatabase } from "@/data/cape-verde-properties";

interface PropertyWithExtras {
  propertyId?: string;
  agentId?: string;
}

export async function generateStaticParams() {
  const params: { id: string }[] = [];

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

const getPropertyData = (id: string) => {
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

  const agent = property.agentId ? agentDatabase[property.agentId as keyof typeof agentDatabase] : {
    name: "Cape Verde Properties",
    company: "ProCV Real Estate",
    phone: "+238 260 1234",
    email: "info@procv.com",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face"
  };

  return {
    id: property.id,
    title: property.title,
    titlePt: property.title,
    titleCv: property.title,
    price: property.price,
    location: property.location,
    island: property.island,
    type: property.type,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    area: property.totalArea,
    lotSize: property.totalArea * 1.2,
    yearBuilt: property.yearBuilt || 2020,
    parking: property.type === 'Villa' ? 2 : property.type === 'House' ? 1 : 0,
    featured: property.isFeatured || false,
    description: property.description,
    descriptionPt: property.description,
    descriptionCv: property.description,
    features: property.features,
    featuresPt: property.features,
    featuresCv: property.features,
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

function getSimilarProperties(currentId: string, island: string, type: string, price: number): SimilarProperty[] {
  const priceLow = price * 0.8;
  const priceHigh = price * 1.2;

  return capeVerdeProperties
    .filter(p => {
      if (p.id === currentId) return false;
      const sameIsland = p.island === island;
      const sameType = p.type === type;
      const closePrice = p.price >= priceLow && p.price <= priceHigh;
      return sameIsland && (sameType || closePrice);
    })
    .sort((a, b) => {
      const aScore = (a.type === type ? 2 : 0) + (Math.abs(a.price - price) < price * 0.1 ? 1 : 0);
      const bScore = (b.type === type ? 2 : 0) + (Math.abs(b.price - price) < price * 0.1 ? 1 : 0);
      return bScore - aScore;
    })
    .slice(0, 3)
    .map(p => ({
      id: p.id,
      title: p.title,
      price: p.price,
      location: p.location,
      island: p.island,
      type: p.type,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      image: p.images[0]
    }));
}

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property = getPropertyData(id);

  if (!property) {
    notFound();
  }

  const similarProperties = getSimilarProperties(
    property.id,
    property.island,
    property.type,
    property.price
  );

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <PropertyDetailClient property={property} similarProperties={similarProperties} />
    </div>
  );
}
