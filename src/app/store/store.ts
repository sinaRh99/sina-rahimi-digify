import { createContext, useContext } from 'react';
import { createStore, useStore as useZustandStore } from 'zustand';
import { PreloadedStoreInterface } from './StoreProvider';
import { Country } from '@entities/country/model/types';

/**
 * Interface defining the global store state and actions.
 */
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
  setTopAnchor: (anchor: number) => void;
  setBotAnchor: (anchor: number) => void;
}

/**
 * Returns the default initial state for the store.
 */
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

// React context to provide the store to components
const storeContext = createContext<StoreType | null>(null);

export const Provider = storeContext.Provider;

/**
 * Hook to access the Zustand store using a selector function.
 *
 * @param selector - function to select state from the store
 * @throws Error if the Provider is missing
 */
export function useStore<T>(selector: (state: StoreInterface) => T) {
  const store = useContext(storeContext);

  if (!store) throw new Error('Store is missing the provider');

  return useZustandStore(store, selector);
}

/**
 * Initializes the store with optional preloaded state.
 *
 * @param preloadedState - partial state to initialize the store (e.g., SSR data)
 */
export function initializeStore(preloadedState: PreloadedStoreInterface) {
  return createStore<StoreInterface>((set, get) => ({
    ...getDefaultInitialState(),
    ...preloadedState,

    /**
     * Sets the current page and updates top/bottom anchors accordingly.
     */
    setCurrentPage: currentPage => {
      const { getLastPage } = get();
      return set({
        currentPage: Math.min(currentPage, getLastPage()),
        topAnchor: currentPage,
        botAnchor: currentPage,
      });
    },

    /**
     * Updates the number of items per page and adjusts the current page if necessary.
     */
    setPerPage: perPage =>
      set({
        perPage,
        currentPage: Math.min(get().getLastPage(), get().currentPage),
      }),

    /**
     * Updates the search query and recalculates filteredCountries.
     * Also adjusts the current page to not exceed last page.
     */
    setSearchQuery: searchQuery => {
      const { totalCountries, getLastPage, currentPage } = get();
      const filteredCountries = totalCountries.filter(country =>
        `${country.name.common}${country.cca3}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
      return set({
        searchQuery,
        filteredCountries,
        currentPage: Math.min(getLastPage(), currentPage),
      });
    },

    /**
     * Returns the last available page based on filteredCountries and perPage.
     */
    getLastPage: () => {
      const { filteredCountries, perPage } = get();
      return Math.max(Math.ceil(filteredCountries.length / perPage), 1);
    },

    /**
     * Returns the current page, ensuring it does not exceed last page.
     */
    getCurrentPage: () => {
      const { getLastPage, currentPage } = get();
      return Math.min(currentPage, getLastPage());
    },

    /** Updates the top-side anchor for infinite scroll */
    setTopAnchor: topAnchor => set({ topAnchor }),

    /** Updates the bottom-side anchor for infinite scroll */
    setBotAnchor: botAnchor => set({ botAnchor }),
  }));
}
