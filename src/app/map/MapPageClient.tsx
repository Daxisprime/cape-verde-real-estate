'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Search, Bed, Bath, MapPin, ArrowLeft, Phone, MessageCircle, CheckCircle2, User, X, SlidersHorizontal } from 'lucide-react';
import Header from '@/components/Header';

const SafeLeafletMap = dynamic(
  () => import('@/components/MapboxMap'),
  {
    ssr: false,
    loading: () => <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-400">Loading Map...</div>
  }
);

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
    seller_id: 'vendor-1',
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
    seller_id: 'vendor-1',
    seller_name: 'Jo\u00e3o Silva',
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
    seller_id: 'vendor-2',
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
    seller_id: 'vendor-3',
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
    seller_id: 'vendor-2',
    seller_name: 'Sofia Lopes',
    seller_phone: '+238 993 4567',
    seller_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    is_verified: true
  }
];

function formatPhoneForDisplay(phone: string): string {
  return phone.replace(/\s+/g, ' ').trim();
}

function formatPhoneForWhatsApp(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}

function formatPhoneForTel(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}

interface MapPageClientProps {
  initialType: string;
  initialQuery?: string;
  initialPropertyType?: string;
  initialBeds?: string;
  initialPriceMin?: string;
  initialPriceMax?: string;
}

export default function MapPageClient({
  initialType,
  initialQuery = "",
  initialPropertyType = "",
  initialBeds = "0",
  initialPriceMin = "",
  initialPriceMax = "",
}: MapPageClientProps) {
  const [properties] = useState(MOCK_DATA);
  const [searchArea, setSearchArea] = useState(initialQuery);
  const [listingType, setListingType] = useState(initialType === 'buy' || initialType === 'rent' ? initialType : 'all');
  const [propertyType, setPropertyType] = useState(initialPropertyType || 'all');
  const [minBedrooms, setMinBedrooms] = useState(Number(initialBeds) || 0);
  const [priceMinInput, setPriceMinInput] = useState(initialPriceMin || '');
  const [priceMaxInput, setPriceMaxInput] = useState(initialPriceMax || '');
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [activeHoverId, setActiveHoverId] = useState<string | null>(null);
  const [isMobileMapActive, setIsMobileMapActive] = useState(false);
  const [activeMobileItem, setActiveMobileItem] = useState<any>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isFilterOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isFilterOpen]);

  const priceMin = priceMinInput ? Number(priceMinInput) : 0;
  const priceMax = priceMaxInput ? Number(priceMaxInput) : Infinity;

  const filteredProperties = properties.filter((item) => {
    const matchesArea = searchArea === '' ||
      item.neighborhood.toLowerCase().includes(searchArea.toLowerCase()) ||
      item.title.toLowerCase().includes(searchArea.toLowerCase());
    const matchesType = listingType === 'all' || item.listing_type === listingType;
    const matchesBed = minBedrooms === 0 || item.bedrooms >= minBedrooms;
    const matchesPrice = item.price >= priceMin && item.price <= priceMax;
    return matchesArea && matchesType && matchesBed && matchesPrice;
  });

  const hoveredProperty = filteredProperties.find(p => p.id === activeHoverId) || null;
  const activeMapItem = selectedProperty || hoveredProperty;

  function handlePinClick(item: any) {
    if (window.innerWidth < 768) {
      setActiveMobileItem(item);
    } else {
      setSelectedProperty(item);
    }
  }

  return (
    <>
      <Header />

      {/* Compact filter header with search + dropdown trigger */}
      <div className="w-full bg-white border-b border-gray-100 px-4 py-2 sticky top-16 z-30 relative" ref={filterRef}>
        <div className="flex items-center gap-2">
          <div className="relative flex items-center flex-1 min-w-[140px] max-w-xs">
            <Search className="absolute left-3 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Neighborhood..."
              className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={searchArea}
              onChange={(e) => setSearchArea(e.target.value)}
            />
          </div>

          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              isFilterOpen
                ? 'bg-blue-50 text-[#0044FF] border-blue-200'
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-blue-50 hover:text-[#0044FF]'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
          </button>

          <span className="text-xs text-gray-400 font-medium hidden sm:inline">
            {filteredProperties.length} results
          </span>
        </div>

        {/* Dropdown filter tray - floats as overlay */}
        {isFilterOpen && (
          <div className="absolute left-0 right-0 top-full mt-0 mx-4 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-50 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Type</label>
                <select
                  className="w-full px-2.5 py-2 text-xs text-gray-800 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-400"
                  value={listingType}
                  onChange={(e) => setListingType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="buy">For Sale</option>
                  <option value="rent">For Rent</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Unit</label>
                <select
                  className="w-full px-2.5 py-2 text-xs text-gray-800 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-400"
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                >
                  <option value="all">All Units</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="villa">Villa</option>
                  <option value="land">Land</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Bedrooms</label>
                <select
                  className="w-full px-2.5 py-2 text-xs text-gray-800 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-400"
                  value={minBedrooms}
                  onChange={(e) => setMinBedrooms(Number(e.target.value))}
                >
                  <option value="0">Any</option>
                  <option value="0.5">Studio</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Price Range</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceMinInput}
                    onChange={(e) => setPriceMinInput(e.target.value)}
                    className="w-full px-2 py-2 text-xs text-gray-800 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-400"
                  />
                  <span className="text-gray-300 text-xs">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceMaxInput}
                    onChange={(e) => setPriceMaxInput(e.target.value)}
                    className="w-full px-2 py-2 text-xs text-gray-800 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-400"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Map/List toggle pill - completely detached */}
      <button
        onClick={() => { setIsMobileMapActive(!isMobileMapActive); setActiveMobileItem(null); }}
        className="fixed top-28 left-1/2 -translate-x-1/2 z-50 bg-white border border-slate-200 px-5 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer font-semibold text-sm text-slate-800 md:hidden"
      >
        {isMobileMapActive ? (
          <><span aria-hidden>&#x1F4CB;</span> List</>
        ) : (
          <><span aria-hidden>&#x1F5FA;&#xFE0F;</span> Map</>
        )}
      </button>

      {/* Main split container */}
      <div className="flex flex-col md:flex-row h-[calc(100vh-64px-42px)] w-full overflow-hidden bg-white">

        {/* LEFT FEED PANEL */}
        <aside className={`${isMobileMapActive ? 'hidden' : 'flex flex-col'} md:flex md:flex-col w-full md:w-[450px] lg:w-[500px] h-full overflow-y-auto bg-white border-r border-gray-200`}>
          {!selectedProperty ? (
            <div className="flex-1 overflow-y-auto p-3 bg-gray-50/50">
              <div className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
                Available Spaces ({filteredProperties.length})
              </div>

              <div className="columns-2 gap-2 w-full block">
                {filteredProperties.map((property, index) => (
                  <div key={property.id} className="break-inside-avoid inline-block w-full mb-3">
                    <div
                      onClick={() => setSelectedProperty(property)}
                      onMouseEnter={() => setActiveHoverId(property.id)}
                      onMouseLeave={() => setActiveHoverId(null)}
                      className={`rounded-xl bg-white cursor-pointer transition-all duration-200 overflow-hidden border ${
                        activeHoverId === property.id
                          ? 'border-[#0044FF] shadow-lg ring-2 ring-blue-100 scale-[1.02]'
                          : 'border-gray-200 hover:border-blue-400 hover:shadow-md'
                      }`}
                    >
                      <img
                        src={property.image_url}
                        alt={property.title}
                        className={`w-full object-cover rounded-t-lg ${index % 2 === 0 ? 'h-40' : 'h-52'}`}
                      />
                      <div className="p-2">
                        <span className="text-[9px] font-bold text-[#0044FF] uppercase tracking-wider">
                          {property.listing_type === 'buy' ? 'Sale' : 'Rent'} &bull; {property.neighborhood}
                        </span>
                        <h3 className="font-bold text-xs text-gray-900 line-clamp-2 mt-0.5 leading-tight">{property.title}</h3>
                        <p className="font-extrabold text-sm text-gray-800 mt-1">
                          CVE {property.price.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5 truncate">{property.neighborhood}</p>
                      </div>
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
          ) : (
            <div className="flex flex-col h-full bg-white overflow-y-auto">
              <div className="p-4 pb-0">
                <button
                  onClick={() => setSelectedProperty(null)}
                  className="text-[#0044FF] font-semibold text-xs mb-4 flex items-center gap-1.5 uppercase tracking-wide hover:underline text-left"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to List View
                </button>
              </div>

              <div className="px-4">
                <img
                  src={selectedProperty.image_url}
                  alt={selectedProperty.title}
                  className="w-full h-48 object-cover rounded-xl shadow-inner"
                />
              </div>

              <div className="p-4 space-y-3 flex-1">
                <span className="text-xs font-bold bg-gray-50 text-[#0044FF] px-2 py-1 rounded inline-block">
                  {selectedProperty.neighborhood}
                </span>
                <h2 className="font-extrabold text-xl text-gray-900 leading-tight">
                  {selectedProperty.title}
                </h2>
                <div className="text-2xl font-black text-gray-800 border-b pb-3">
                  CVE {selectedProperty.price.toLocaleString()}
                </div>

                <div className="grid grid-cols-2 gap-3 py-2 text-sm font-medium text-gray-600">
                  <div className="flex items-center gap-2">
                    <Bed className="h-4 w-4 text-gray-400" /> {selectedProperty.bedrooms} Bedrooms
                  </div>
                  <div className="flex items-center gap-2">
                    <Bath className="h-4 w-4 text-gray-400" /> {selectedProperty.bathrooms} Bathrooms
                  </div>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact Seller</p>

                  <a
                    href={`tel:${formatPhoneForTel(selectedProperty.seller_phone || '+238 000 0000')}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition group"
                  >
                    <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <Phone className="h-5 w-5 text-[#0044FF]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 group-hover:text-[#0044FF] transition">
                        {formatPhoneForDisplay(selectedProperty.seller_phone || '+238 000 0000')}
                      </p>
                      <p className="text-xs text-gray-500">Tap to call</p>
                    </div>
                  </a>

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

              <div className="border-t bg-gray-50 p-4">
                <div className="flex items-center gap-3">
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

                  <Link href={`/profile/${selectedProperty.seller_id}`} className="text-xs font-semibold text-[#0044FF] hover:underline whitespace-nowrap">
                    View Profile
                  </Link>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* RIGHT MAP PANEL */}
        <div className={`${isMobileMapActive ? 'block' : 'hidden'} md:block w-full md:flex-1 h-full relative bg-gray-100 z-0`}>
          <SafeLeafletMap
            items={filteredProperties}
            activeItem={activeMapItem}
            onPinClick={handlePinClick}
          />

          {activeMobileItem && (
            <div
              className="block md:hidden absolute inset-0 z-30"
              onClick={() => setActiveMobileItem(null)}
            />
          )}
        </div>
      </div>

      {/* Mobile Bottom Drawer */}
      <div
        className={`block md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white shadow-2xl rounded-t-2xl p-3 transform transition-transform duration-300 w-full max-w-md mx-auto ${
          activeMobileItem ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {activeMobileItem && (
          <>
            <div className="flex justify-end mb-1">
              <button
                onClick={() => setActiveMobileItem(null)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <Link
              href={`/property/${activeMobileItem.id}`}
              className="flex items-center gap-3"
            >
              <img
                src={activeMobileItem.image_url}
                alt={activeMobileItem.title}
                className="w-20 h-20 rounded-xl object-cover flex-shrink-0 bg-gray-100"
              />
              <div className="flex-1 min-w-0">
                <p className="font-black text-base text-gray-900">
                  CVE {activeMobileItem.price?.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {activeMobileItem.neighborhood}
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                  <span className="flex items-center gap-0.5">
                    <Bed className="h-3 w-3 text-gray-400" />
                    {activeMobileItem.bedrooms}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Bath className="h-3 w-3 text-gray-400" />
                    {activeMobileItem.bathrooms}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <MapPin className="h-3 w-3 text-gray-400" />
                    {activeMobileItem.listing_type === 'buy' ? 'Sale' : 'Rent'}
                  </span>
                </div>
                <a
                  href={`https://wa.me/${formatPhoneForWhatsApp(activeMobileItem.seller_phone || '+238000000')}?text=Hi, I'm interested in: ${encodeURIComponent(activeMobileItem.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold text-white bg-emerald-500 rounded-md py-1 px-2 hover:bg-emerald-600 transition"
                >
                  <MessageCircle className="h-3 w-3" /> WhatsApp
                </a>
              </div>
            </Link>
          </>
        )}
      </div>
    </>
  );
}
