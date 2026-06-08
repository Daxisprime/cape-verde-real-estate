'use client';

import { useSearchMode } from '@/contexts/SearchModeContext';

const PROPERTY_FILTERS = ["All", "Apartment", "House", "Villa", "Land"];
const MARKET_FILTERS = ["All", "Building Materials", "Electronics", "Furniture", "Services", "Fashion"];

export default function ResultsFilterStrip() {
  const { searchMode, listingType, setListingType } = useSearchMode();

  return (
    <div className="sticky top-16 z-40 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1 py-2 overflow-x-auto scrollbar-hide">
          {searchMode === "realestate" ? (
            <>
              <div className="flex items-center gap-1 mr-4 border-r pr-4 border-gray-200">
                <button
                  onClick={() => setListingType("buy")}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                    listingType === "buy"
                      ? "bg-[#2563EB] text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  For Sale
                </button>
                <button
                  onClick={() => setListingType("rent")}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                    listingType === "rent"
                      ? "bg-[#2563EB] text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  To Rent
                </button>
              </div>
              {PROPERTY_FILTERS.map((filter) => (
                <button
                  key={filter}
                  className="px-3 py-1.5 rounded-full text-xs font-medium text-gray-600 hover:bg-blue-50 hover:text-[#2563EB] transition-all whitespace-nowrap"
                >
                  {filter}
                </button>
              ))}
            </>
          ) : (
            MARKET_FILTERS.map((filter) => (
              <button
                key={filter}
                className="px-3 py-1.5 rounded-full text-xs font-medium text-gray-600 hover:bg-blue-50 hover:text-[#2563EB] transition-all whitespace-nowrap"
              >
                {filter}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
