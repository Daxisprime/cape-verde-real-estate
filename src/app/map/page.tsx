import MapPageClient from "./MapPageClient";

interface MapPageProps {
  searchParams: Promise<{
    type?: string;
    q?: string;
    propertyType?: string;
    beds?: string;
    priceMin?: string;
    priceMax?: string;
    mode?: string;
    category?: string;
  }>;
}

export default async function MapPage({ searchParams }: MapPageProps) {
  const params = await searchParams;
  return (
    <MapPageClient
      initialType={params.type || "all"}
      initialQuery={params.q || ""}
      initialPropertyType={params.propertyType || ""}
      initialBeds={params.beds || "0"}
      initialPriceMin={params.priceMin || ""}
      initialPriceMax={params.priceMax || ""}
    />
  );
}
