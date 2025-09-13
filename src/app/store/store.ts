import { createContext, useContext } from 'react';
import { createStore, useStore as useZustandStore } from 'zustand';
import { PreloadedStoreInterface } from './StoreProvider';
import { Country } from '@entities/country/model/types';

export interface StoreInterface {
  currentPage: number;
  perPage: number;
  searchQuery: string;
  totalCountries: Country[];
  filteredCountries: Country[];
  topAnchor: number;
  botAnchor: number;
  setCurrentPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  setSearchQuery: (query: string) => void;
  getLastPage: () => number;
  getFilteredCountries: () => Country[];
  getSlicedCountries: (page: number) => Country[];
  getCurrentPage: () => number;
  setTopAnchor: (anchor: number) => void;
  setBotAnchor: (anchor: number) => void;
  getPreviousCountries: () => Country[];
  getMoreCountries: () => Country[];
}

function getDefaultInitialState() {
  return {
    currentPage: 1,
    perPage: 12,
    searchQuery: '',
    totalCountries: [],
    topAnchor: 1,
    botAnchor: 1,
  } as const;
}

export type StoreType = ReturnType<typeof initializeStore>;

const storeContext = createContext<StoreType | null>(null);

export const Provider = storeContext.Provider;

export function useStore<T>(selector: (state: StoreInterface) => T) {
  const store = useContext(storeContext);

  if (!store) throw new Error('Store is missing the provider');

  return useZustandStore(store, selector);
}

export function initializeStore(preloadedState: PreloadedStoreInterface) {
  return createStore<StoreInterface>((set, get) => ({
    ...getDefaultInitialState(),
    ...preloadedState,
    setCurrentPage: currentPage => {
      const { getLastPage } = get();
      return set({
        currentPage: Math.min(currentPage, getLastPage()),
        topAnchor: currentPage,
        botAnchor: currentPage,
      });
    },
    setPerPage: perPage =>
      set({
        perPage,
      }),
    setSearchQuery: searchQuery => {
      const { totalCountries } = get();
      const filteredCountries = totalCountries.filter(country =>
        `${country.name.common}${country.cca3}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
      return set({ searchQuery, filteredCountries });
    },
    getLastPage: () => {
      const { getFilteredCountries, perPage } = get();
      return Math.max(Math.ceil(getFilteredCountries().length / perPage), 1);
    },
    getFilteredCountries: () => {
      const { searchQuery, totalCountries } = get();
      return totalCountries.filter(country =>
        `${country.name.common}${country.cca3}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    },
    getCurrentPage: () => {
      const { getLastPage, currentPage } = get();
      return Math.min(currentPage, getLastPage());
    },
    getSlicedCountries: page => {
      const { getFilteredCountries, perPage } = get();
      return getFilteredCountries().slice((page - 1) * perPage, page * perPage);
    },
    setTopAnchor: topAnchor => set({ topAnchor }),
    setBotAnchor: botAnchor => set({ botAnchor }),
    getPreviousCountries: () => {
      const { filteredCountries, perPage, getCurrentPage, topAnchor } = get();

      const currentPage = getCurrentPage();
      const anchor = Math.min(topAnchor, currentPage);

      if (anchor === currentPage) return [];

      return filteredCountries.slice(
        (anchor - 1) * perPage,
        currentPage * perPage
      );
    },
    getMoreCountries: () => {
      const {
        getFilteredCountries,
        perPage,
        getCurrentPage,
        botAnchor,
        getLastPage,
      } = get();

      const lastPage = getLastPage();
      const currentPage = getCurrentPage();
      const anchor = Math.max(Math.min(botAnchor, lastPage), currentPage);

      if (anchor === currentPage) return [];

      return getFilteredCountries().slice(
        currentPage * perPage,
        botAnchor * perPage
      );
    },
  }));
}
