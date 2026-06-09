'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useSearchMode } from '@/contexts/SearchModeContext';
import { capeVerdeProperties, type Property } from '@/data/cape-verde-properties';
import { MapPin, Bed, Bath, Ruler } from 'lucide-react';

const SafeLeafletMap = dynamic(
  () => import('@/components/MapboxMap'),
  {
    ssr: false,
    loading: () => <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-400">Loading Map...</div>
  }
);

function formatPrice(price: number): string {
  if (price >= 1000000) return `${(price / 1000000).toFixed(1)}M`;
  if (price >= 1000) return `${Math.round(price / 1000)}K`;
  return price.toLocaleString();
}

export default function ResultsSplitView() {
  const { searchMode, listingType, headerSearchQuery } = useSearchMode();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const listings = useMemo(() => {
    return capeVerdeProperties.filter(property => {
      const matchesQuery = !headerSearchQuery ||
        property.location.toLowerCase().includes(headerSearchQuery.toLowerCase()) ||
        property.island.toLowerCase().includes(headerSearchQuery.toLowerCase()) ||
        property.title.toLowerCase().includes(headerSearchQuery.toLowerCase());
      return matchesQuery;
    });
  }, [listingType, headerSearchQuery]);

  const mapMarkers = useMemo(() => {
    return listings.map((p: Property) => ({
      id: p.id,
      latitude: p.coordinates[1],
      longitude: p.coordinates[0],
      price: p.price,
      title: p.title,
      listing_type: listingType,
    }));
  }, [listings, listingType]);

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px-44px)] w-full overflow-hidden">
      {/* Left Pane - Listings Masonry */}
      <aside className="w-full md:w-[420px] lg:w-[480px] h-[50vh] md:h-full overflow-y-auto bg-gray-50 border-r border-gray-200">
        <div className="p-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            {listings.length} properties found
          </p>

          {/* 2-column masonry - all devices */}
          <div className="columns-2 gap-2 w-full block">
            {listings.map((item: Property) => (
              <div key={item.id} className="break-inside-avoid inline-block w-full mb-2">
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
                    src={item.images?.[0]}
                    alt={item.title}
                    className="w-full aspect-[4/3] object-cover bg-gray-100"
                  />
                  <div className="p-2">
                    <span className="text-[9px] font-bold text-[#2563EB] uppercase tracking-wider">
                      {listingType === "buy" ? "Sale" : "Rent"} &bull; {item.island}
                    </span>
                    <h3 className="font-bold text-xs text-gray-900 line-clamp-2 mt-0.5 leading-tight">{item.title}</h3>
                    <p className="font-extrabold text-sm text-gray-800 mt-1">
                      EUR {formatPrice(item.price)}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="h-2.5 w-2.5 text-gray-400" />
                      <p className="text-[10px] text-gray-400 truncate">{item.location}</p>
                    </div>
                    {(item.bedrooms || item.bathrooms || item.area) && (
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-500">
                        {item.bedrooms && (
                          <span className="flex items-center gap-0.5"><Bed className="h-2.5 w-2.5" />{item.bedrooms}</span>
                        )}
                        {item.bathrooms && (
                          <span className="flex items-center gap-0.5"><Bath className="h-2.5 w-2.5" />{item.bathrooms}</span>
                        )}
                        {item.area && (
                          <span className="flex items-center gap-0.5"><Ruler className="h-2.5 w-2.5" />{item.area}m&sup2;</span>
                        )}
                      </div>
                    )}
                  </div>
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
