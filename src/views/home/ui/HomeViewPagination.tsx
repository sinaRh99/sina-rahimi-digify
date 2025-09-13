'use client';

import { useStore } from '@app/store/store';
import { Pagination } from '@shared/ui/Pagination';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { memo } from 'react';
import { useShallow } from 'zustand/shallow';

const usePaginationData = () =>
  useStore(
    useShallow(store => ({
      currentPage: store.currentPage,
      setCurrentPage: store.setCurrentPage,
      lastPage: store.getLastPage(),
    }))
  );

export const HomeViewPagination = memo(function HomeViewPagination() {
  const { currentPage, setCurrentPage, lastPage } = usePaginationData();

  const searchParams = useSearchParams();
  const router = useRouter();

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
