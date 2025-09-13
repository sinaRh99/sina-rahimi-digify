'use client';

import { useStore } from '@app/store/store';
import { useDebounce } from '@shared/lib/hooks/useDebounce';
import { Select } from '@shared/ui/Select';
import { TextField } from '@shared/ui/TextField';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChangeEvent, useEffect, useState, useTransition } from 'react';
import { useShallow } from 'zustand/shallow';

/**
 * Allowed options for items per page.
 */
const values = [12, 24, 34, 56];

/**
 * Custom hook to select the relevant filter state from the global store.
 * Uses shallow comparison to prevent unnecessary re-renders.
 */
const useFilterData = () =>
  useStore(
    useShallow(store => ({
      search: store.searchQuery,
      dataPerPage: store.perPage,
      setDataPerPage: store.setPerPage,
      setSearchQuery: store.setSearchQuery,
    }))
  );

/**
 * CountriesFilter component.
 *
 * - Handles searching and filtering of countries.
 * - Updates `dataPerPage` selection.
 * - Reads and updates state from the global store.
 * - Updates URL search params without blocking the UI.
 *
 * @remarks
 * This component is currently specific to the home page.
 * It is stateless with respect to navigation and relies on global state.
 */
export const CountriesFilter = () => {
  const { search, dataPerPage, setDataPerPage, setSearchQuery } =
    useFilterData();

  // Local state for the input field.
  const [query, setQuery] = useState(search);

  // Debounce the query to prevent rapid updates on every keystroke.
  const debouncedQuery = useDebounce(query);

  // useTransition allows updating search params without blocking user input.
  const [isPending, startTransition] = useTransition();

  const router = useRouter();
  const searchParams = useSearchParams();

  /**
   * Handles changes to the "items per page" select.
   * Updates the global store and navigates to the new URL.
   *
   * @param e - The change event from the select element.
   */
  const handlePerPageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());

    // Update only the `perPage` parameter.
    params.set('perPage', String(e.target.value));

    // Navigate to the updated URL.
    router.push(`?${params.toString()}`);

    // Update global store value.
    setDataPerPage(Number(e.target.value));
  };

  useEffect(() => {
    // Avoid triggering multiple navigations if transition is in progress.
    if (isPending) return;

    // Do not navigate if the debounced query matches current search.
    if (debouncedQuery === search) return;

    // Update URL search param and global state without blocking UI.
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('search', debouncedQuery);
      router.push(`?${params.toString()}`);
      setSearchQuery(debouncedQuery);
    });
  }, [debouncedQuery, isPending, search, searchParams, router, setSearchQuery]);

  return (
    <div className="pb-8 pt-4">
      <div className="max-w-[500px] flex gap-4">
        {/* Search input */}
        <TextField
          value={query}
          placeholder="Search countries..."
          onChange={e => setQuery(e.target.value)}
        />

        {/* Items per page selector */}
        <Select value={dataPerPage} onChange={handlePerPageChange}>
          {values.map(value => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
};
