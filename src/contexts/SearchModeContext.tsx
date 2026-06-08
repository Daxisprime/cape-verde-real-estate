'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

type SearchMode = "realestate" | "markets";

interface SearchModeContextType {
  searchMode: SearchMode;
  setSearchMode: (mode: SearchMode) => void;
}

const SearchModeContext = createContext<SearchModeContextType>({
  searchMode: "realestate",
  setSearchMode: () => {},
});

export function SearchModeProvider({ children }: { children: ReactNode }) {
  const [searchMode, setSearchMode] = useState<SearchMode>("realestate");
  return (
    <SearchModeContext.Provider value={{ searchMode, setSearchMode }}>
      {children}
    </SearchModeContext.Provider>
  );
}

export function useSearchMode() {
  return useContext(SearchModeContext);
}
