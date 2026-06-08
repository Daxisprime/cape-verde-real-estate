'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, SlidersHorizontal, X } from 'lucide-react';

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

type SearchMode = "properties" | "marketplace";

const PROPERTY_TYPES = ["All", "Apartment", "Villa", "Land"];
const BEDROOM_OPTIONS = ["Studio", "1+", "2+", "3+", "4+"];
const MARKETPLACE_CATEGORIES = ["All", "Construction", "Appliances", "Services"];

export default function HeroSection() {
  const [backgroundImage, setBackgroundImage] = useState(CV_9_ISLAND_IMAGES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchMode, setSearchMode] = useState<SearchMode>("properties");
  const [listingType, setListingType] = useState<"buy" | "rent">("buy");
  const [propertyType, setPropertyType] = useState("All");
  const [bedrooms, setBedrooms] = useState("Studio");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [marketplaceCategory, setMarketplaceCategory] = useState("All");
  const router = useRouter();

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

  const handleSearch = () => {
    const params = new URLSearchParams();
    params.set("type", listingType);
    if (searchQuery.trim()) params.set("q", searchQuery.trim());

    if (searchMode === "properties") {
      if (propertyType !== "All") params.set("propertyType", propertyType.toLowerCase());
      if (bedrooms !== "Studio") params.set("beds", bedrooms.replace("+", ""));
      if (priceMin) params.set("priceMin", priceMin);
      if (priceMax) params.set("priceMax", priceMax);
    } else {
      params.set("mode", "marketplace");
      if (marketplaceCategory !== "All") params.set("category", marketplaceCategory.toLowerCase());
      if (priceMin) params.set("priceMin", priceMin);
      if (priceMax) params.set("priceMax", priceMax);
    }

    router.push(`/map?${params.toString()}`);
  };

  return (
    <section
      className="relative w-full h-[75vh] min-h-[500px] flex items-center justify-center bg-cover bg-center transition-all duration-1000 ease-in-out"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="absolute inset-0 bg-slate-950/40 z-0 backdrop-blur-[1px]" />

      <div className="relative z-10 w-full max-w-2xl mx-auto px-4 text-center text-white space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight drop-shadow-md">
            Find Your Space in Cape Verde
          </h1>
          <p className="text-sm md:text-base text-gray-100 font-medium tracking-wide drop-shadow-sm">
            Discover houses, apartments, and commercial listings across 9 inhabited islands
          </p>
        </div>

        {/* Search Box + Filter Drawer Container */}
        <div className="w-full space-y-0">
          {/* Mode Toggle */}
          <div className="flex justify-center mb-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-0.5 flex">
              <button
                onClick={() => setSearchMode("properties")}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  searchMode === "properties"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-white/80 hover:text-white"
                }`}
              >
                Properties
              </button>
              <button
                onClick={() => setSearchMode("marketplace")}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  searchMode === "marketplace"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-white/80 hover:text-white"
                }`}
              >
                Marketplace & Services
              </button>
            </div>
          </div>

          {/* Buy/Rent Switch (Properties mode only) */}
          {searchMode === "properties" && (
            <div className="flex justify-center mb-3">
              <div className="flex gap-1">
                <button
                  onClick={() => setListingType("buy")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    listingType === "buy"
                      ? "bg-[#2563EB] text-white"
                      : "bg-white/20 text-white/80 hover:bg-white/30"
                  }`}
                >
                  Buy
                </button>
                <button
                  onClick={() => setListingType("rent")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    listingType === "rent"
                      ? "bg-[#2563EB] text-white"
                      : "bg-white/20 text-white/80 hover:bg-white/30"
                  }`}
                >
                  Rent
                </button>
              </div>
            </div>
          )}

          {/* Main Search Bar */}
          <div className="w-full bg-white p-2 rounded-2xl shadow-2xl border border-white/20">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 relative flex items-center">
                <MapPin className="absolute left-4 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={searchMode === "properties"
                    ? "Enter island or neighborhood (e.g., Palmarejo, Sal)..."
                    : "Search items, services, or suppliers..."
                  }
                  className="w-full pl-12 pr-4 py-3 text-sm text-gray-800 bg-transparent outline-none placeholder-gray-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`flex items-center gap-1.5 px-3 py-3 rounded-xl text-xs font-semibold transition-all border ${
                    isFilterOpen
                      ? "bg-blue-50 text-[#2563EB] border-blue-200"
                      : "bg-gray-50 text-[#2563EB] border-gray-200 hover:bg-blue-50"
                  }`}
                >
                  {isFilterOpen ? <X className="h-3.5 w-3.5" /> : <SlidersHorizontal className="h-3.5 w-3.5" />}
                  Filters
                </button>

                <button
                  onClick={handleSearch}
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition shadow-md whitespace-nowrap text-sm"
                >
                  <Search className="h-4 w-4" /> Search
                </button>
              </div>
            </div>

            {/* Expanding Filter Drawer */}
            {isFilterOpen && (
              <div className="mt-2 pt-3 border-t border-gray-100 pb-1 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                {searchMode === "properties" ? (
                  <>
                    {/* Property Type Selector */}
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 text-left">Property Type</label>
                      <div className="flex flex-wrap gap-1.5">
                        {PROPERTY_TYPES.map((type) => (
                          <button
                            key={type}
                            onClick={() => setPropertyType(type)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                              propertyType === type
                                ? "bg-[#1e3a8a] text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Bedrooms Track */}
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 text-left">Bedrooms</label>
                      <div className="flex flex-wrap gap-1.5">
                        {BEDROOM_OPTIONS.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => setBedrooms(opt)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                              bedrooms === opt
                                ? "bg-[#1e3a8a] text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Price Range */}
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 text-left">Price Range (CVE)</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Min"
                          value={priceMin}
                          onChange={(e) => setPriceMin(e.target.value)}
                          className="flex-1 px-3 py-2 text-xs text-gray-800 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                        />
                        <input
                          type="number"
                          placeholder="Max"
                          value={priceMax}
                          onChange={(e) => setPriceMax(e.target.value)}
                          className="flex-1 px-3 py-2 text-xs text-gray-800 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Marketplace Category */}
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 text-left">Category</label>
                      <div className="flex flex-wrap gap-1.5">
                        {MARKETPLACE_CATEGORIES.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setMarketplaceCategory(cat)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                              marketplaceCategory === cat
                                ? "bg-[#1e3a8a] text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Price Range */}
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 text-left">Price Range (CVE)</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Min"
                          value={priceMin}
                          onChange={(e) => setPriceMin(e.target.value)}
                          className="flex-1 px-3 py-2 text-xs text-gray-800 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                        />
                        <input
                          type="number"
                          placeholder="Max"
                          value={priceMax}
                          onChange={(e) => setPriceMax(e.target.value)}
                          className="flex-1 px-3 py-2 text-xs text-gray-800 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
