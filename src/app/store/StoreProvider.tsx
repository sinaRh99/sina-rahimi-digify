'use client';

import { type PropsWithChildren, useRef } from 'react';
import type { StoreInterface, StoreType } from './store';
import { initializeStore, Provider } from './store';

export type PreloadedStoreInterface = Pick<
  StoreInterface,
  | 'currentPage'
  | 'perPage'
  | 'searchQuery'
  | 'totalCountries'
  | 'filteredCountries'
  | 'topAnchor'
  | 'botAnchor'
>;

export default function StoreProvider({
  children,
  ...props
}: PropsWithChildren<PreloadedStoreInterface>) {
  const storeRef = useRef<StoreType>(null);

  if (!storeRef.current) {
    storeRef.current = initializeStore(props);
  }

  return <Provider value={storeRef.current}>{children}</Provider>;
}
