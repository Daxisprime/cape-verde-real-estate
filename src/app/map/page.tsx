'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Search, Bed, Bath, MapPin, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import Header from '@/components/Header';
import { fetchProperties, type Property } from '@/lib/properties';
import { type MapItem } from '@/components/LeafletMap';

const SafeLeafletMap = dynamic(() => import('@/components/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-50 flex items-center justify-center text-sm text-gray-400 animate-pulse">
      Loading Cape Verde Map View...
    </div>
  )
});

function propertyToMapItem(property: Property): MapItem {
  return {
    id: property.id,
    title: property.title,
    price: property.price,
    neighborhood: property.location,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    latitude: property.latitude,
    longitude: property.longitude,
    image_url: property.images?.[0] || undefined,
  };
}

export default function MapPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchArea, setSearchArea] = useState('');
  const [listingType, setListingType] = useState('all');
  const [minBedrooms, setMinBedrooms] = useState(0);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [hoveredProperty, setHoveredProperty] = useState<Property | null>(null);

  const loadProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await fetchProperties({ status: 'active' });
    if (fetchError) {
      setError(fetchError);
    } else {
      setProperties(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  const filteredProperties = properties.filter((item) => {
    const matchesArea = searchArea === '' ||
      item.location.toLowerCase().includes(searchArea.toLowerCase()) ||
      item.title.toLowerCase().includes(searchArea.toLowerCase()) ||
      item.island.toLowerCase().includes(searchArea.toLowerCase());
    const matchesType = listingType === 'all' || item.listing_type === listingType;
    const matchesBed = minBedrooms === 0 || item.bedrooms >= minBedrooms;
    return matchesArea && matchesType && matchesBed;
  });

  const mapItems = filteredProperties.map(propertyToMapItem);
  const activeMapItem = selectedProperty
    ? propertyToMapItem(selectedProperty)
    : hoveredProperty
    ? propertyToMapItem(hoveredProperty)
    : null;

  const handlePinClick = (mapItem: MapItem) => {
    const prop = properties.find(p => p.id === mapItem.id);
    if (prop) setSelectedProperty(prop);
  };

  return (
    <>
      <Header />
      <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] w-full overflow-hidden bg-white">

        {/* Sidebar */}
        <aside className="w-full md:w-[420px] border-r border-gray-200 flex flex-col h-[45vh] md:h-full bg-white z-10 shadow-md">

          {!selectedProperty ? (
            <>
              {/* Filters */}
              <div className="p-4 border-b border-gray-100 space-y-3">
                <div className="relative flex items-center">
                  <Search className="absolute left-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by location or island..."
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                    value={searchArea}
                    onChange={(e) => setSearchArea(e.target.value)}
                  />
                </div>

                <div className="flex gap-2 text-xs">
                  <select
                    className="border rounded-md px-2 py-1.5 bg-white font-medium text-gray-700 outline-none"
                    value={listingType}
                    onChange={(e) => setListingType(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    <option value="sale">For Sale</option>
                    <option value="rent">For Rent</option>
                  </select>

                  <select
                    className="border rounded-md px-2 py-1.5 bg-white font-medium text-gray-700 outline-none"
                    value={minBedrooms}
                    onChange={(e) => setMinBedrooms(Number(e.target.value))}
                  >
                    <option value="0">Any Beds</option>
                    <option value="1">1+ Beds</option>
                    <option value="2">2+ Beds</option>
                    <option value="3">3+ Beds</option>
                  </select>
                </div>
              </div>

              {/* Results List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <Loader2 className="h-6 w-6 animate-spin mb-2" />
                    <span className="text-sm">Loading properties...</span>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-12 text-red-500">
                    <AlertCircle className="h-6 w-6 mb-2" />
                    <span className="text-sm text-center">{error}</span>
                    <button
                      onClick={loadProperties}
                      className="mt-3 text-xs font-semibold text-blue-600 hover:underline"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">
                      Properties ({filteredProperties.length})
                    </div>

                    {filteredProperties.map((property) => (
                      <div
                        key={property.id}
                        onClick={() => setSelectedProperty(property)}
                        onMouseEnter={() => setHoveredProperty(property)}
                        onMouseLeave={() => setHoveredProperty(null)}
                        className={`p-3 border rounded-xl bg-white cursor-pointer transition flex gap-4 ${
                          hoveredProperty?.id === property.id
                            ? 'border-blue-500 shadow-lg ring-2 ring-blue-100'
                            : 'border-gray-200 hover:border-blue-400 hover:shadow-md'
                        }`}
                      >
                        {property.images?.[0] && (
                          <img
                            src={property.images[0]}
                            alt={property.title}
                            className="w-24 h-20 object-cover rounded-lg bg-gray-100 flex-shrink-0"
                          />
                        )}
                        <div className="flex flex-col justify-center min-w-0">
                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                            {property.listing_type === 'sale' ? 'For Sale' : 'To Rent'} &bull; {property.island}
                          </span>
                          <h3 className="font-bold text-sm text-gray-900 truncate mt-0.5">{property.title}</h3>
                          <p className="font-extrabold text-sm text-gray-800 mt-1">
                            &euro;{property.price.toLocaleString()}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{property.location}</span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {filteredProperties.length === 0 && (
                      <div className="text-center py-8 text-gray-400 text-sm">
                        No properties match your filters.
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          ) : (
            /* Detail Panel */
            <div className="flex flex-col h-full bg-white overflow-y-auto">
              <div className="p-4 pb-0">
                <button
                  onClick={() => setSelectedProperty(null)}
                  className="text-blue-600 font-semibold text-xs mb-4 flex items-center gap-1.5 uppercase tracking-wide hover:underline text-left"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to List View
                </button>
              </div>

              {selectedProperty.images?.[0] && (
                <div className="px-4">
                  <img
                    src={selectedProperty.images[0]}
                    alt={selectedProperty.title}
                    className="w-full h-48 object-cover rounded-xl shadow-inner"
                  />
                </div>
              )}

              <div className="p-4 space-y-3 flex-1">
                <span className="text-xs font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded inline-block">
                  {selectedProperty.island} &bull; {selectedProperty.location}
                </span>
                <h2 className="font-extrabold text-xl text-gray-900 leading-tight">
                  {selectedProperty.title}
                </h2>
                <div className="text-2xl font-black text-gray-800 border-b pb-3">
                  &euro;{selectedProperty.price.toLocaleString()}
                </div>

                <div className="grid grid-cols-2 gap-3 py-2 text-sm font-medium text-gray-600">
                  <div className="flex items-center gap-2">
                    <Bed className="h-4 w-4 text-gray-400" /> {selectedProperty.bedrooms} Bedrooms
                  </div>
                  <div className="flex items-center gap-2">
                    <Bath className="h-4 w-4 text-gray-400" /> {selectedProperty.bathrooms} Bathrooms
                  </div>
                  {selectedProperty.total_area && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" /> {selectedProperty.total_area}m&sup2;
                    </div>
                  )}
                </div>

                {selectedProperty.description && (
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {selectedProperty.description}
                  </p>
                )}

                {selectedProperty.features && selectedProperty.features.length > 0 && (
                  <div className="pt-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Features</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedProperty.features.map((feature, i) => (
                        <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <a
                    href={`/property/${selectedProperty.id}`}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-md"
                  >
                    View Full Details
                  </a>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Map */}
        <div className="flex-1 h-[55vh] md:h-full relative bg-gray-100 z-0">
          <SafeLeafletMap
            items={mapItems}
            activeItem={activeMapItem}
            onPinClick={handlePinClick}
          />
        </div>

      </div>
    </>
  );
}
