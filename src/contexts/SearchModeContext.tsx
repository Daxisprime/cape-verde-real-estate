'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

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
  selectedIslands: string[];
  toggleIsland: (island: string) => void;
  clearIslands: () => void;
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
  selectedIslands: [],
  toggleIsland: () => {},
  clearIslands: () => {},
});

export function SearchModeProvider({ children }: { children: ReactNode }) {
  const [searchMode, setSearchMode] = useState<SearchMode>("realestate");
  const [listingType, setListingType] = useState<ListingType>("buy");
  const [isResultsViewActive, setIsResultsViewActive] = useState(false);
  const [headerSearchQuery, setHeaderSearchQuery] = useState("");
  const [selectedIslands, setSelectedIslands] = useState<string[]>([]);

  const toggleIsland = useCallback((island: string) => {
    setSelectedIslands(prev =>
      prev.includes(island)
        ? prev.filter(i => i !== island)
        : [...prev, island]
    );
  }, []);

  const clearIslands = useCallback(() => {
    setSelectedIslands([]);
  }, []);

  return (
    <SearchModeContext.Provider value={{
      searchMode, setSearchMode,
      listingType, setListingType,
      isResultsViewActive, setIsResultsViewActive,
      headerSearchQuery, setHeaderSearchQuery,
      selectedIslands, toggleIsland, clearIslands,
    }}>
      {children}
    </SearchModeContext.Provider>
  );
}

export function useSearchMode() {
  return useContext(SearchModeContext);
}
