// this Infinite scroll is a client-side wrapper component around server-side countries component
// usually, the infinite scroll is implemented only for scrolling down to fetch more data
// but in this case, I want to implement it for both scrolling up and down
// so when user scrolls up he/she can see previous countries and when he/she scrolls down he/she can see next countries
// I've created a separate loader component because I want to use it both at the top and bottom of the page
// also I don't want to bloat this component with intersection observer logic
// I could have created a separate client-side component for infinite scrolling in mobile
// but for SEO purposes I wanted to get first page html from server

'use client';

import { useEffect, useRef, useState } from 'react';
import { InfiniteScrollLoader } from './InfiniteScrollLoader';
import { Country } from '@entities/country/model/types';
import { CountryCard } from '@entities/country/ui';
import { useIsMobile } from '@shared/lib/hooks/useIsMobile';
import { Pagination } from '@shared/ui/Pagination';

interface Props {
  children: React.ReactNode;
  initialPage: number;
  lastPage: number;
  fetchCountries: (page: number) => Promise<Country[]>;
}

export const InfiniteScroll = ({
  children,
  initialPage,
  lastPage,
  fetchCountries,
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [topPage, setTopPage] = useState(initialPage); // its a flag that keeps track of current page for data loaded on top of the initial data
  // countries loaded on top of the initial data
  // each time a new batch of countries is fetched, we will append them at the start of this array
  // so that we can show them in the correct order
  // e.g if initial page is 3 and user scrolls up to fetch page 2, then page 1
  // the countries array will have countries of page 1 at the start followed by countries of page 2
  // followed by countries of initial page 3
  const [previousCountries, setPreviousCountries] = useState<Country[]>([]);

  const [bottomPage, setBottomPage] = useState(initialPage); // its a flag that keeps track of current page for data loaded at the bottom of the initial data

  // countries loaded at the bottom of the initial data
  // each time a new batch of countries is fetched, we will append them at the end of this array
  // so that we can show them in the correct order
  // e.g if initial page is 3 and user scrolls down to fetch page 4, then page 5
  // the countries array will have countries of initial page 3 followed by countries of page 4
  // followed by countries of page 5
  const [nextCountries, setNextCountries] = useState<Country[]>([]);

  const isMobile = useIsMobile();

  useEffect(() => {
    // scroll the window a little so the topLoader does not trigger immediately on mount
    window.scrollTo({ top: 150 });
  }, []);

  return (
    <div>
      {isMobile && topPage > 1 && (
        <InfiniteScrollLoader
          fetchCountries={fetchCountries}
          page={topPage - 1}
          setCountries={countries => {
            setPreviousCountries(prev => [...countries, ...prev]);
            setTopPage(prev => Math.max(prev - 1, 1));
          }}
        />
      )}
      <div
        ref={containerRef}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {isMobile &&
          previousCountries.map(country => (
            <CountryCard key={country.cca3} country={country} />
          ))}
        {children}
        {isMobile &&
          nextCountries.map(country => (
            <CountryCard key={country.cca3} country={country} />
          ))}
      </div>
      {!isMobile && lastPage > 1 && (
        <Pagination
          currentPage={initialPage}
          lastPage={lastPage}
          padding={1}
          className="mt-8"
        />
      )}
      {isMobile && bottomPage < lastPage && (
        <InfiniteScrollLoader
          fetchCountries={fetchCountries}
          page={bottomPage + 1}
          setCountries={countries => {
            setNextCountries(prev => [...prev, ...countries]);
            setBottomPage(prev => Math.min(prev + 1, lastPage));
          }}
        />
      )}
    </div>
  );
};
