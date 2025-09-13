/**
 * Global Zustand store definition.
 * Contains both the application state and the actions used to update it.
 */
import { createContext, useContext } from "react";
import { createStore, useStore as useZustandStore } from "zustand";
import { PreloadedStoreInterface } from "./StoreProvider";
import { Country } from "@entities/country/model/types";

/**
 * Clamps a number between a minimum and maximum value.
 *
 * @param num - The input number to be clamped.
 * @param min - The lower bound.
 * @param max - The upper bound.
 * @returns The input number constrained to the specified range.
 *
 * @example
 * minMax(5, 1, 10); // returns 5
 * minMax(-3, 0, 10); // returns 0
 * minMax(15, 0, 10); // returns 10
 */
const minMax = (num: number, min: number, max: number) => {
  return Math.max(Math.min(num, max), min);
};

/**
 * Resets the infinite scroll state by aligning the top and bottom anchors
 * with the given page and clearing previously loaded countries.
 *
 * This is typically used when we need to reinitialize infinite scrolling,
 * such as when switching to desktop view, applying a new search query,
 * or changing the number of items per page. In these cases, the list of
 * filtered countries or the server-provided country cards changes, so we
 * must reset the scroll state to render items correctly with the new data.
 *
 * @param page - The page number to set for `currentPage`, `topAnchor`, and `botAnchor`.
 * @returns An object with the reset values for `currentPage`, `topAnchor`,
 * `botAnchor`, and empty arrays for `previousCountries` and `moreCountries`.
 */
const resetPagination = (page: number) => ({
  currentPage: page,
  topAnchor: page,
  botAnchor: page,
  previousCountries: [],
  moreCountries: [],
});

/**
 * Interface defining the global Zustand store state for pagination,
 * filtering, and infinite scroll behavior.
 *
 * @remarks
 * The store manages both pagination (for desktop) and infinite scroll
 * (for mobile). It keeps track of raw data, filtered results, anchors
 * for virtualized scrolling, and metadata like current and last page.
 *
 * @property page - The raw page value from `URLSearchParams`.
 *   - Initialized in the store provider.
 *   - Not always reliable for calculations (e.g., URL might contain
 *     `?page=30` while the actual last page is only `10`).
 *   - Typically used to recalculate `currentPage` by clamping it between
 *     `1` and `lastPage`.
 *
 * @property currentPage - The validated and displayable current page.
 *   - Initialized in the store provider by clamping `page` between `1`
 *     and `lastPage`.
 *   - Updated whenever `setPage` is called.
 *   - Used for highlighting the active page in the pagination component.
 *
 * @property lastPage - The total number of available pages.
 *   - Calculated as `filteredCountries.length / perPage` (rounded up).
 *   - Recalculated when `searchQuery` or `perPage` changes.
 *   - Used for clamping `currentPage` and rendering the pagination
 *     component.
 *   - Also serves as a limiter for showing the bottom loader in
 *     infinite scroll (hidden when `botAnchor === lastPage`).
 *
 * @property perPage - Number of items displayed per page.
 *   - On desktop: defines items per pagination page.
 *   - On mobile: defines how many items are appended during infinite
 *     scroll.
 *   - Initialized from `URLSearchParams`.
 *
 * @property searchQuery - The active query string for filtering countries.
 *   - Initialized from `URLSearchParams`.
 *   - Updated with debouncing when the search input changes.
 *
 * @property totalCountries - The complete list of countries fetched
 *   from the REST Countries API during the initial app load.
 *   - Used as the base dataset for filtering.
 *
 * @property filteredCountries - The list of countries filtered by
 *   `searchQuery`.
 *   - Initialized from SSR in the store provider.
 *   - Recomputed whenever `searchQuery` changes.
 *
 * @property topAnchor - An anchor index used to calculate how many
 *   items should be prepended to SSR-rendered data in infinite scroll.
 *   - Initialized to `currentPage`.
 *   - Reset to `currentPage` when `searchQuery`, `perPage`, or view
 *     mode (desktop ↔ mobile) changes.
 *   - Decremented by `1` whenever the top loader intersects the viewport.
 *
 * @property botAnchor - An anchor index used to calculate how many
 *   items should be appended in infinite scroll.
 *   - Initialized to `currentPage`.
 *   - Reset to `currentPage` when `searchQuery`, `perPage`, or view
 *     mode changes.
 *   - Incremented by `1` whenever the bottom loader intersects the viewport.
 *
 * @property previousCountries - Countries prepended to SSR-rendered
 *   data in infinite scroll.
 *   - Calculated by slicing `filteredCountries` based on `topAnchor`
 *     and `currentPage`.
 *
 * @property moreCountries - Countries appended to SSR-rendered data in
 *   infinite scroll.
 *   - Calculated by slicing `filteredCountries` based on `currentPage`
 *     and `botAnchor`.
 */
export interface StoreState {
  page: number;
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

/**
 * Interface defining the global store state and actions.
 */
export interface StoreInterface extends StoreState {
  setCurrentPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  setSearchQuery: (query: string) => void;
  setTopAnchor: (anchor: number) => void;
  setBotAnchor: (anchor: number) => void;
  resetPagination: () => void;
}

/**
 * Returns the default initial state for the store.
 */
function getDefaultInitialState(): StoreState {
  return {
    page: 1,
    lastPage: 1,
    perPage: 12,
    searchQuery: "",
    totalCountries: [],
    filteredCountries: [],
    ...resetPagination(1),
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
     * Updates the current page by clamping the incoming value
     * between `1` and `lastPage`.
     *
     * Resets the following state values:
     * - `currentPage`, `topAnchor`, and `botAnchor` → set to the new page value.
     * - `previousCountries` and `moreCountries` → cleared (set to empty arrays).
     *
     * @param NextPage - The requested page number before clamping.
     * @returns The updated store state with the new page and reset anchors/data.
     */
    setCurrentPage: (NextPage) => {
      const { lastPage } = get();
      const page = minMax(NextPage, 1, lastPage);
      return set({
        page,
        ...resetPagination(page),
      });
    },

    /**
     * Updates the number of items displayed per page and adjusts related pagination state.
     *
     * Steps performed:
     * 1. Recalculates `lastPage` based on the new `perPage` value and the length of `filteredCountries`.
     * 2. Clamps the current page between `1` and the new `lastPage`.
     * 3. Resets `currentPage`, `topAnchor`, and `botAnchor` to the clamped page value.
     * 4. Clears `previousCountries` and `moreCountries` arrays.
     *
     * @param perPage - The new number of items per page.
     * @returns The updated store state including `perPage`, `lastPage`, and reset anchors/data.
     */
    setPerPage: (perPage) => {
      const { filteredCountries, page } = get();
      const lastPage = Math.ceil(filteredCountries.length / perPage);
      const currentPage = minMax(page, 1, lastPage);
      return set({
        perPage,
        lastPage,
        ...resetPagination(currentPage),
      });
    },

    /**
     * Updates the search query and recalculates the filtered countries list.
     *
     * Steps performed:
     * 1. Filters `totalCountries` based on the new `searchQuery`.
     * 2. Recalculates `lastPage` based on the length of `filteredCountries` and `perPage`.
     * 3. Clamps the current page between `1` and the new `lastPage`.
     * 4. Resets `currentPage`, `topAnchor`, and `botAnchor` to the clamped page value.
     * 5. Clears `previousCountries` and `moreCountries` arrays.
     *
     * @param searchQuery - The new search string used to filter countries.
     * @returns The updated store state including `searchQuery`, `filteredCountries`, `lastPage`, and reset anchors/data.
     */
    setSearchQuery: (searchQuery) => {
      const { totalCountries, page, perPage } = get();
      const filteredCountries = totalCountries.filter((country) =>
        `${country.name.common}${country.cca3}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
      const lastPage = Math.ceil(filteredCountries.length / perPage);
      const currentPage = minMax(page, 1, lastPage);
      return set({
        searchQuery,
        filteredCountries,
        lastPage,
        ...resetPagination(currentPage),
      });
    },

    /**
     * Updates the top-side anchor for infinite scroll.
     *
     * Steps performed:
     * 1. Sets the `topAnchor` to the new value.
     * 2. Recalculates `previousCountries` based on the new `topAnchor`.
     *    - This includes all items from `topAnchor` up to (but not including) `currentPage`,
     *      as `currentPage` items are already rendered via SSR.
     *    - If `topAnchor` equals `currentPage`, `previousCountries` is cleared.
     *
     * @param topAnchor - The new top-side anchor index.
     * @returns The updated store state with `topAnchor` and recalculated `previousCountries`.
     */
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

    /**
     * Updates the bottom-side anchor for infinite scroll.
     *
     * Steps performed:
     * 1. Sets the `botAnchor` to the new value.
     * 2. Recalculates `moreCountries` based on the new `botAnchor`.
     *    - This includes all items from `currentPage`(but not including) up to `botAnchor`,
     *      as `currentPage` items are already rendered via SSR.
     *    - If `botAnchor` equals `currentPage`, `moreCountries` is cleared.
     *
     * @param botAnchor - The new bottom-side anchor index.
     * @returns The updated store state with `botAnchor` and recalculated `moreCountries`.
     */
    setBotAnchor: (botAnchor) => {
      const { filteredCountries, perPage, currentPage } = get();
      const moreCountries =
        botAnchor === currentPage
          ? []
          : filteredCountries.slice(currentPage * perPage, botAnchor * perPage);
      return set({ botAnchor, moreCountries });
    },

    /**
     * Resets pagination-related state to the current `page` value.
     *
     * Steps performed:
     * 1. Sets `currentPage`, `topAnchor`, and `botAnchor` to the current `page`.
     * 2. Clears `previousCountries` and `moreCountries` arrays.
     *
     * This is useful when switching to desktop view or whenever the
     * infinite scroll state needs to be reinitialized.
     *
     * @returns The updated store state with reset anchors and cleared data arrays.
     */
    resetPagination: () => {
      const { page } = get();
      return set({ ...resetPagination(page) });
    },
  }));
}
