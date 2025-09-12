import { createContext, useContext } from 'react';
import { createStore, useStore as useZustandStore } from 'zustand';
import { PreloadedStoreInterface } from './StoreProvider';
import { Country } from '@entities/country/model/types';

export interface StoreInterface {
  currentPage: number;
  perPage: number;
  searchQuery: string;
  totalCountries: Country[];
  setCurrentPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  setSearchQuery: (query: string) => void;
  getLastPage: () => number;
  getFilteredCountries: () => Country[];
  getSlicedCountries: (page: number) => Country[];
  getCurrentPage: () => number;
}

function getDefaultInitialState() {
  return {
    currentPage: 1,
    perPage: 12,
    searchQuery: '',
    totalCountries: [],
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
      return set({
        currentPage,
      });
    },
    setPerPage: perPage =>
      set({
        perPage,
      }),
    setSearchQuery: searchQuery => set({ searchQuery }),
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
    getSlicedCountries: () => {
      return [];
    },
  }));
}
