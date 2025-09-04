import React, { createContext, useContext, useState } from "react";

const CardCacheContext = createContext();

export const CardCacheProvider = ({ children }) => {
  const [listCache, setListCache] = useState({}); // cache de búsquedas
  const [detailCache, setDetailCache] = useState({}); // cache de detalles

  const setCardsForQuery = (query, cards) => {
    setListCache((prev) => ({ ...prev, [query]: cards }));
  };

  const getCardsForQuery = (query) => listCache[query] || null;

  const setCardDetailCache = (link, data) => {
    setDetailCache((prev) => ({ ...prev, [link]: data }));
  };

  const getCardDetailCache = (link) => detailCache[link] || null;

  return (
    <CardCacheContext.Provider
      value={{
        getCardsForQuery,
        setCardsForQuery,
        getCardDetailCache,
        setCardDetailCache,
      }}
    >
      {children}
    </CardCacheContext.Provider>
  );
};

export const useCardCache = () => useContext(CardCacheContext);
