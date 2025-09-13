// this Infinite scroll is a client-side wrapper component around server-side countries component
// usually, the infinite scroll is implemented only for scrolling down to fetch more data
// but in this case, I want to implement it for both scrolling up and down
// so when user scrolls up he/she can see previous countries and when he/she scrolls down he/she can see next countries
// I've created a separate loader component because I want to use it both at the top and bottom of the page
// also I don't want to bloat this component with intersection observer logic
// I could have created a separate client-side component for infinite scrolling in mobile
// but for SEO purposes I wanted to get first page html from server

'use client';

import { useEffect, useMemo, useRef, useTransition } from 'react';
import { InfiniteScrollLoader } from './InfiniteScrollLoader';
import { CountryCard } from '@entities/country/ui';
import { useIsMobile } from '@shared/lib/hooks/useIsMobile';
import { useShallow } from 'zustand/shallow';
import { useStore } from '@app/store/store';

const useCountries = () =>
  useStore(
    useShallow(store => ({
      filteredCountries: store.filteredCountries,
      perPage: store.perPage,
      currentPage: store.currentPage,
      lastPage: store.getLastPage(),
      topAnchor: store.topAnchor,
      setTopAnchor: store.setTopAnchor,
      botAnchor: store.botAnchor,
      setBotAnchor: store.setBotAnchor,
    }))
  );

interface Props {
  children: React.ReactNode;
}

export const InfiniteScroll = ({ children }: Props) => {
  const scrollTriggered = useRef(false);

  const {
    topAnchor,
    setTopAnchor,
    filteredCountries,
    perPage,
    currentPage,
    lastPage,
    botAnchor,
    setBotAnchor,
  } = useCountries();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isTopPending, startTopTransition] = useTransition();
  const [isBotPending, startBotTransition] = useTransition();

  const isMobile = useIsMobile();

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    const handleScroll = () => {
      scrollTriggered.current = true;
    };

    container.addEventListener('scroll', handleScroll);

    // scroll the window a little so the topLoader does not trigger immediately on mount
    containerRef.current.scrollTo({ top: 240 });

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handlerLoaderIntersect = (loader: 'top' | 'bot') => {
    if (loader === 'top') {
      if (scrollTriggered.current) {
        startTopTransition(() => {
          setTopAnchor(topAnchor - 1);
          scrollTriggered.current = false;
          containerRef.current?.scrollTo({ top: 240 });
        });
      }
    } else {
      startBotTransition(() => {
        setBotAnchor(botAnchor + 1);
      });
    }
  };

  const previousCountries = useMemo(() => {
    const anchor = Math.min(topAnchor, currentPage);
    console.log('🚀 ~ InfiniteScroll ~ topAnchor:', topAnchor);
    if (anchor === currentPage) return [];
    return filteredCountries.slice(
      (anchor - 1) * perPage,
      currentPage * perPage
    );
  }, [filteredCountries, perPage, currentPage, topAnchor]);

  const moreCountries = useMemo(() => {
    const anchor = Math.max(Math.min(botAnchor, lastPage), currentPage);
    console.log('🚀 ~ InfiniteScroll ~ botAnchor:', botAnchor);
    if (anchor === currentPage) return [];
    return filteredCountries.slice(currentPage * perPage, botAnchor * perPage);
  }, [filteredCountries, perPage, currentPage, botAnchor, lastPage]);

  return (
    <div className="h-full flex flex-col">
      <div ref={containerRef} className="flex-1 min-h-0 overflow-y-auto">
        {isMobile && topAnchor > 1 && (
          <InfiniteScrollLoader
            isPending={isTopPending}
            onLoaderIntersect={() => handlerLoaderIntersect('top')}
          />
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isMobile &&
            previousCountries.map(country => (
              <CountryCard key={country.cca3} country={country} />
            ))}
          {children}
          {isMobile &&
            moreCountries.map(country => (
              <CountryCard key={country.cca3} country={country} />
            ))}
        </div>
        {isMobile && botAnchor < lastPage && (
          <InfiniteScrollLoader
            isPending={isBotPending}
            onLoaderIntersect={() => handlerLoaderIntersect('bot')}
          />
        )}
      </div>
    </div>
  );
};
