'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

type SearchMode = "realestate" | "markets";
type ListingType = "buy" | "rent";

interface SearchModeContextType {
  searchMode: SearchMode;
  setSearchMode: (mode: SearchMode) => void;
  listingType: ListingType;
  setListingType: (type: ListingType) => void;
  isResultsViewActive: boolean;
  setIsResultsViewActive: (active: boolean) => void;
  headerSearchQuery: string;
  setHeaderSearchQuery: (query: string) => void;
}

const SearchModeContext = createContext<SearchModeContextType>({
  searchMode: "realestate",
  setSearchMode: () => {},
  listingType: "buy",
  setListingType: () => {},
  isResultsViewActive: false,
  setIsResultsViewActive: () => {},
  headerSearchQuery: "",
  setHeaderSearchQuery: () => {},
});

export function SearchModeProvider({ children }: { children: ReactNode }) {
  const [searchMode, setSearchMode] = useState<SearchMode>("realestate");
  const [listingType, setListingType] = useState<ListingType>("buy");
  const [isResultsViewActive, setIsResultsViewActive] = useState(false);
  const [headerSearchQuery, setHeaderSearchQuery] = useState("");
  return (
    <SearchModeContext.Provider value={{
      searchMode, setSearchMode,
      listingType, setListingType,
      isResultsViewActive, setIsResultsViewActive,
      headerSearchQuery, setHeaderSearchQuery,
    }}>
      {children}
    </SearchModeContext.Provider>
  );
}

export function useSearchMode() {
  return useContext(SearchModeContext);
}
