"use client";
import React, { createContext, useContext, useState } from "react";

export type SearchContextValue = {
  keyword: string;
  setKeyword: (keyword: string) => void;
};

export const SearchContext = createContext<SearchContextValue>({
    keyword: "",
  setKeyword: () => undefined,
});

export const SearchProvider = ({ children }: { children: React.ReactNode }) => {
    const [keyword, setKeyword] = useState("");

    return (
        <SearchContext.Provider value={{ keyword, setKeyword }}>
            {children}
        </SearchContext.Provider>
    );
};

export const useSearchContext = () => useContext(SearchContext);
