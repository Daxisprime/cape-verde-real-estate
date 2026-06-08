'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Search, Bed, Bath, MapPin, ArrowLeft, Phone, MessageCircle, CheckCircle2, User } from 'lucide-react';
import Header from '@/components/Header';

const SafeLeafletMap = dynamic(
  () => import('@/components/MapboxMap'),
  {
    ssr: false,
    loading: () => <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-400">Loading Map...</div>
  }
);

// Mock Property Data Array - Fully mapped to Cape Verdean markets for testing
const MOCK_DATA = [
  {
    id: '1',
    title: 'Modern Ocean-View Apartment',
    price: 12500000,
    neighborhood: 'Palmarejo',
    bedrooms: 3,
    bathrooms: 2,
    listing_type: 'buy',
    latitude: 14.9250,
    longitude: -23.5160,
    image_url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    seller_name: 'Maria Santos',
    seller_phone: '+238 991 2345',
    seller_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    is_verified: true
  },
  {
    id: '2',
    title: 'Cozy Studio near Market',
    price: 35000,
    neighborhood: 'Fazenda',
    bedrooms: 1,
    bathrooms: 1,
    listing_type: 'rent',
    latitude: 14.9310,
    longitude: -23.5090,
    image_url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
    seller_name: 'João Silva',
    seller_phone: '+238 995 6789',
    seller_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    is_verified: true
  },
  {
    id: '3',
    title: 'Luxury Villa with Private Pool',
    price: 35000000,
    neighborhood: 'Prainha',
    bedrooms: 4,
    bathrooms: 3,
    listing_type: 'buy',
    latitude: 14.9170,
    longitude: -23.5120,
    image_url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
    seller_name: 'Ana Ferreira',
    seller_phone: '+238 992 3456',
    seller_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    is_verified: true
  },
  {
    id: '4',
    title: 'Beachfront Family Home',
    price: 28000000,
    neighborhood: 'Quebra Canela',
    bedrooms: 3,
    bathrooms: 2,
    listing_type: 'buy',
    latitude: 14.9150,
    longitude: -23.5050,
    image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
    seller_name: 'Carlos Mendes',
    seller_phone: '+238 997 8901',
    seller_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    is_verified: false
  },
  {
    id: '5',
    title: 'Downtown Rental Apartment',
    price: 65000,
    neighborhood: 'Plateau',
    bedrooms: 2,
    bathrooms: 1,
    listing_type: 'rent',
    latitude: 14.9180,
    longitude: -23.5100,
    image_url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
    seller_name: 'Sofia Lopes',
    seller_phone: '+238 993 4567',
    seller_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    is_verified: true
  }
];

// =============================================
// PHONE NUMBER FORMATTING UTILITIES
// =============================================
function formatPhoneForDisplay(phone: string): string {
  return phone.replace(/\s+/g, ' ').trim();
}

function formatPhoneForWhatsApp(phone: string): string {
  // Remove all non-numeric characters except +
  return phone.replace(/[^\d+]/g, '');
}

function formatPhoneForTel(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}

export default function MapPage() {
  const [properties, setProperties] = useState(MOCK_DATA);
  const [searchArea, setSearchArea] = useState('');
  const [listingType, setListingType] = useState('all');
  const [minBedrooms, setMinBedrooms] = useState(0);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [hoveredProperty, setHoveredProperty] = useState<any>(null);

  // Synchronized search filter calculations for cards + pins
  const filteredProperties = properties.filter((item) => {
    const matchesArea = searchArea === '' ||
      item.neighborhood.toLowerCase().includes(searchArea.toLowerCase()) ||
      item.title.toLowerCase().includes(searchArea.toLowerCase());
    const matchesType = listingType === 'all' || item.listing_type === listingType;
    const matchesBed = minBedrooms === 0 || item.bedrooms >= minBedrooms;
    return matchesArea && matchesType && matchesBed;
  });

  // Determine active item for map (selected takes priority, then hovered)
  const activeMapItem = selectedProperty || hoveredProperty;

  return (
    <>
      <Header />
      <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] w-full overflow-hidden bg-white">

        {/* TRULIA SIDEBAR: Listings Feed & Filters Section */}
        <aside className="w-full md:w-[450px] lg:w-[500px] border-r border-gray-200 flex flex-col h-[50vh] md:h-full overflow-y-auto bg-white z-10 shadow-md md:shadow-none border-t md:border-t-0">

          {/* Render Form Controls IF no individual item is selected */}
          {!selectedProperty ? (
            <>
              {/* Search Input Box Area */}
              <div className="p-4 border-b border-gray-100 space-y-3">
                <div className="relative flex items-center">
                  <Search className="absolute left-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by neighborhood (e.g., Palmarejo)..."
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                    value={searchArea}
                    onChange={(e) => setSearchArea(e.target.value)}
                  />
                </div>

                {/* Dynamic Filtering Row Selection */}
                <div className="flex gap-2 text-xs">
                  <select
                    className="border rounded-md px-2 py-1.5 bg-white font-medium text-gray-700 outline-none"
                    value={listingType}
                    onChange={(e) => setListingType(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    <option value="buy">For Sale</option>
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

              {/* Scrollable Results Stream */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
                <div className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
                  Available Spaces ({filteredProperties.length})
                </div>

                {/* Mobile masonry feed */}
                <div className="columns-2 gap-2 md:hidden w-full">
                  {filteredProperties.map((property) => (
                    <div key={property.id} className="break-inside-avoid mb-2 w-full inline-block">
                      <div
                        onClick={() => setSelectedProperty(property)}
                        className={`rounded-xl bg-white cursor-pointer transition overflow-hidden border ${
                          hoveredProperty?.id === property.id
                            ? 'border-blue-500 shadow-lg ring-2 ring-blue-100'
                            : 'border-gray-200 hover:border-blue-400 hover:shadow-md'
                        }`}
                      >
                        <img
                          src={property.image_url}
                          alt={property.title}
                          className="w-full aspect-[4/3] object-cover bg-gray-100"
                        />
                        <div className="p-2.5">
                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                            {property.listing_type === 'buy' ? 'Sale' : 'Rent'}
                          </span>
                          <h3 className="font-bold text-xs text-gray-900 line-clamp-2 mt-0.5">{property.title}</h3>
                          <p className="font-extrabold text-sm text-gray-800 mt-1">
                            CVE {property.price.toLocaleString()}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5 truncate">{property.neighborhood}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop list feed */}
                <div className="hidden md:block space-y-3">
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
                      <img
                        src={property.image_url}
                        alt={property.title}
                        className="w-24 h-20 object-cover rounded-lg bg-gray-100 flex-shrink-0"
                      />
                      <div className="flex flex-col justify-center min-w-0">
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                          {property.listing_type === 'buy' ? 'For Sale' : 'To Rent'} • {property.neighborhood}
                        </span>
                        <h3 className="font-bold text-sm text-gray-900 truncate mt-0.5">{property.title}</h3>
                        <p className="font-extrabold text-sm text-gray-800 mt-1">
                          CVE {property.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredProperties.length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    No properties match your filters.
                  </div>
                )}
              </div>
            </>
          ) : (
            /* TRULIA SIDEBAR: Detailed Profile Panel Card View Mode */
            <div className="flex flex-col h-full bg-white overflow-y-auto">
              {/* Back Button */}
              <div className="p-4 pb-0">
                <button
                  onClick={() => setSelectedProperty(null)}
                  className="text-blue-600 font-semibold text-xs mb-4 flex items-center gap-1.5 uppercase tracking-wide hover:underline text-left"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to List View
                </button>
              </div>

              {/* Property Image */}
              <div className="px-4">
                <img
                  src={selectedProperty.image_url}
                  alt={selectedProperty.title}
                  className="w-full h-48 object-cover rounded-xl shadow-inner"
                />
              </div>

              {/* Property Details */}
              <div className="p-4 space-y-3 flex-1">
                <span className="text-xs font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded inline-block">
                  {selectedProperty.neighborhood}
                </span>
                <h2 className="font-extrabold text-xl text-gray-900 leading-tight">
                  {selectedProperty.title}
                </h2>
                <div className="text-2xl font-black text-gray-800 border-b pb-3">
                  CVE {selectedProperty.price.toLocaleString()}
                </div>

                {/* Utility Specs Display Grid */}
                <div className="grid grid-cols-2 gap-3 py-2 text-sm font-medium text-gray-600">
                  <div className="flex items-center gap-2">
                    <Bed className="h-4 w-4 text-gray-400" /> {selectedProperty.bedrooms} Bedrooms
                  </div>
                  <div className="flex items-center gap-2">
                    <Bath className="h-4 w-4 text-gray-400" /> {selectedProperty.bathrooms} Bathrooms
                  </div>
                </div>

                {/* Formatted Seller Contact Section */}
                <div className="border-t pt-4 space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact Seller</p>

                  {/* Clickable Phone Number */}
                  <a
                    href={`tel:${formatPhoneForTel(selectedProperty.seller_phone || '+238 000 0000')}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition group"
                  >
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Phone className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition">
                        {formatPhoneForDisplay(selectedProperty.seller_phone || '+238 000 0000')}
                      </p>
                      <p className="text-xs text-gray-500">Tap to call</p>
                    </div>
                  </a>

                  {/* WhatsApp Action Button */}
                  <a
                    href={`https://wa.me/${formatPhoneForWhatsApp(selectedProperty.seller_phone || '+238000000')}?text=Hi, I'm interested in your property: ${encodeURIComponent(selectedProperty.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-md"
                  >
                    <MessageCircle className="h-5 w-5" /> Message on WhatsApp
                  </a>
                </div>
              </div>

              {/* Bottom Circular Seller Profile Section */}
              <div className="border-t bg-gray-50 p-4">
                <div className="flex items-center gap-3">
                  {/* Circular Avatar */}
                  {selectedProperty.seller_avatar ? (
                    <img
                      src={selectedProperty.seller_avatar}
                      alt={selectedProperty.seller_name || 'Seller'}
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                  )}

                  {/* Seller Name & Verification Badge */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {selectedProperty.seller_name || 'Property Owner'}
                    </p>
                    {selectedProperty.is_verified !== false && (
                      <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Verified Host
                      </p>
                    )}
                  </div>

                  {/* View Profile Link */}
                  <button className="text-xs font-semibold text-blue-600 hover:underline whitespace-nowrap">
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* DEDICATED MAP MATRIX VIEW FRAME */}
        <div className="w-full md:flex-1 h-[50vh] md:h-full relative bg-gray-100 z-0">
          <SafeLeafletMap
            items={filteredProperties}
            activeItem={activeMapItem}
            onPinClick={setSelectedProperty}
          />
        </div>

      </div>
    </>
  );
}
