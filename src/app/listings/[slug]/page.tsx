import { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import SafetyBanner from "@/components/SafetyBanner";
import PropertyDetailClient from "@/components/PropertyDetailClient";
import type { SimilarProperty } from "@/components/PropertyDetailClient";
import { capeVerdeProperties, agentDatabase } from "@/data/cape-verde-properties";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function findPropertyBySlug(slug: string) {
  return capeVerdeProperties.find((p) => {
    const generated = slugify(p.title);
    return generated === slug || p.id === slug;
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = findPropertyBySlug(slug);

  if (!property) {
    return {
      title: "Anuncio | Pro.CV",
      description: "Encontre o que procura em Cabo Verde no Pro.CV",
    };
  }

  const priceFormatted = `${property.price.toLocaleString("pt-CV")} EUR`;
  const descShort = property.description.length > 160
    ? property.description.slice(0, 157) + "..."
    : property.description;

  return {
    title: `${property.title} | Pro.CV`,
    description: `${priceFormatted} - ${descShort}`,
    openGraph: {
      title: `${property.title} | Pro.CV`,
      description: `${priceFormatted} - ${descShort}`,
      type: "website",
      images: property.images?.[0] ? [{ url: property.images[0], width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${property.title} | Pro.CV`,
      description: `${priceFormatted} - ${descShort}`,
      images: property.images?.[0] ? [property.images[0]] : [],
    },
  };
}

export default async function ListingPage({ params }: PageProps) {
  const { slug } = await params;
  const property = findPropertyBySlug(slug);

  if (!property) return notFound();

  const agent = (property as typeof property & { agentId?: string }).agentId
    ? agentDatabase[(property as typeof property & { agentId?: string }).agentId!]
    : null;

  const similar: SimilarProperty[] = capeVerdeProperties
    .filter((p) => p.island === property.island && p.id !== property.id)
    .slice(0, 3)
    .map((p) => ({
      id: p.id,
      title: p.title,
      price: p.price,
      location: p.location,
      island: p.island,
      images: p.images || [],
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      totalArea: p.totalArea,
      type: p.type,
    }));

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <SafetyBanner />
      </div>
      <PropertyDetailClient
        property={{
          id: property.id,
          title: property.title,
          price: property.price,
          location: property.location,
          island: property.island,
          description: property.description,
          images: property.images || [],
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          totalArea: property.totalArea,
          type: property.type,
          features: property.features || [],
          yearBuilt: property.yearBuilt,
          latitude: property.latitude,
          longitude: property.longitude,
        }}
        agent={agent ? { name: agent.name, phone: agent.phone, email: agent.email, photo: agent.photo, agency: agent.agency } : null}
        similarProperties={similar}
      />
    </div>
  );
}
