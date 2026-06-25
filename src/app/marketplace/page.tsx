'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, MapPin, ChevronRight, SlidersHorizontal, X, Package, Plus, Home } from 'lucide-react';
import { useMarketplace, MARKETPLACE_CATEGORIES, CAPE_VERDE_ISLANDS } from '@/hooks/useMarketplace';
import { useLanguage } from '@/contexts/LanguageContext';

const CVE_TO_EUR = 0.00907;

function formatPrice(cve: number): string {
  return cve.toLocaleString('pt-CV');
}

function cveToEur(cve: number): string {
  return (cve * CVE_TO_EUR).toFixed(0);
}

export default function MarketplacePage() {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedIsland, setSelectedIsland] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const { items, loading } = useMarketplace({
    category: selectedCategory,
    subcategory: selectedSubcategory,
    island: selectedIsland,
    searchQuery: submittedQuery || undefined,
    minPrice: minPrice ? Number(minPrice) : null,
    maxPrice: maxPrice ? Number(maxPrice) : null,
  });

  const activeSubcategories = useMemo(() => {
    const cat = MARKETPLACE_CATEGORIES.find(c => c.name === (hoveredCategory || selectedCategory));
    return cat?.subcategories || [];
  }, [hoveredCategory, selectedCategory]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSubmittedQuery(searchQuery);
  }

  function clearFilters() {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSelectedIsland(null);
    setSearchQuery('');
    setSubmittedQuery('');
    setMinPrice('');
    setMaxPrice('');
  }

  const hasActiveFilters = selectedCategory || selectedIsland || submittedQuery || minPrice || maxPrice;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors flex-shrink-0">
            <Home className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Home</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-300 flex-shrink-0" />
          <h1 className="text-lg font-bold text-slate-900 flex-shrink-0">Marketplace</h1>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-lg ml-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search items, services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-full bg-slate-100 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>
          </form>

          {/* Mobile filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          <Link
            href="/sell"
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            Post Ad
          </Link>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto flex">
        {/* Left Sidebar - Categories */}
        <aside
          className={`${showFilters ? 'fixed inset-0 z-50 bg-white overflow-y-auto pt-4' : 'hidden'} md:block md:relative md:w-64 lg:w-72 md:flex-shrink-0 md:border-r md:border-slate-200 md:bg-white md:min-h-[calc(100vh-60px)]`}
          onMouseLeave={() => setHoveredCategory(null)}
        >
          {/* Mobile close */}
          {showFilters && (
            <div className="md:hidden flex items-center justify-between px-4 pb-3 border-b border-slate-200">
              <span className="font-bold text-slate-900">Filters</span>
              <button onClick={() => setShowFilters(false)} className="p-2 text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Island Filter */}
          <div className="p-4 border-b border-slate-100">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Island</label>
            <select
              value={selectedIsland || ''}
              onChange={(e) => setSelectedIsland(e.target.value || null)}
              className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-700 bg-white focus:outline-none focus:border-blue-500 transition"
            >
              <option value="">All Islands</option>
              {CAPE_VERDE_ISLANDS.map(island => (
                <option key={island} value={island}>{island}</option>
              ))}
            </select>
          </div>

          {/* Price Filter */}
          <div className="p-4 border-b border-slate-100">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Price (CVE)</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="p-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-1">Categories</label>
            {MARKETPLACE_CATEGORIES.map((cat) => (
              <div
                key={cat.name}
                onMouseEnter={() => setHoveredCategory(cat.name)}
                onClick={() => {
                  setSelectedCategory(selectedCategory === cat.name ? null : cat.name);
                  setSelectedSubcategory(null);
                  setShowFilters(false);
                }}
                className={`flex items-center justify-between py-2.5 px-3 rounded-lg cursor-pointer text-xs font-medium transition-colors ${
                  selectedCategory === cat.name
                    ? 'bg-blue-50 text-blue-600'
                    : hoveredCategory === cat.name
                      ? 'bg-slate-50 text-slate-800'
                      : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-base flex-shrink-0">{cat.icon}</span>
                  <span>{cat.name}</span>
                </span>
                {cat.subcategories.length > 0 && (
                  <ChevronRight className="h-3 w-3 opacity-40 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>

          {/* Subcategory Flyout */}
          {hoveredCategory && activeSubcategories.length > 0 && (
            <div
              onMouseEnter={() => setHoveredCategory(hoveredCategory)}
              onMouseLeave={() => setHoveredCategory(null)}
              className="hidden md:block absolute left-full top-0 w-56 bg-white border border-slate-200 shadow-xl rounded-r-xl p-4 z-50 h-full overflow-y-auto"
              style={{ marginLeft: '-1px' }}
            >
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">{hoveredCategory}</p>
              <button
                onClick={() => { setSelectedCategory(hoveredCategory); setSelectedSubcategory(null); setHoveredCategory(null); }}
                className="w-full text-left py-2 px-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
              >
                All in {hoveredCategory}
              </button>
              {activeSubcategories.map(sub => (
                <button
                  key={sub}
                  onClick={() => { setSelectedCategory(hoveredCategory); setSelectedSubcategory(sub); setHoveredCategory(null); setShowFilters(false); }}
                  className={`w-full text-left py-2 px-2 rounded-lg text-xs font-medium transition-colors ${
                    selectedSubcategory === sub ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}

          {hasActiveFilters && (
            <div className="p-4 border-t border-slate-100">
              <button
                onClick={clearFilters}
                className="w-full py-2 text-xs font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 px-3 sm:px-4 lg:px-6 py-4">
          {/* Breadcrumb / Active Filters */}
          <div className="flex items-center flex-wrap gap-2 mb-4">
            {selectedCategory && (
              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                {MARKETPLACE_CATEGORIES.find(c => c.name === selectedCategory)?.icon} {selectedCategory}
                <button onClick={() => { setSelectedCategory(null); setSelectedSubcategory(null); }} className="ml-1 hover:text-blue-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedSubcategory && (
              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-xs font-medium px-2.5 py-1 rounded-full">
                {selectedSubcategory}
                <button onClick={() => setSelectedSubcategory(null)} className="ml-1 hover:text-slate-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedIsland && (
              <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">
                <MapPin className="w-3 h-3" /> {selectedIsland}
                <button onClick={() => setSelectedIsland(null)} className="ml-1 hover:text-green-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {submittedQuery && (
              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-medium px-2.5 py-1 rounded-full">
                &quot;{submittedQuery}&quot;
                <button onClick={() => { setSearchQuery(''); setSubmittedQuery(''); }} className="ml-1 hover:text-amber-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          {/* Results Count */}
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            {loading ? 'Loading...' : `${items.length} items found`}
          </p>

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-100 overflow-hidden animate-pulse">
                  <div className="h-40 bg-slate-200" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                    <div className="h-4 bg-slate-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && items.length === 0 && (
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
              <Link
                href="/sell"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Post Your First Ad
              </Link>
            </div>
          )}

          {/* Items Grid */}
          {!loading && items.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-blue-200 transition-all group cursor-pointer"
                >
                  {/* Image */}
                  <div className="relative overflow-hidden">
                    <img
                      src={item.images?.[0] || 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?w=400&h=300&fit=crop'}
                      alt={item.title}
                      className="w-full h-40 object-cover bg-slate-100 group-hover:scale-105 transition-transform duration-300"
                    />
                    {item.is_featured && (
                      <span className="absolute top-2 left-2 bg-amber-500 text-white text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full">
                        Featured
                      </span>
                    )}
                    <span className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-[9px] font-semibold text-slate-600 px-1.5 py-0.5 rounded-full">
                      {item.condition}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-3">
                    <h3 className="font-bold text-xs text-slate-900 line-clamp-2 leading-tight mb-1">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-1 mb-2">
                      <MapPin className="h-2.5 w-2.5 text-slate-400 flex-shrink-0" />
                      <p className="text-[10px] text-slate-500 truncate">
                        {item.municipality ? `${item.municipality}, ` : ''}{item.island}
                      </p>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <p className="font-extrabold text-sm text-slate-900">
                        {formatPrice(item.price_cve)}
                        <span className="text-[10px] font-medium text-slate-500 ml-0.5">CVE</span>
                      </p>
                      <p className="text-[10px] text-slate-400">
                        ~{cveToEur(item.price_cve)} EUR
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Mobile Post Ad FAB */}
          <Link
            href="/sell"
            className="sm:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-6 h-6" />
          </Link>
        </main>
      </div>
    </div>
  );
}
