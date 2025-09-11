'use client';

import { useState } from 'react';
import { InfiniteScrollLoader } from './InfiniteScrollLoader';
import { Country } from '@entities/country/model/types';
import { CountryCard } from '@entities/country/ui';
import { useIsMobile } from '@shared/lib/hooks/useIsMobile';

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
  const [topPage, setTopPage] = useState(initialPage);
  const [previousCountries, setPreviousCountries] = useState<Country[]>([]);

  const [bottomPage, setBottomPage] = useState(initialPage);
  const [nextCountries, setNextCountries] = useState<Country[]>([]);

  const isMobile = useIsMobile();

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
      {isMobile && topPage < lastPage && (
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
