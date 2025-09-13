import { createContext, useContext } from "react";
import { createStore, useStore as useZustandStore } from "zustand";
import { PreloadedStoreInterface } from "./StoreProvider";
import { Country } from "@entities/country/model/types";

const minMax = (num: number, min: number, max: number) => {
  return Math.max(Math.min(num, max), min);
};

/**
 * Interface defining the global store state and actions.
 */

export interface StoreState {
  currentPage: number;
  lastPage: number;
  perPage: number;
  searchQuery: string;
  totalCountries: Country[];
  filteredCountries: Country[];
  topAnchor: number;
  botAnchor: number;

  previousCountries: Country[];
  moreCountries: Country[];
}

export interface StoreInterface extends StoreState {
  setCurrentPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  setSearchQuery: (query: string) => void;
  setTopAnchor: (anchor: number) => void;
  setBotAnchor: (anchor: number) => void;
}

/**
 * Returns the default initial state for the store.
 */
function getDefaultInitialState(): StoreState {
  return {
    currentPage: 1,
    lastPage: 1,
    perPage: 12,
    searchQuery: "",
    totalCountries: [],
    filteredCountries: [],
    topAnchor: 1,
    botAnchor: 1,
    previousCountries: [],
    moreCountries: [],
  };
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

  if (!store) throw new Error("Store is missing the provider");

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
    setCurrentPage: (currentPage) => {
      const { lastPage } = get();
      const page = minMax(currentPage, 1, lastPage);
      return set({
        currentPage: page,
        topAnchor: page,
        botAnchor: page,
        previousCountries: [],
        moreCountries: [],
      });
    },

    /**
     * Updates the number of items per page and adjusts the current page if necessary.
     */
    setPerPage: (perPage) => {
      const { filteredCountries, currentPage } = get();
      const lastPage = Math.ceil(filteredCountries.length / perPage);
      const page = minMax(currentPage, 1, lastPage);
      return set({
        perPage,
        lastPage,
        currentPage: page,
        topAnchor: page,
        botAnchor: page,
        previousCountries: [],
        moreCountries: [],
      });
    },

    /**
     * Updates the search query and recalculates filteredCountries.
     * Also adjusts the current page to not exceed last page.
     */
    setSearchQuery: (searchQuery) => {
      const { totalCountries, currentPage, perPage } = get();
      const filteredCountries = totalCountries.filter((country) =>
        `${country.name.common}${country.cca3}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
      const lastPage = Math.ceil(filteredCountries.length / perPage);
      const page = minMax(currentPage, 1, lastPage);
      return set({
        searchQuery,
        filteredCountries,
        lastPage,
        currentPage: page,
        topAnchor: page,
        botAnchor: page,
        previousCountries: [],
        moreCountries: [],
      });
    },

    /** Updates the top-side anchor for infinite scroll */
    setTopAnchor: (topAnchor) => {
      const { filteredCountries, perPage, currentPage } = get();
      const previousCountries =
        topAnchor === currentPage
          ? []
          : filteredCountries.slice(
              (topAnchor - 1) * perPage,
              (currentPage - 1) * perPage
            );
      return set({ topAnchor, previousCountries });
    },

    /** Updates the bottom-side anchor for infinite scroll */
    setBotAnchor: (botAnchor) => {
      const { filteredCountries, perPage, currentPage } = get();
      const moreCountries =
        botAnchor === currentPage
          ? []
          : filteredCountries.slice(currentPage * perPage, botAnchor * perPage);
      return set({ botAnchor, moreCountries });
    },
  }));
}
