'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useSearchMode } from '@/contexts/SearchModeContext';
import { capeVerdeProperties, type Property } from '@/data/cape-verde-properties';

const SafeLeafletMap = dynamic(
  () => import('@/components/MapboxMap'),
  {
    ssr: false,
    loading: () => <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-400">Loading Map...</div>
  }
);

const MARKETPLACE_ITEMS = [
  {
    id: "mkt-001",
    title: "Premium Building Cement (50kg bags)",
    price: 850,
    location: "Praia, Santiago",
    island: "Santiago",
    type: "Building Materials & Tools",
    image: "https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg?w=800&h=600&fit=crop",
    coordinates: [-23.5133, 14.9177] as [number, number],
  },
  {
    id: "mkt-002",
    title: "Samsung Smart TV 55\" 4K",
    price: 65000,
    location: "Santa Maria, Sal",
    island: "Sal",
    type: "Electronics & Computers",
    image: "https://images.pexels.com/photos/6782567/pexels-photo-6782567.jpeg?w=800&h=600&fit=crop",
    coordinates: [-22.9, 16.73] as [number, number],
  },
  {
    id: "mkt-003",
    title: "Professional Plumbing Services",
    price: 3500,
    location: "Mindelo, Sao Vicente",
    island: "Sao Vicente",
    type: "Maintenance & Repair Services",
    image: "https://images.pexels.com/photos/6419128/pexels-photo-6419128.jpeg?w=800&h=600&fit=crop",
    coordinates: [-24.98, 16.87] as [number, number],
  },
  {
    id: "mkt-004",
    title: "Modern Kitchen Set - Complete",
    price: 185000,
    location: "Espargos, Sal",
    island: "Sal",
    type: "Home, Furniture & Appliances",
    image: "https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?w=800&h=600&fit=crop",
    coordinates: [-22.93, 16.74] as [number, number],
  },
  {
    id: "mkt-005",
    title: "Legal & Notary Services",
    price: 15000,
    location: "Praia, Santiago",
    island: "Santiago",
    type: "Professional Services",
    image: "https://images.pexels.com/photos/5668882/pexels-photo-5668882.jpeg?w=800&h=600&fit=crop",
    coordinates: [-23.51, 14.92] as [number, number],
  },
  {
    id: "mkt-006",
    title: "Designer Clothing Collection",
    price: 4500,
    location: "Santa Maria, Sal",
    island: "Sal",
    type: "Fashion & Retail",
    image: "https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?w=800&h=600&fit=crop",
    coordinates: [-22.9, 16.73] as [number, number],
  },
];

function formatPrice(price: number): string {
  if (price >= 1000000) return `${(price / 1000000).toFixed(1)}M`;
  if (price >= 1000) return `${Math.round(price / 1000)}K`;
  return price.toLocaleString();
}

export default function ResultsSplitView() {
  const { searchMode, listingType, headerSearchQuery } = useSearchMode();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const listings = useMemo(() => {
    if (searchMode === "markets") {
      return MARKETPLACE_ITEMS.filter(item =>
        !headerSearchQuery ||
        item.title.toLowerCase().includes(headerSearchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(headerSearchQuery.toLowerCase())
      );
    }

    return capeVerdeProperties.filter(property => {
      const matchesQuery = !headerSearchQuery ||
        property.location.toLowerCase().includes(headerSearchQuery.toLowerCase()) ||
        property.island.toLowerCase().includes(headerSearchQuery.toLowerCase()) ||
        property.title.toLowerCase().includes(headerSearchQuery.toLowerCase());
      return matchesQuery;
    });
  }, [searchMode, listingType, headerSearchQuery]);

  const mapMarkers = useMemo(() => {
    if (searchMode === "markets") {
      return MARKETPLACE_ITEMS.map(item => ({
        id: item.id,
        latitude: item.coordinates[1],
        longitude: item.coordinates[0],
        price: item.price,
        title: item.title,
        listing_type: "marketplace" as const,
      }));
    }
    return listings.map((p: Property) => ({
      id: p.id,
      latitude: p.coordinates[1],
      longitude: p.coordinates[0],
      price: p.price,
      title: p.title,
      listing_type: listingType,
    }));
  }, [listings, searchMode, listingType]);

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px-44px)] w-full overflow-hidden">
      {/* Left Pane - Listings */}
      <aside className="w-full md:w-[420px] lg:w-[480px] h-[50vh] md:h-full overflow-y-auto bg-gray-50 border-r border-gray-200">
        <div className="p-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            {listings.length} {searchMode === "markets" ? "items" : "properties"} found
          </p>

          {/* Mobile masonry */}
          <div className="columns-2 gap-2 md:hidden">
            {listings.map((item: any) => (
              <div key={item.id} className="break-inside-avoid mb-2 inline-block w-full">
                <div
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`rounded-xl bg-white cursor-pointer transition overflow-hidden border ${
                    hoveredId === item.id
                      ? 'border-[#2563EB] shadow-lg ring-2 ring-blue-100'
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  <img
                    src={item.images?.[0] || item.image}
                    alt={item.title}
                    className="w-full aspect-[4/3] object-cover bg-gray-100"
                  />
                  <div className="p-2.5">
                    <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-wider">
                      {searchMode === "markets" ? item.type : (listingType === "buy" ? "Sale" : "Rent")}
                    </span>
                    <h3 className="font-bold text-xs text-gray-900 line-clamp-2 mt-0.5">{item.title}</h3>
                    <p className="font-extrabold text-sm text-gray-800 mt-1">
                      EUR {formatPrice(item.price)}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5 truncate">{item.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop list */}
          <div className="hidden md:flex flex-col gap-2">
            {listings.map((item: any) => (
              <div
                key={item.id}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`flex gap-3 p-3 rounded-xl bg-white cursor-pointer transition border ${
                  hoveredId === item.id
                    ? 'border-[#2563EB] shadow-lg ring-2 ring-blue-100'
                    : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                }`}
              >
                <img
                  src={item.images?.[0] || item.image}
                  alt={item.title}
                  className="w-24 h-20 object-cover rounded-lg bg-gray-100 flex-shrink-0"
                />
                <div className="flex flex-col justify-center min-w-0">
                  <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-wider">
                    {searchMode === "markets" ? item.type : `${listingType === "buy" ? "For Sale" : "To Rent"} • ${item.island}`}
                  </span>
                  <h3 className="font-bold text-sm text-gray-900 truncate mt-0.5">{item.title}</h3>
                  <p className="font-extrabold text-sm text-gray-800 mt-0.5">
                    EUR {formatPrice(item.price)}
                  </p>
                  <p className="text-[10px] text-gray-400 truncate">{item.location}</p>
                </div>
              </div>
            ))}
          </div>

          {listings.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-sm">No results found. Try a different search.</p>
            </div>
          )}
        </div>
      </aside>

      {/* Right Pane - Map */}
      <div className="flex-1 h-[50vh] md:h-full relative">
        <SafeLeafletMap
          items={mapMarkers}
          activeItem={mapMarkers.find(m => m.id === hoveredId) || null}
          onPinClick={() => {}}
        />
      </div>
    </div>
  );
}
