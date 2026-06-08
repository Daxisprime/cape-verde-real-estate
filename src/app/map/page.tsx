import MapPageClient from "./MapPageClient";

interface MapPageProps {
  searchParams: Promise<{ type?: string }>;
}

export default async function MapPage({ searchParams }: MapPageProps) {
  const params = await searchParams;
  return <MapPageClient initialType={params.type || "all"} />;
}
