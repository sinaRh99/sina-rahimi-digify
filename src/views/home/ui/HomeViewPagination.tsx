'use client';

/**
 * HomeViewPagination component.
 *
 * - Handles pagination logic for the Home page.
 * - Uses the shared `Pagination` UI component, which is "dumb" and does not manage its own state.
 * - Logic for reading and updating the current page is done here.
 */
import { useStore } from '@app/store/store';
import { Pagination } from '@shared/ui/Pagination';
import { useSearchParams, useRouter } from 'next/navigation';
import { memo } from 'react';
import { useShallow } from 'zustand/shallow';

/**
 * Custom hook to select the pagination state from the global store.
 *
 * - Retrieves current page, last page, and setter function for current page.
 * - This data is then passed to the shared Pagination component.
 * - The shared component itself has no knowledge of the store or where data comes from.
 */
const usePaginationData = () =>
  useStore(
    useShallow(store => ({
      currentPage: store.currentPage,
      setCurrentPage: store.setCurrentPage,
      lastPage: store.getLastPage(),
    }))
  );

/**
 * HomeViewPagination wrapper around the shared Pagination component.
 *
 * - Handles navigation and state updates when page changes.
 * - Updates URL search params using Next.js router.
 * - The shared Pagination component is kept reusable and unaware of store/state.
 */
export const HomeViewPagination = memo(function HomeViewPagination() {
  const { currentPage, setCurrentPage, lastPage } = usePaginationData();

  const searchParams = useSearchParams();
  const router = useRouter();

  /**
   * Handles navigation when a page number is clicked.
   *
   * @param page - The target page number.
   */
  const handleNavigate = (page: number) => {
    if (page === currentPage) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`?${params.toString()}`);

    setCurrentPage(page);
  };

  return (
    <Pagination
      onPageChange={handleNavigate}
      currentPage={currentPage}
      lastPage={lastPage}
      padding={1}
      className="mt-8 hidden md:flex"
    />
  );
});
