'use client';

import { useMemo, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useSearchMode } from '@/contexts/SearchModeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { MapPin, ChevronRight, Home, LayoutGrid, Phone, MessageCircle, Facebook, Package, Plus } from 'lucide-react';
import { useMarketplace, type MarketplaceItem } from '@/hooks/useMarketplace';
import MarketplaceItemDrawer from '@/components/MarketplaceItemDrawer';
import FeaturedCarousel from '@/components/FeaturedCarousel';
import type { MapMarkerLight, BoundingBox } from '@/components/MapboxMap';

const SafeLeafletMap = dynamic(
  () => import('@/components/MapboxMap'),
  {
    ssr: false,
    loading: () => <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-400 text-sm">Loading Map...</div>
  }
);

const MARKET_TAXONOMY = [
  {
    name: "Vehicles & Automotive",
    icon: "\uD83D\uDE97",
    subcategories: ["Cars & SUVs", "Motorbikes & Scooters", "Vehicle Parts & Accessories", "Heavy Duty & Trucks", "Car Rental Services"],
  },
  {
    name: "Electronics & Computers",
    icon: "\uD83D\uDCF1",
    subcategories: ["Smartphones & Tablets", "Laptops & Desktops", "Computer Hardware & Accessories", "TV, Audio & Video", "Video Game Consoles"],
  },
  {
    name: "Home, Furniture & Appliances",
    icon: "\uD83D\uDECB\uFE0F",
    subcategories: ["Beds & Mattresses", "Sofas & Living Room Chairs", "Kitchen Appliances", "Home Decor & Lighting", "Generators & Solar Energy Equipment"],
  },
  {
    name: "Building Materials & Tools",
    icon: "\uD83C\uDFD7\uFE0F",
    subcategories: ["Cement, Blocks & Aggregates", "Tiles & Flooring", "Hand & Power Tools", "Electrical Supplies & Cables", "Plumbing Pipes & Fixtures"],
  },
  {
    name: "Restaurants & Menus (Takeaway)",
    icon: "\uD83C\uDF73",
    subcategories: ["Praia Local Eats", "Mindelo Cafes & Bars", "Sal Resort Takeaway", "Daily Menu Uploads", "Bakery & Catering Options"],
  },
  {
    name: "Fashion, Clothing & Retail",
    icon: "\uD83D\uDC55",
    subcategories: ["Shoes & Sneakers", "Men's Clothing", "Women's Clothing", "Bags & Accessories", "Watches & Jewelry"],
  },
  {
    name: "Babies & Kids Items",
    icon: "\uD83D\uDC76",
    subcategories: ["Children's Apparel", "Toys & Games", "Strollers & Car Seats", "Baby Care & Feeding Essentials"],
  },
  {
    name: "Pets & Animal Supplies",
    icon: "\uD83D\uDC3E",
    subcategories: ["Pet Food", "Dog & Cat Accessories", "Livestock & Poultry Feed"],
  },
  {
    name: "Maintenance & Repair Services",
    icon: "\uD83D\uDEE0\uFE0F",
    subcategories: ["Emergency Plumbing", "Residential Electricians", "AC & Appliance Repair", "Masonry & Painting Pro's", "Car Mechanics"],
  },
  {
    name: "Professional & Event Services",
    icon: "\uD83D\uDCBC",
    subcategories: ["Web Developers & IT Support", "Photography & Video Production", "Legal & Business Consulting", "Event Planning & DJ Services", "Private Tutors & Lessons"],
  },
];

const MARKETPLACE_ITEMS = [
  {
    id: "mkt-001",
    title: "Premium Building Cement (50kg bags)",
    price: 850,
    location: "Praia, Santiago",
    category: "Building Materials & Tools",
    subcategory: "Cement, Blocks & Aggregates",
    image: "https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg?w=400&h=300&fit=crop",
    posted: "2 hours ago",
    coordinates: [14.9177, -23.5133] as [number, number],
    is_featured: true,
    is_premium: true,
    vendor_avatar: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?w=64&h=64&fit=crop",
    facebook_handle: "praia.building.supplies",
  },
  {
    id: "mkt-002",
    title: "Samsung Smart TV 55\" 4K UHD",
    price: 65000,
    location: "Santa Maria, Sal",
    category: "Electronics & Computers",
    subcategory: "TV, Audio & Video",
    image: "https://images.pexels.com/photos/6782567/pexels-photo-6782567.jpeg?w=400&h=300&fit=crop",
    posted: "5 hours ago",
    coordinates: [16.73, -22.9] as [number, number],
    is_featured: true,
    is_premium: false,
    vendor_avatar: null,
    facebook_handle: "",
  },
  {
    id: "mkt-003",
    title: "Professional Plumbing & Pipe Repair",
    price: 3500,
    location: "Mindelo, Sao Vicente",
    category: "Maintenance & Repair Services",
    subcategory: "Emergency Plumbing",
    image: "https://images.pexels.com/photos/6419128/pexels-photo-6419128.jpeg?w=400&h=300&fit=crop",
    posted: "1 day ago",
    coordinates: [16.87, -24.98] as [number, number],
    is_featured: false,
    is_premium: true,
    vendor_avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?w=64&h=64&fit=crop",
    facebook_handle: "mindelo.plumbing.pro",
  },
  {
    id: "mkt-004",
    title: "Modern Kitchen Cabinet Set - Complete",
    price: 185000,
    location: "Espargos, Sal",
    category: "Home, Furniture & Appliances",
    subcategory: "Kitchen Appliances",
    image: "https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?w=400&h=300&fit=crop",
    posted: "3 hours ago",
    coordinates: [16.74, -22.93] as [number, number],
    is_featured: false,
    is_premium: false,
    vendor_avatar: null,
    facebook_handle: "",
  },
  {
    id: "mkt-005",
    title: "Legal & Notary Translation Services",
    price: 15000,
    location: "Praia, Santiago",
    category: "Professional & Event Services",
    subcategory: "Legal & Business Consulting",
    image: "https://images.pexels.com/photos/5668882/pexels-photo-5668882.jpeg?w=400&h=300&fit=crop",
    posted: "6 hours ago",
    coordinates: [14.92, -23.51] as [number, number],
    is_featured: false,
    is_premium: false,
    vendor_avatar: null,
    facebook_handle: "",
  },
  {
    id: "mkt-006",
    title: "Designer Summer Clothing Collection",
    price: 4500,
    location: "Santa Maria, Sal",
    category: "Fashion, Clothing & Retail",
    subcategory: "Women's Clothing",
    image: "https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?w=400&h=300&fit=crop",
    posted: "12 hours ago",
    coordinates: [16.73, -22.9] as [number, number],
    is_featured: false,
    is_premium: false,
    vendor_avatar: null,
    facebook_handle: "",
  },
];

const MUNICIPALITIES = [
  "All Locations",
  "Praia, Santiago",
  "Mindelo, Sao Vicente",
  "Santa Maria, Sal",
  "Espargos, Sal",
  "Sal Rei, Boa Vista",
];

export default function MarketsView() {
  const router = useRouter();
  const { headerSearchQuery, setIsResultsViewActive } = useSearchMode();
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [isMapViewActive, setIsMapViewActive] = useState(false);
  const [activeHoverId, setActiveHoverId] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [viewportBounds, setViewportBounds] = useState<BoundingBox | null>(null);
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);

  const { items: marketplaceDbItems } = useMarketplace({ category: selectedCategory || undefined });

  const itemsPool = useMemo(() => {
    const dbFormatted = marketplaceDbItems.map(item => ({
      id: item.id,
      title: item.title,
      price: item.price_cve,
      location: `${item.municipality || ''}, ${item.island}`.replace(/^, /, ''),
      category: item.category,
      subcategory: item.subcategory,
      image: item.images?.[0] || 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?w=400&h=300&fit=crop',
      posted: new Date(item.created_at).toLocaleDateString(),
      coordinates: [0, 0] as [number, number],
      is_featured: item.is_featured,
      is_premium: item.is_featured,
      vendor_avatar: null as string | null,
      facebook_handle: '',
    }));

    const allItems = [...dbFormatted, ...MARKETPLACE_ITEMS];
    const seen = new Set<string>();
    return allItems.filter(item => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [marketplaceDbItems]);

  const filteredItems = useMemo(() => {
    const filtered = itemsPool.filter(item => {
      const matchSearch = headerSearchQuery
        ? item.title.toLowerCase().includes(headerSearchQuery.toLowerCase())
        : true;
      const matchCat = selectedCategory ? item.category === selectedCategory : true;
      const matchSub = selectedSubcategory ? item.subcategory === selectedSubcategory : true;
      const matchLoc = selectedLocation !== "All Locations" ? item.location === selectedLocation : true;
      const matchMin = minPrice ? item.price >= parseFloat(minPrice) : true;
      const matchMax = maxPrice ? item.price <= parseFloat(maxPrice) : true;
      return matchSearch && matchCat && matchSub && matchLoc && matchMin && matchMax;
    });
    return filtered.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
  }, [itemsPool, headerSearchQuery, selectedCategory, selectedSubcategory, selectedLocation, minPrice, maxPrice]);

  const activeSubcategories = useMemo(() => {
    if (!hoveredCategory) return [];
    return MARKET_TAXONOMY.find(c => c.name === hoveredCategory)?.subcategories || [];
  }, [hoveredCategory]);

  // Lightweight map markers: only ID, lat, lng, category + display flags
  // Bounding box filter: only include markers within visible viewport
  const mapMarkers: MapMarkerLight[] = useMemo(() => {
    return filteredItems
      .filter(item => {
        if (!item.coordinates[0] || !item.coordinates[1]) return false;
        if (!viewportBounds) return true;
        const lat = item.coordinates[0];
        const lng = item.coordinates[1];
        return (
          lat >= viewportBounds.south &&
          lat <= viewportBounds.north &&
          lng >= viewportBounds.west &&
          lng <= viewportBounds.east
        );
      })
      .map(item => ({
        id: item.id,
        latitude: item.coordinates[0],
        longitude: item.coordinates[1],
        category: item.category,
        price: item.price,
        is_featured: item.is_featured,
        is_premium: item.is_premium || false,
        vendor_avatar: item.vendor_avatar || null,
      }));
  }, [filteredItems, viewportBounds]);

  const handleBoundsChange = useCallback((bounds: BoundingBox) => {
    setViewportBounds(bounds);
  }, []);

  const handleDetailRequest = useCallback((item: MapMarkerLight) => {
    // Lazy detail fetch: only load full profile on pin click
    // For now, scroll to card in list; full Supabase fetch can be added here
    const el = document.getElementById(`market-item-${item.id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  function handleMapPinClick(markerItem: { id: string }) {
    setActiveHoverId(markerItem.id);
    const el = document.getElementById(`market-item-${markerItem.id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function handleItemClick(item: typeof filteredItems[number]) {
    const dbItem = marketplaceDbItems.find(d => d.id === item.id);
    if (dbItem) {
      setSelectedItem(dbItem);
      return;
    }
    setSelectedItem({
      id: item.id,
      title: item.title,
      description: null,
      price_cve: item.price,
      category: item.category,
      subcategory: item.subcategory,
      condition: 'used',
      island: item.location.split(', ').pop() || 'Santiago',
      municipality: item.location.split(', ')[0] || null,
      images: item.image ? [item.image] : [],
      status: 'active',
      user_id: null,
      contact_phone: null,
      contact_whatsapp: null,
      view_count: 0,
      is_featured: item.is_featured,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  return (
    <div className="w-full h-[calc(100vh-64px)] overflow-hidden flex flex-col bg-white">
      {/* Breadcrumb Trail - touch-optimized */}
      <div className="w-full bg-slate-50 border-b border-slate-200 px-4 py-1 flex items-center gap-1 text-xs font-medium text-slate-500 flex-shrink-0 z-30 relative min-h-[44px]">
        <span className="hover:text-[#0044FF] cursor-pointer flex items-center gap-1 py-2 px-1 touch-target-sm" onClick={() => setIsResultsViewActive(false)}>
          <Home className="w-3.5 h-3.5" /> {t.home}
        </span>
        <ChevronRight className="w-3 h-3 text-slate-300" />
        <span className="hover:text-[#0044FF] cursor-pointer py-2 px-1 touch-target-sm" onClick={() => { setSelectedCategory(null); setSelectedSubcategory(null); }}>
          {t.markets}
        </span>
        {selectedCategory && (
          <>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-slate-800 font-semibold">{selectedCategory}</span>
          </>
        )}
        {selectedSubcategory && (
          <>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-[#0044FF] font-semibold">{selectedSubcategory}</span>
          </>
        )}
      </div>

      {/* Main Container */}
      <div className="w-full flex-1 flex flex-row overflow-hidden relative">

        {/* Left Sidebar */}
        <aside
          className="hidden md:flex w-64 lg:w-72 flex-shrink-0 h-full bg-white border-r border-slate-100 relative isolate z-40 flex-col overflow-visible"
          onMouseLeave={() => setHoveredCategory(null)}
        >
          {/* Top Filters */}
          <div className="w-full p-4 pb-0 flex-shrink-0 space-y-3">
            <div className="pb-3 border-b border-slate-100">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">{t.location}</label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-700 bg-white focus:outline-none focus:border-[#0044FF]"
              >
                {MUNICIPALITIES.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>
            </div>
            <div className="pb-3 border-b border-slate-100">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">{t.priceRange}</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#0044FF]"
                />
                <input
                  type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#0044FF]"
                />
              </div>
            </div>
          </div>

          {/* Category List Track */}
          <div className="flex-1 overflow-y-auto px-3 py-3">
            {MARKET_TAXONOMY.map((cat) => (
              <div
                key={cat.name}
                onMouseEnter={() => setHoveredCategory(cat.name)}
                onClick={() => {
                  setSelectedCategory(selectedCategory === cat.name ? null : cat.name);
                  setSelectedSubcategory(null);
                }}
                className={`flex items-center justify-between py-2.5 px-3 rounded-lg cursor-pointer text-xs font-medium transition-colors ${
                  selectedCategory === cat.name || hoveredCategory === cat.name
                    ? 'bg-slate-50 text-[#0044FF]'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span className="text-sm flex-shrink-0">{cat.icon}</span>
                  <span className="truncate">{cat.name}</span>
                </span>
                <ChevronRight className="h-3 w-3 opacity-40 flex-shrink-0" />
              </div>
            ))}
          </div>

          {/* Unified Fixed Parallel Flyout Tray - pinned top-0, full height */}
          {hoveredCategory && (
            <div
              onMouseEnter={() => setHoveredCategory(hoveredCategory)}
              onMouseLeave={() => setHoveredCategory(null)}
              className="absolute left-full top-0 w-64 bg-white border border-slate-200 shadow-2xl rounded-r-xl p-4 z-50 h-full overflow-y-auto pointer-events-auto block"
              style={{ marginLeft: '-1px' }}
            >
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">{hoveredCategory}</p>
              <button
                onClick={() => { setSelectedCategory(hoveredCategory); setSelectedSubcategory(null); setHoveredCategory(null); }}
                className="w-full text-left py-2 px-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-[#0044FF] block transition-colors"
              >
                {t.allCat}
              </button>
              {activeSubcategories.map(sub => (
                <button
                  key={sub}
                  onClick={() => { setSelectedCategory(hoveredCategory); setSelectedSubcategory(sub); setHoveredCategory(null); }}
                  className={`w-full text-left py-2 px-2 rounded-lg text-xs font-medium block transition-colors ${
                    selectedSubcategory === sub ? 'bg-blue-50 text-[#0044FF]' : 'text-slate-600 hover:bg-slate-50 hover:text-[#0044FF]'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}
        </aside>

        {/* Floating View Toggle Pill - bottom-center on mobile, hidden on lg+ (uses permanent split) */}
        <div
          onClick={() => setIsMapViewActive(!isMapViewActive)}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white border border-slate-200 px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-1.5 cursor-pointer font-semibold text-xs text-slate-800 active:scale-95 lg:hidden"
        >
          {isMapViewActive ? (
            <><LayoutGrid className="w-3.5 h-3.5" /> {t.listView}</>
          ) : (
            <><MapPin className="w-3.5 h-3.5" /> {t.mapView}</>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 h-full bg-slate-50 relative z-10 overflow-hidden flex flex-col">
          {!isMapViewActive ? (
            /* Masonry Grid Feed - tighter mobile spacing */
            <div className="flex-1 overflow-y-auto px-2 sm:px-4 pt-3 sm:pt-4 pb-24">
              {/* Featured Markets Carousel */}
              <FeaturedCarousel mode="markets" />

              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 sm:mb-3 px-1">
                {filteredItems.length} items found
                {selectedCategory && <span className="text-[#0044FF]"> in {selectedCategory}</span>}
                {selectedSubcategory && <span className="text-slate-500"> / {selectedSubcategory}</span>}
              </p>
              <div className="columns-2 lg:columns-3 gap-2 sm:gap-3 w-full">
                {filteredItems.map((item, index) => (
                  <div
                    key={item.id}
                    id={`market-item-${item.id}`}
                    onMouseEnter={() => setActiveHoverId(item.id)}
                    onMouseLeave={() => setActiveHoverId(null)}
                    className="break-inside-avoid inline-block w-full mb-2 sm:mb-3"
                  >
                    <div
                      onClick={() => handleItemClick(item)}
                      className={`bg-white border rounded-xl shadow-sm hover:shadow-md transition-all group overflow-hidden cursor-pointer ${
                        activeHoverId === item.id ? 'border-[#0044FF] ring-2 ring-blue-100' : item.is_featured ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-100'
                      }`}
                    >
                      <div className="relative overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.title}
                          className={`w-full object-cover rounded-t-lg transition-transform duration-300 group-hover:scale-105 bg-slate-100 ${
                            index % 2 === 0 ? 'h-36' : 'h-48'
                          }`}
                        />
                        <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-[9px] font-bold text-slate-600 px-1.5 py-0.5 rounded-full">
                          {item.posted}
                        </span>
                        <span className="absolute top-2 right-2 bg-[#0044FF]/90 text-[9px] font-bold text-white px-1.5 py-0.5 rounded-full">
                          {item.subcategory || item.category.split(" ")[0]}
                        </span>
                        {item.is_featured && (
                          <span className="absolute bottom-2 left-2 bg-amber-500 text-[8px] font-bold text-white px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                            {t.featured}
                          </span>
                        )}
                      </div>
                      <div className="p-2.5">
                        <h3 className="font-bold text-xs text-slate-900 line-clamp-2 leading-tight">{item.title}</h3>
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="h-2.5 w-2.5 text-slate-400" />
                          <p className="text-[10px] text-slate-500 truncate">{item.location}</p>
                        </div>
                        <p className="font-extrabold text-sm text-slate-900 mt-1.5">
                          {item.price.toLocaleString()} <span className="text-[10px] font-medium text-slate-500">CVE</span>
                        </p>
                        {(item.vendor_avatar || item.facebook_handle) && (
                          <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-100">
                            {item.vendor_avatar && (
                              <img src={item.vendor_avatar} alt="" className="h-5 w-5 rounded-full object-cover" />
                            )}
                            <div className="flex items-center gap-1 ml-auto">
                              <a
                                href={`fb://facewebmodal/f?href=https://facebook.com/${item.facebook_handle || 'pro.cv'}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTimeout(() => { window.open(`https://facebook.com/${item.facebook_handle || 'pro.cv'}`, '_blank'); }, 500);
                                }}
                                className="inline-flex items-center justify-center h-6 w-6 rounded-full border border-slate-200 text-[#1877F2] hover:bg-blue-50 transition-colors"
                              >
                                <Facebook className="h-3 w-3" />
                              </a>
                              <a
                                href="#"
                                onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
                                className="inline-flex items-center justify-center h-6 w-6 rounded-full border border-slate-200 text-green-600 hover:bg-green-50 transition-colors"
                              >
                                <MessageCircle className="h-3 w-3" />
                              </a>
                              <a
                                href="#"
                                onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
                                className="inline-flex items-center justify-center h-6 w-6 rounded-full border border-slate-200 text-[#0044FF] hover:bg-blue-50 transition-colors"
                              >
                                <Phone className="h-3 w-3" />
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {filteredItems.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-5">
                    <Package className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">
                    No items found{selectedCategory ? ` in ${selectedCategory}` : ''} yet
                  </h3>
                  <p className="text-sm text-slate-500 max-w-md mb-6">
                    Be the first to post an ad in Cape Verde! List your items, vehicles, services, or anything else for the community.
                  </p>
                  <button
                    onClick={() => router.push('/sell')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Post Your First Ad
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Split Map View - hardware-accelerated drawer on mobile */
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
              {/* Map pane (full on mobile, right on desktop) */}
              <div className="flex-1 h-full relative order-1 md:order-2">
                <SafeLeafletMap
                  items={mapMarkers}
                  activeItem={mapMarkers.find(m => m.id === activeHoverId) || null}
                  onPinClick={handleMapPinClick}
                  onBoundsChange={handleBoundsChange}
                  onDetailRequest={handleDetailRequest}
                />
              </div>
              {/* Desktop sidebar / Mobile bottom drawer with GPU-accelerated slide */}
              <div className="
                order-2 md:order-1
                fixed md:relative
                bottom-0 left-0 right-0 md:bottom-auto md:left-auto md:right-auto
                w-full md:w-80
                h-[45vh] md:h-full
                bg-white
                border-t md:border-t-0 md:border-r border-slate-200
                rounded-t-2xl md:rounded-none
                shadow-[0_-4px_20px_rgba(0,0,0,0.1)] md:shadow-none
                z-30 md:z-auto
                overflow-hidden
                will-change-transform
                translate-y-0
                transition-transform duration-300
              " style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
                {/* Drawer handle for mobile */}
                <div className="md:hidden flex justify-center pt-2 pb-1">
                  <div className="w-10 h-1 bg-slate-300 rounded-full" />
                </div>
                <div className="h-full overflow-y-auto px-2 py-2 md:px-3 md:py-3">
                  <div className="columns-1 gap-1.5 md:gap-2">
                    {filteredItems.map((item, index) => (
                      <div
                        key={item.id}
                        id={`market-item-${item.id}`}
                        onMouseEnter={() => setActiveHoverId(item.id)}
                        onMouseLeave={() => setActiveHoverId(null)}
                        onClick={() => handleItemClick(item)}
                        className={`break-inside-avoid inline-block w-full mb-1.5 md:mb-2 bg-white border rounded-xl shadow-xs transition-all overflow-hidden cursor-pointer touch-target-sm ${
                          activeHoverId === item.id ? 'border-[#0044FF] shadow-sm scale-[0.99]' : 'border-slate-100'
                        }`}
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          className={`w-full object-cover bg-slate-100 ${index % 2 === 0 ? 'h-20 md:h-24' : 'h-28 md:h-32'}`}
                        />
                        <div className="p-1.5 md:p-2">
                          <h3 className="font-bold text-[11px] text-slate-900 line-clamp-1">{item.title}</h3>
                          <p className="font-extrabold text-xs text-slate-900 mt-0.5">
                            {item.price.toLocaleString()} <span className="text-[9px] font-medium text-slate-500">CVE</span>
                          </p>
                          {(item.vendor_avatar || item.facebook_handle) && (
                            <div className="flex items-center gap-1 mt-1.5 pt-1.5 border-t border-slate-100">
                              {item.vendor_avatar && (
                                <img src={item.vendor_avatar} alt="" className="h-4 w-4 rounded-full object-cover" />
                              )}
                              <a
                                href={`fb://facewebmodal/f?href=https://facebook.com/${item.facebook_handle || 'pro.cv'}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTimeout(() => { window.open(`https://facebook.com/${item.facebook_handle || 'pro.cv'}`, '_blank'); }, 500);
                                }}
                                className="ml-auto inline-flex items-center justify-center h-5 w-5 rounded-full border border-slate-200 text-[#1877F2] hover:bg-blue-50 transition-colors"
                              >
                                <Facebook className="h-2.5 w-2.5" />
                              </a>
                              <a
                                href="#"
                                onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
                                className="inline-flex items-center justify-center h-5 w-5 rounded-full border border-slate-200 text-green-600 hover:bg-green-50 transition-colors"
                              >
                                <MessageCircle className="h-2.5 w-2.5" />
                              </a>
                              <a
                                href="#"
                                onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
                                className="inline-flex items-center justify-center h-5 w-5 rounded-full border border-slate-200 text-[#0044FF] hover:bg-blue-50 transition-colors"
                              >
                                <Phone className="h-2.5 w-2.5" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Item Detail Drawer */}
      <MarketplaceItemDrawer item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
}
