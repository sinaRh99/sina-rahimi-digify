// I've put Pagination inside @shared because it might be used in other places later.
// Also, it's not big enough to be considered a feature that's why i didn't place it on @features
'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

interface Props {
  currentPage: number;
  lastPage: number;
  padding?: number;
  className?: string;
}

export const Pagination = ({
  currentPage,
  lastPage,
  padding = 1,
  className,
}: Props) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  // I'm using min and max to calculate the start and end page numbers
  // This way I can ensure that the pagination links don't go out of bounds
  // e.g if current page is 1 and padding is 2, I don't want to show -1, 0, 1, 2, 3
  const start = Math.max(currentPage - padding, 1);
  const end = Math.min(currentPage + padding, lastPage);
  // Generate an array of pages, I'm using Set to remove duplicate results

  const pages = [
    ...new Set([
      1,
      // I'm  calculating how much pagination links must be visible
      // I'm getting padding from props, so if padding is 1 and current page is 5
      // I want to show 4, 5, 6
      // if padding is 2 and current page is 5, I want to show 3, 4, 5, 6, 7
      ...Array.from({ length: end - start + 1 }, (_, i) => start + i),
      lastPage,
    ]),
  ];

  const handleNavigate = (page: number) => {
    if (page === currentPage) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <div className={`flex gap-2 justify-center ${className}`}>
      {pages.map((page, i) => {
        // I'm checking to see if there is any gap between current page and previous page so i could show ... when we there is a gap
        const noGap = !pages[i - 1] || page - pages[i - 1] === 1;

        return (
          <div key={page} className="flex items-center gap-2">
            {!noGap && '...'}
            <span
              className={`w-10 h-10 rounded-md ${
                page === currentPage
                  ? 'bg-amber-400'
                  : 'bg-cyan-400 hover:bg-cyan-300'
              } flex items-center justify-center text-black text-xs font-extrabold cursor-pointer`}
              onClick={() => handleNavigate(page)}
            >
              {page}
            </span>
          </div>
        );
      })}
    </div>
  );
};
