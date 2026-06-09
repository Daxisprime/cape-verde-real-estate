'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, SlidersHorizontal, X } from 'lucide-react';
import { useSearchMode } from '@/contexts/SearchModeContext';

const CV_9_ISLAND_IMAGES = [
  "https://images.unsplash.com/photo-1591017609590-2cd7c6a0e4ac?w=1920&q=75",
  "https://images.unsplash.com/photo-1624138784614-87fd1b6528f8?w=1920&q=75",
  "https://images.unsplash.com/photo-1586500036706-41963a36c921?w=1920&q=75",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=75",
  "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1920&q=75",
  "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1920&q=75",
  "https://images.unsplash.com/photo-1548013146-72479768bada?w=1920&q=75",
  "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1920&q=75",
  "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=1920&q=75"
];

const PROPERTY_TYPES = ["All", "Apartment", "Villa", "Land"];
const BEDROOM_OPTIONS = [
  { label: "Any", value: "0" },
  { label: "Studio", value: "studio" },
  { label: "1+", value: "1" },
  { label: "2+", value: "2" },
  { label: "3+", value: "3" },
  { label: "4+", value: "4" },
];
const MARKETPLACE_CATEGORIES = [
  "All",
  "Building Materials & Tools",
  "Home, Furniture & Appliances",
  "Electronics & Computers",
  "Maintenance & Repair Services",
  "Professional Services",
  "Fashion & Retail",
];

export default function HeroSection() {
  const [backgroundImage, setBackgroundImage] = useState(CV_9_ISLAND_IMAGES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [marketplaceTab, setMarketplaceTab] = useState<"goods" | "services">("goods");
  const [propertyType, setPropertyType] = useState("All");
  const [bedrooms, setBedrooms] = useState("0");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [marketplaceCategory, setMarketplaceCategory] = useState("All");
  const filterRef = useRef<HTMLDivElement>(null);
  const { searchMode, setSearchMode, listingType, setListingType, setIsResultsViewActive, setHeaderSearchQuery } = useSearchMode();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const activeIndex = dayOfYear % CV_9_ISLAND_IMAGES.length;
    setBackgroundImage(CV_9_ISLAND_IMAGES[activeIndex]);
  }, []);

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

  const handleSearch = () => {
    setHeaderSearchQuery(searchQuery);
    setIsResultsViewActive(true);
  };

  const getSlogan = () => {
    if (searchMode === "markets") {
      return "Discover markets and services across Cabo Verde";
    }
    if (listingType === "rent") {
      return "Discover properties for rent across Cabo Verde";
    }
    return "Discover properties for sale across Cabo Verde";
  };

  return (
    <section
      className="relative w-full h-[72vh] min-h-[500px] flex flex-col bg-cover bg-center transition-all duration-1000 ease-in-out"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="absolute inset-0 bg-slate-950/40 z-0 backdrop-blur-[1px]" />


      {/* Centered content area */}
      <div className="relative z-10 flex-1 flex items-center justify-center">
        <div className="w-full max-w-2xl mx-auto px-4 text-center flex flex-col items-center gap-8">
          {/* Dynamic 3-way Slogan - scaled for desktop */}
          <h2 className="text-lg sm:text-xl lg:text-2xl font-medium tracking-tight text-white drop-shadow-md transition-all duration-200 lg:whitespace-nowrap max-w-max mx-auto">
            {getSlogan()}
          </h2>

          {/* Search Container */}
          <div className="w-full relative" ref={filterRef}>
            {/* Centered Search Tabs with red underline */}
            <div className="flex justify-center mb-4">
              {searchMode === "realestate" ? (
                <div className="flex gap-1">
                  <button
                    onClick={() => setListingType("buy")}
                    className={`relative px-5 py-2 text-[13px] font-semibold tracking-wide transition-colors ${
                      listingType === "buy" ? "text-white" : "text-white/50 hover:text-white/75"
                    }`}
                  >
                    For Sale
                    {listingType === "buy" && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[calc(100%-24px)] h-[3px] bg-[#EF4444] rounded-full" />
                    )}
                  </button>
                  <button
                    onClick={() => setListingType("rent")}
                    className={`relative px-5 py-2 text-[13px] font-semibold tracking-wide transition-colors ${
                      listingType === "rent" ? "text-white" : "text-white/50 hover:text-white/75"
                    }`}
                  >
                    To Rent
                    {listingType === "rent" && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[calc(100%-24px)] h-[3px] bg-[#EF4444] rounded-full" />
                    )}
                  </button>
                </div>
              ) : (
                <div className="flex gap-1">
                  <button
                    onClick={() => setMarketplaceTab("goods")}
                    className={`relative px-5 py-2 text-[13px] font-semibold tracking-wide transition-colors ${
                      marketplaceTab === "goods" ? "text-white" : "text-white/50 hover:text-white/75"
                    }`}
                  >
                    Goods
                    {marketplaceTab === "goods" && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[calc(100%-24px)] h-[3px] bg-[#EF4444] rounded-full" />
                    )}
                  </button>
                  <button
                    onClick={() => setMarketplaceTab("services")}
                    className={`relative px-5 py-2 text-[13px] font-semibold tracking-wide transition-colors ${
                      marketplaceTab === "services" ? "text-white" : "text-white/50 hover:text-white/75"
                    }`}
                  >
                    Local Services
                    {marketplaceTab === "services" && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[calc(100%-24px)] h-[3px] bg-[#EF4444] rounded-full" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Main Search Bar */}
            <div className="w-full flex items-center bg-white rounded-xl md:rounded-2xl shadow-2xl border border-slate-200 p-1.5 md:p-2 max-w-xl md:max-w-none mx-auto">
              <div className="flex-1 relative flex items-center min-w-0">
                <MapPin className="absolute left-3 md:left-4 h-4 w-4 md:h-5 md:w-5 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder={searchMode === "realestate"
                    ? "Island or neighborhood..."
                    : "Search items or services..."
                  }
                  className="w-full pl-9 md:pl-12 pr-2 py-2.5 md:py-3 text-sm text-gray-800 bg-transparent outline-none placeholder-gray-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`flex items-center gap-1.5 p-2.5 md:px-3 md:py-2.5 rounded-lg md:rounded-xl text-xs font-semibold transition-all border ${
                    isFilterOpen
                      ? "bg-blue-50 text-[#2563EB] border-blue-200"
                      : "bg-gray-50 text-[#2563EB] border-gray-200 hover:bg-blue-50"
                  }`}
                >
                  {isFilterOpen ? <X className="h-4 w-4" /> : <SlidersHorizontal className="h-4 w-4" />}
                  <span className="hidden md:inline">Filters</span>
                </button>

                <button
                  onClick={handleSearch}
                  className="bg-[#0044FF] hover:bg-[#0033CC] text-white font-bold p-2.5 md:px-5 md:py-2.5 rounded-lg md:rounded-xl flex items-center justify-center gap-2 transition shadow-md whitespace-nowrap text-sm"
                >
                  <Search className="h-4 w-4" />
                  <span className="hidden md:inline">Search</span>
                </button>
              </div>
            </div>

            {/* Absolute Floating Filter Overlay */}
            {isFilterOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-full z-30 bg-white rounded-xl shadow-xl border border-gray-200 p-4">
                {searchMode === "realestate" ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Type</label>
                      <select
                        value={propertyType}
                        onChange={(e) => setPropertyType(e.target.value)}
                        className="w-full px-2.5 py-2 text-xs text-gray-800 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-400"
                      >
                        {PROPERTY_TYPES.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Bedrooms</label>
                      <select
                        value={bedrooms}
                        onChange={(e) => setBedrooms(e.target.value)}
                        className="w-full px-2.5 py-2 text-xs text-gray-800 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-400"
                      >
                        {BEDROOM_OPTIONS.map((opt) => (
                          <option key={opt.value + opt.label} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Min Price</label>
                      <input
                        type="number"
                        placeholder="CVE"
                        value={priceMin}
                        onChange={(e) => setPriceMin(e.target.value)}
                        className="w-full px-2.5 py-2 text-xs text-gray-800 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Max Price</label>
                      <input
                        type="number"
                        placeholder="CVE"
                        value={priceMax}
                        onChange={(e) => setPriceMax(e.target.value)}
                        className="w-full px-2.5 py-2 text-xs text-gray-800 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-400"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Category</label>
                      <select
                        value={marketplaceCategory}
                        onChange={(e) => setMarketplaceCategory(e.target.value)}
                        className="w-full px-2.5 py-2 text-xs text-gray-800 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-400"
                      >
                        {MARKETPLACE_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Min Price</label>
                      <input
                        type="number"
                        placeholder="CVE"
                        value={priceMin}
                        onChange={(e) => setPriceMin(e.target.value)}
                        className="w-full px-2.5 py-2 text-xs text-gray-800 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Max Price</label>
                      <input
                        type="number"
                        placeholder="CVE"
                        value={priceMax}
                        onChange={(e) => setPriceMax(e.target.value)}
                        className="w-full px-2.5 py-2 text-xs text-gray-800 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-400"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
