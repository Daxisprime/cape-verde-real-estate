'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useSearchMode } from '@/contexts/SearchModeContext';
import { MapPin, ChevronRight } from 'lucide-react';

const SafeLeafletMap = dynamic(
  () => import('@/components/MapboxMap'),
  {
    ssr: false,
    loading: () => <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-400 text-sm">Loading Map...</div>
  }
);

const CATEGORY_TREE = [
  {
    id: "vehicles",
    label: "Vehicles & Automotive",
    icon: "\uD83D\uDE97",
    subcategories: ["Cars", "Motorbikes", "Parts & Accessories"],
  },
  {
    id: "electronics",
    label: "Electronics & Computers",
    icon: "\uD83D\uDCF1",
    subcategories: ["Smartphones", "Laptops", "TV & Audio"],
  },
  {
    id: "home",
    label: "Home, Furniture & Appliances",
    icon: "\uD83D\uDECB\uFE0F",
    subcategories: ["Beds & Sofas", "Kitchen Appliances", "Decor"],
  },
  {
    id: "building",
    label: "Building Materials & Tools",
    icon: "\uD83E\uDDF1",
    subcategories: ["Cement & Tiles", "Hand Tools", "Electrical Supplies"],
  },
  {
    id: "restaurants",
    label: "Restaurants & Menus",
    icon: "\uD83C\uDF7D\uFE0F",
    subcategories: ["Local Restaurants", "Takeaway/Menus", "Cafes"],
  },
  {
    id: "fashion",
    label: "Fashion & Retail",
    icon: "\uD83D\uDC5F",
    subcategories: ["Shoes", "Apparel", "Bags"],
  },
  {
    id: "babies",
    label: "Babies & Kids Items",
    icon: "\uD83D\uDC76",
    subcategories: ["Toys", "Clothing", "Strollers"],
  },
  {
    id: "pets",
    label: "Pets",
    icon: "\uD83D\uDC3E",
    subcategories: ["Pet Food", "Accessories"],
  },
  {
    id: "maintenance",
    label: "Maintenance & Repair Services",
    icon: "\uD83D\uDD27",
    subcategories: ["Plumbing", "Electricians", "AC Repair"],
  },
  {
    id: "professional",
    label: "Professional Services",
    icon: "\uD83D\uDCBC",
    subcategories: ["Developers", "Photography", "Legal"],
  },
];

const MARKETPLACE_ITEMS = [
  {
    id: "mkt-001",
    title: "Premium Building Cement (50kg bags)",
    price: 850,
    location: "Praia, Santiago",
    category: "Building Materials & Tools",
    subcategory: "Cement & Tiles",
    image: "https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg?w=400&h=300&fit=crop",
    posted: "2 hours ago",
    coordinates: [-23.5133, 14.9177] as [number, number],
  },
  {
    id: "mkt-002",
    title: "Samsung Smart TV 55\" 4K UHD",
    price: 65000,
    location: "Santa Maria, Sal",
    category: "Electronics & Computers",
    subcategory: "TV & Audio",
    image: "https://images.pexels.com/photos/6782567/pexels-photo-6782567.jpeg?w=400&h=300&fit=crop",
    posted: "5 hours ago",
    coordinates: [-22.9, 16.73] as [number, number],
  },
  {
    id: "mkt-003",
    title: "Professional Plumbing & Pipe Repair",
    price: 3500,
    location: "Mindelo, Sao Vicente",
    category: "Maintenance & Repair Services",
    subcategory: "Plumbing",
    image: "https://images.pexels.com/photos/6419128/pexels-photo-6419128.jpeg?w=400&h=300&fit=crop",
    posted: "1 day ago",
    coordinates: [-24.98, 16.87] as [number, number],
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
    coordinates: [-22.93, 16.74] as [number, number],
  },
  {
    id: "mkt-005",
    title: "Legal & Notary Translation Services",
    price: 15000,
    location: "Praia, Santiago",
    category: "Professional Services",
    subcategory: "Legal",
    image: "https://images.pexels.com/photos/5668882/pexels-photo-5668882.jpeg?w=400&h=300&fit=crop",
    posted: "6 hours ago",
    coordinates: [-23.51, 14.92] as [number, number],
  },
  {
    id: "mkt-006",
    title: "Designer Summer Clothing Collection",
    price: 4500,
    location: "Santa Maria, Sal",
    category: "Fashion & Retail",
    subcategory: "Apparel",
    image: "https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?w=400&h=300&fit=crop",
    posted: "12 hours ago",
    coordinates: [-22.9, 16.73] as [number, number],
  },
  {
    id: "mkt-007",
    title: "Industrial Power Drill Set",
    price: 12500,
    location: "Praia, Santiago",
    category: "Building Materials & Tools",
    subcategory: "Hand Tools",
    image: "https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg?w=400&h=300&fit=crop",
    posted: "4 hours ago",
    coordinates: [-23.52, 14.91] as [number, number],
  },
  {
    id: "mkt-008",
    title: "iPhone 15 Pro Max 256GB",
    price: 145000,
    location: "Mindelo, Sao Vicente",
    category: "Electronics & Computers",
    subcategory: "Smartphones",
    image: "https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?w=400&h=300&fit=crop",
    posted: "30 min ago",
    coordinates: [-24.97, 16.88] as [number, number],
  },
  {
    id: "mkt-009",
    title: "AC Installation & Maintenance",
    price: 8000,
    location: "Sal Rei, Boa Vista",
    category: "Maintenance & Repair Services",
    subcategory: "AC Repair",
    image: "https://images.pexels.com/photos/5463576/pexels-photo-5463576.jpeg?w=400&h=300&fit=crop",
    posted: "1 day ago",
    coordinates: [-22.79, 16.18] as [number, number],
  },
  {
    id: "mkt-010",
    title: "Leather Sofa Set - 3 Piece",
    price: 95000,
    location: "Praia, Santiago",
    category: "Home, Furniture & Appliances",
    subcategory: "Beds & Sofas",
    image: "https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg?w=400&h=300&fit=crop",
    posted: "8 hours ago",
    coordinates: [-23.51, 14.93] as [number, number],
  },
  {
    id: "mkt-011",
    title: "Accounting & Tax Advisory",
    price: 20000,
    location: "Praia, Santiago",
    category: "Professional Services",
    subcategory: "Legal",
    image: "https://images.pexels.com/photos/6863183/pexels-photo-6863183.jpeg?w=400&h=300&fit=crop",
    posted: "2 days ago",
    coordinates: [-23.50, 14.92] as [number, number],
  },
  {
    id: "mkt-012",
    title: "Handmade Cape Verdean Jewelry",
    price: 3200,
    location: "Santa Maria, Sal",
    category: "Fashion & Retail",
    subcategory: "Bags",
    image: "https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg?w=400&h=300&fit=crop",
    posted: "5 hours ago",
    coordinates: [-22.91, 16.72] as [number, number],
  },
];

const MUNICIPALITIES = [
  "All Locations",
  "Praia, Santiago",
  "Mindelo, Sao Vicente",
  "Santa Maria, Sal",
  "Espargos, Sal",
  "Sal Rei, Boa Vista",
  "Assomada, Santiago",
  "Porto Novo, Santo Antao",
  "Sao Filipe, Fogo",
];

export default function MarketsView() {
  const { headerSearchQuery } = useSearchMode();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [isMarketMapActive, setIsMarketMapActive] = useState(false);
  const [activeMarketItem, setActiveMarketItem] = useState<string | null>(null);
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    return MARKETPLACE_ITEMS.filter(item => {
      if (selectedCategory && item.category !== selectedCategory) return false;
      if (selectedSubcategory && item.subcategory !== selectedSubcategory) return false;
      if (selectedLocation !== "All Locations" && item.location !== selectedLocation) return false;
      if (minPrice && item.price < parseInt(minPrice)) return false;
      if (maxPrice && item.price > parseInt(maxPrice)) return false;
      if (headerSearchQuery) {
        const q = headerSearchQuery.toLowerCase();
        if (!item.title.toLowerCase().includes(q) &&
            !item.location.toLowerCase().includes(q) &&
            !item.category.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [selectedCategory, selectedSubcategory, selectedLocation, minPrice, maxPrice, headerSearchQuery]);

  const mapMarkers = useMemo(() => {
    return filteredItems.map(item => ({
      id: item.id,
      latitude: item.coordinates[1],
      longitude: item.coordinates[0],
      price: item.price,
      title: item.title,
      image_url: item.image,
      listing_type: "marketplace" as const,
      neighborhood: item.location,
    }));
  }, [filteredItems]);

  function handleMapPinClick(markerItem: any) {
    setActiveMarketItem(markerItem.id);
    const el = document.getElementById(`market-item-${markerItem.id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function handleCategorySelect(label: string) {
    if (selectedCategory === label) {
      setSelectedCategory(null);
      setSelectedSubcategory(null);
    } else {
      setSelectedCategory(label);
      setSelectedSubcategory(null);
    }
  }

  function handleSubcategorySelect(sub: string) {
    setSelectedSubcategory(sub === selectedSubcategory ? null : sub);
  }

  return (
    <div className="relative flex min-h-[calc(100vh-64px)]">
      {/* Floating Top-Center Pill Toggle */}
      <button
        onClick={() => setIsMarketMapActive(!isMarketMapActive)}
        className="fixed top-36 left-1/2 -translate-x-1/2 z-40 bg-white border border-slate-200 px-5 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer font-semibold text-sm text-slate-800"
      >
        {isMarketMapActive ? (
          <><span aria-hidden="true">&#x1F4E6;</span> List View</>
        ) : (
          <><span aria-hidden="true">&#x1F5FA;&#xFE0F;</span> Map View</>
        )}
      </button>

      {/* Left Sidebar - Jiji-Style Nested Category Selector */}
      <aside className="hidden md:block w-64 lg:w-72 flex-shrink-0">
        <div className="sticky top-28 h-[calc(100vh-120px)] overflow-y-auto bg-white border-r border-gray-200 p-4">
          <div className="mb-5 pb-4 border-b border-slate-100">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Location</h3>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-gray-800 focus:border-[#0044FF] focus:ring-2 focus:ring-blue-50 outline-none transition-colors"
            >
              {MUNICIPALITIES.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="mb-5 pb-4 border-b border-slate-100">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Price Range (CVE)</h3>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-1/2 px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-gray-800 placeholder-gray-400 focus:border-[#0044FF] focus:ring-2 focus:ring-blue-50 outline-none transition-colors"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-1/2 px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-gray-800 placeholder-gray-400 focus:border-[#0044FF] focus:ring-2 focus:ring-blue-50 outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Categories</h3>
            <div className="flex flex-col relative">
              <button
                onClick={() => { setSelectedCategory(null); setSelectedSubcategory(null); }}
                className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors text-left ${
                  !selectedCategory
                    ? "bg-blue-50 text-[#0044FF] font-semibold"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span>All Categories</span>
              </button>

              {CATEGORY_TREE.map(cat => (
                <div
                  key={cat.id}
                  className="relative"
                  onMouseEnter={() => setHoveredCategoryId(cat.id)}
                  onMouseLeave={() => setHoveredCategoryId(null)}
                >
                  <button
                    onClick={() => handleCategorySelect(cat.label)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors text-left ${
                      selectedCategory === cat.label
                        ? "bg-blue-50 text-[#0044FF] font-semibold"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="text-sm flex-shrink-0">{cat.icon}</span>
                      <span className="truncate text-xs">{cat.label}</span>
                    </span>
                    <ChevronRight className="h-3 w-3 opacity-40 flex-shrink-0" />
                  </button>

                  {/* Flyout subcategory panel */}
                  {hoveredCategoryId === cat.id && (
                    <div className="absolute left-full top-0 ml-1 bg-white shadow-2xl rounded-r-xl border border-slate-100 p-4 w-56 z-[100] pointer-events-auto">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{cat.label}</p>
                      {cat.subcategories.map(sub => (
                        <button
                          key={sub}
                          onClick={() => {
                            setSelectedCategory(cat.label);
                            handleSubcategorySelect(sub);
                          }}
                          className={`block w-full text-left px-2.5 py-1.5 text-xs rounded-md transition-colors ${
                            selectedSubcategory === sub
                              ? "bg-blue-50 text-[#0044FF] font-semibold"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex ${isMarketMapActive ? 'flex-col md:flex-row' : 'flex-col'} overflow-hidden`}>
        {/* Product Grid */}
        <div className={`overflow-y-auto ${isMarketMapActive ? 'w-full md:w-1/2 h-[50vh] md:h-auto' : 'flex-1'}`}>
          {/* Mobile filter bar */}
          <div className="md:hidden p-3 bg-white border-b border-gray-200 flex gap-2 overflow-x-auto">
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-full border border-gray-200 bg-gray-50 text-gray-700 flex-shrink-0"
            >
              {MUNICIPALITIES.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            {CATEGORY_TREE.slice(0, 6).map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.label)}
                className={`px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition-colors flex-shrink-0 ${
                  selectedCategory === cat.label
                    ? "bg-[#0044FF] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat.icon} {cat.label.split(" ")[0]}
              </button>
            ))}
          </div>

          <div className="p-3 sm:p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              {filteredItems.length} items found
              {selectedCategory && <span className="text-[#0044FF]"> in {selectedCategory}</span>}
              {selectedSubcategory && <span className="text-gray-500"> / {selectedSubcategory}</span>}
            </p>

            {/* Masonry Grid */}
            <div className="columns-2 gap-2 w-full block">
              {filteredItems.map((item, index) => (
                <div key={item.id} id={`market-item-${item.id}`} className="break-inside-avoid inline-block w-full mb-3">
                  <div className={`rounded-xl bg-white cursor-pointer transition overflow-hidden border group ${
                    activeMarketItem === item.id
                      ? 'border-[#0044FF] shadow-lg ring-2 ring-blue-100'
                      : 'border-gray-100 hover:border-[#0044FF]/30 hover:shadow-lg'
                  }`}>
                    <div className="relative overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        className={`w-full object-cover rounded-t-lg bg-gray-100 group-hover:scale-105 transition-transform duration-300 ${index % 2 === 0 ? 'h-40' : 'h-52'}`}
                      />
                      <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-[9px] font-bold text-gray-700 px-1.5 py-0.5 rounded-full">
                        {item.subcategory || item.category.split(" ")[0]}
                      </span>
                    </div>
                    <div className="p-2">
                      <h3 className="font-bold text-xs text-gray-900 line-clamp-2 leading-tight">{item.title}</h3>
                      <p className="font-extrabold text-sm text-gray-900 mt-1">
                        {item.price.toLocaleString()} <span className="text-[10px] font-medium text-gray-500">CVE</span>
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="h-2.5 w-2.5 text-gray-400" />
                        <p className="text-[10px] text-gray-500 truncate">{item.location}</p>
                      </div>
                      <p className="text-[9px] text-gray-400 mt-0.5">{item.posted}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <p className="text-sm">No marketplace items found. Try adjusting your filters.</p>
              </div>
            )}
          </div>
        </div>

        {/* Map Pane */}
        {isMarketMapActive && (
          <div className="w-full md:w-1/2 h-[50vh] md:h-[calc(100vh-64px)] border-l border-gray-200">
            <SafeLeafletMap
              items={mapMarkers}
              activeItem={mapMarkers.find(m => m.id === activeMarketItem) || null}
              onPinClick={handleMapPinClick}
            />
          </div>
        )}
      </div>
    </div>
  );
}
