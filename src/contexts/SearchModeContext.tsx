'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

type SearchMode = "realestate" | "markets";
type ListingType = "buy" | "rent";

interface SearchModeContextType {
  searchMode: SearchMode;
  setSearchMode: (mode: SearchMode) => void;
  listingType: ListingType;
  setListingType: (type: ListingType) => void;
}

const SearchModeContext = createContext<SearchModeContextType>({
  searchMode: "realestate",
  setSearchMode: () => {},
  listingType: "buy",
  setListingType: () => {},
});

export function SearchModeProvider({ children }: { children: ReactNode }) {
  const [searchMode, setSearchMode] = useState<SearchMode>("realestate");
  const [listingType, setListingType] = useState<ListingType>("buy");
  return (
    <SearchModeContext.Provider value={{ searchMode, setSearchMode, listingType, setListingType }}>
      {children}
    </SearchModeContext.Provider>
  );
}

export function useSearchMode() {
  return useContext(SearchModeContext);
}
