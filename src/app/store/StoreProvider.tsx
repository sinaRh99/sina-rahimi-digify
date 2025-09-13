"use client";

import { type PropsWithChildren, useRef } from "react";
import type { StoreInterface, StoreType } from "./store";
import { initializeStore, Provider } from "./store";

/**
 * PreloadedStoreInterface
 *
 * Subset of the main store properties that can be preloaded on initialization.
 */
export type PreloadedStoreInterface = Pick<
  StoreInterface,
  | "page"
  | "currentPage"
  | "lastPage"
  | "perPage"
  | "searchQuery"
  | "totalCountries"
  | "filteredCountries"
  | "topAnchor"
  | "botAnchor"
>;

/**
 * StoreProvider component.
 *
 * - Initializes the global Zustand store with optional preloaded values.
 * - Uses a `useRef` to persist the store instance across renders.
 * - Wraps children with the Zustand `Provider` to make the store accessible.
 *
 * @param children - React children to render inside the provider.
 * @param props - Optional preloaded store values for SSR or initial state.
 */
export default function StoreProvider({
  children,
  ...props
}: PropsWithChildren<PreloadedStoreInterface>) {
  // Ref to persist the store instance for the lifetime of the app
  const storeRef = useRef<StoreType>(null);

  if (!storeRef.current) {
    // Initialize the store with preloaded values only once
    storeRef.current = initializeStore(props);
  }

  return <Provider value={storeRef.current}>{children}</Provider>;
}
