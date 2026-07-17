'use client';

import { useState, useRef, useEffect } from 'react';
import { SlidersHorizontal, MapPin, ChevronDown, X } from 'lucide-react';
import { useSearchMode } from '@/contexts/SearchModeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { CAPE_VERDE_ISLANDS } from '@/lib/supabase';

export default function ResultsFilterStrip() {
  const { searchMode, listingType, setListingType, selectedIslands, toggleIsland, clearIslands } = useSearchMode();
  const { t } = useLanguage();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isIslandPanelOpen, setIsIslandPanelOpen] = useState(false);
  const [propertyType, setPropertyType] = useState('all');
  const [minBeds, setMinBeds] = useState('0');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);
  const islandPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isIslandPanelOpen) return;
    function handleClick(e: MouseEvent) {
      if (islandPanelRef.current && !islandPanelRef.current.contains(e.target as Node)) {
        setIsIslandPanelOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isIslandPanelOpen]);

  useEffect(() => {
    if (!isFilterOpen) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isFilterOpen]);

  const islandLabel = selectedIslands.length === 0
    ? 'Todas as Ilhas'
    : selectedIslands.length === 1
      ? selectedIslands[0]
      : `${selectedIslands.length} ilhas`;

  return (
    <div className="sticky top-16 z-40 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 py-2">
          {/* Island Multi-Select Toggle */}
          <div className="relative" ref={islandPanelRef}>
            <button
              onClick={() => setIsIslandPanelOpen(!isIslandPanelOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                selectedIslands.length > 0
                  ? 'bg-[#0044FF] text-white border-[#0044FF]'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-blue-50 hover:text-[#0044FF]'
              }`}
            >
              <MapPin className="h-3.5 w-3.5" />
              {islandLabel}
              <ChevronDown className={`h-3 w-3 transition-transform ${isIslandPanelOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Checkbox Panel */}
            {isIslandPanelOpen && (
              <div className="absolute top-full left-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl z-50 w-56 py-2 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-3 pb-2 mb-1 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Ilhas</span>
                  {selectedIslands.length > 0 && (
                    <button
                      onClick={clearIslands}
                      className="text-[10px] font-medium text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      Limpar
                    </button>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto px-1">
                  {CAPE_VERDE_ISLANDS.map((island) => {
                    const checked = selectedIslands.includes(island);
                    return (
                      <label
                        key={island}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                          checked ? 'bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleIsland(island)}
                          className="h-3.5 w-3.5 rounded border-gray-300 text-[#0044FF] focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                        />
                        <span className={`text-xs font-medium ${checked ? 'text-[#0044FF]' : 'text-gray-700'}`}>
                          {island}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-5 w-px bg-gray-200 mx-1" />

          {searchMode === "realestate" ? (
            <>
              <div className="flex items-center gap-1 mr-2">
                <button
                  onClick={() => setListingType("buy")}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                    listingType === "buy"
                      ? "bg-[#0044FF] text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {t.forSaleTab}
                </button>
                <button
                  onClick={() => setListingType("rent")}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                    listingType === "rent"
                      ? "bg-[#0044FF] text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {t.toRent}
                </button>
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
                {t.filters}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                isFilterOpen
                  ? 'bg-blue-50 text-[#0044FF] border-blue-200'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-blue-50 hover:text-[#0044FF]'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {t.filters}
            </button>
          )}

          {/* Active island badges */}
          {selectedIslands.length > 0 && selectedIslands.length <= 3 && (
            <div className="flex items-center gap-1 ml-1">
              {selectedIslands.map(island => (
                <button
                  key={island}
                  onClick={() => toggleIsland(island)}
                  className="flex items-center gap-0.5 px-2 py-1 rounded-full bg-blue-100 text-[#0044FF] text-[10px] font-semibold hover:bg-blue-200 transition-colors"
                >
                  {island}
                  <X className="h-2.5 w-2.5 ml-0.5" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {isFilterOpen && searchMode === "realestate" && (
        <div className="absolute left-0 right-0 top-full bg-white border-b border-gray-200 shadow-xl z-30" ref={panelRef}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{t.propertyType}</label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-gray-800 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-400"
                >
                  <option value="all">{t.any}</option>
                  <option value="apartment">{t.apartment}</option>
                  <option value="house">{t.house}</option>
                  <option value="villa">{t.villa}</option>
                  <option value="land">{t.land}</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{t.bedrooms}</label>
                <select
                  value={minBeds}
                  onChange={(e) => setMinBeds(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-gray-800 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-400"
                >
                  <option value="0">{t.any}</option>
                  <option value="studio">{t.studio}</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>

              <div className="col-span-2 sm:col-span-2">
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{t.priceRange}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder={t.minPrice}
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-gray-800 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-400"
                  />
                  <span className="text-gray-300 text-xs flex-shrink-0">-</span>
                  <input
                    type="number"
                    placeholder={t.maxPrice}
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-gray-800 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-400"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
