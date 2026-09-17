<<<<<<< HEAD
"use client";
import React, { createContext, useState } from "react";

const SearchContext = createContext({
    keyword: "",
    setKeyword: (keyword: string) => {},
});

const SearchProvider = ({ children }: { children: React.ReactNode }) => {
    const [keyword, setKeyword] = useState("");

    return (
        <SearchContext.Provider value={{ keyword, setKeyword }}>
            {children}
        </SearchContext.Provider>
    );
};

export { SearchContext, SearchProvider };
=======
import { createContext, useContext } from "react";

export type SearchContextValue = {
  keyword: string;
  setKeyword: (keyword: string) => void;
};

export const SearchContext = createContext<SearchContextValue>({
  keyword: "",
  setKeyword: () => undefined,
});

export const useSearchContext = () => useContext(SearchContext);
>>>>>>> 0fa71df (cart)
