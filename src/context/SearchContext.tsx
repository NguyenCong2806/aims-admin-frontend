import React, { createContext, useContext, useState, useRef } from "react";

interface SearchContextType {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  clearSearch: () => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  focusSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const clearSearch = () => setSearchTerm("");
  const focusSearch = () => searchInputRef.current?.focus();

  return (
    <SearchContext.Provider
      value={{
        searchTerm,
        setSearchTerm,
        clearSearch,
        searchInputRef,
        focusSearch,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = (): SearchContextType => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
};
