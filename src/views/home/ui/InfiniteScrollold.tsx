'use client';

import { Country } from '@entities/country/model/types';
import { CountryBlock } from '@entities/country/ui';
import { useRouter } from 'next/navigation';

import { useEffect, useRef, useState } from 'react';

interface Props {
  children: React.ReactNode;
  initialPage: number;
  lastPage: number;
  getCountries: (page: number) => Promise<Country[]>;
}

export const InfiniteScroll = ({
  children,
  getCountries,
  initialPage,
  lastPage,
}: Props) => {
  console.log('🚀 ~ InfiniteScroll ~ initialPage:', initialPage);
  const [page, setPage] = useState(initialPage);
  const topLoaderRef = useRef<HTMLDivElement | null>(null);
  const bottomLoaderRef = useRef<HTMLDivElement | null>(null);
  const [topData, setTopData] = useState<Country[]>([]);
  const [bottomData, setBottomData] = useState<Country[]>([]);
  const router = useRouter();

  useEffect(() => {
    const observer = new IntersectionObserver(async entries => {
      entries.forEach(async entry => {
        if (entry.isIntersecting) {
          console.log();
          if (entry.target.id === 'top-loader' && page > 1) {
            const prevPage = page - 1;
            if (prevPage === initialPage) {
              console.log('initial load');
              return;
            }
            const newTopData = await getCountries(prevPage);
            setPage(prevPage);
            router.replace(`/?page=${prevPage}`, { scroll: false });

            setTopData(prev => [...newTopData, ...prev]);
          }
          if (entry.target.id === 'bottom-loader' && page < lastPage) {
            const nextPage = page + 1;
            if (nextPage === initialPage) {
              console.log('initial load');
              return;
            }
            const newBottomData = await getCountries(nextPage);
            setPage(nextPage);
            router.replace(`/?page=${nextPage}`, { scroll: false });

            setBottomData(prev => [...prev, ...newBottomData]);
          }
        }
      });
    });

    if (topLoaderRef.current) {
      observer.observe(topLoaderRef.current);
    }
    if (bottomLoaderRef.current) {
      observer.observe(bottomLoaderRef.current);
    }
    return () => {
      observer.unobserve(topLoaderRef.current!);
      observer.unobserve(bottomLoaderRef.current!);
    };
  }, [initialPage, lastPage]);

  return (
    <div>
      <div
        id="top-loader"
        ref={topLoaderRef}
        className="w-full h-[100px] bg-neutral-500 flex items-center justify-center font-extrabold text-4xl text-black"
      >
        Loading...
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {topData.map(country => (
          <li key={country.cca3}>
            <CountryBlock key={country.cca3} country={country} />
          </li>
        ))}
      </ul>

      {children}

      <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {bottomData.map(country => (
          <li key={country.cca3}>
            <CountryBlock key={country.cca3} country={country} />
          </li>
        ))}
      </ul>
      <div
        id="bottom-loader"
        ref={bottomLoaderRef}
        className="w-full h-[100px] bg-neutral-500 flex items-center justify-center font-extrabold text-4xl text-black"
      >
        Loading...
      </div>
    </div>
  );
};
