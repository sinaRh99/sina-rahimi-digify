/**
 * InfiniteScroll component.
 *
 * - A client-side wrapper for the server-side countries component.
 * - Implements infinite scrolling both upwards and downwards.
 * - Top and bottom loaders are separate components to avoid bloating this component
 *   with intersection observer logic.
 * - The first page is fetched via SSR for SEO purposes.
 *
 * @remarks
 * - Scrolling up shows previous countries; scrolling down shows next countries.
 * - Handles anchors for top and bottom to manage the range of countries displayed.
 */
'use client';

import { useEffect, useMemo, useRef, useTransition } from 'react';
import { InfiniteScrollLoader } from './InfiniteScrollLoader';
import { CountryCard } from '@entities/country/ui';
import { useIsMobile } from '@shared/lib/hooks/useIsMobile';
import { useShallow } from 'zustand/shallow';
import { useStore } from '@app/store/store';

/**
 * Hook to select country-related state from the store.
 *
 * - `filteredCountries` – countries already filtered by search query.
 * - `perPage` – how many countries to load each time the scroller appends data.
 * - `currentPage` – tracks how many pages are loaded; also limits scrolling up.
 * - `lastPage` – maximum page limit.
 * - `topAnchor` – top-side anchor; updated when prepending countries.
 * - `botAnchor` – bottom-side anchor; updated when appending countries.
 */
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
  /** Children to render between previous and more countries */
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

  // Transitions prevent UI blocking and allow loaders to wait until previous operation finishes.
  const [isTopPending, startTopTransition] = useTransition();
  const [isBotPending, startBotTransition] = useTransition();

  // Show infinite scroll only on mobile
  const isMobile = useIsMobile();

  /**
   * Handle initial scroll setup.
   *
   * - Scrolls down slightly to prevent the top loader from triggering immediately.
   * - Sets a flag so the top loader only triggers after the first user scroll event.
   */
  useEffect(() => {
    if (!containerRef.current || !isMobile) return;

    const container = containerRef.current;

    const handleScroll = () => {
      scrollTriggered.current = true;
    };

    container.addEventListener('scroll', handleScroll);

    containerRef.current.scrollTo({ top: 240 });

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [isMobile]);

  /**
   * Updates anchors when loaders intersect with the viewport.
   *
   * @param loader - 'top' or 'bot' indicating which loader triggered the intersection
   */
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

  /**
   * Countries before the current page based on the top anchor.
   */
  const previousCountries = useMemo(() => {
    const anchor = Math.min(topAnchor, currentPage);
    if (anchor === currentPage) return [];
    return filteredCountries.slice(
      (anchor - 1) * perPage,
      currentPage * perPage
    );
  }, [filteredCountries, perPage, currentPage, topAnchor]);

  /**
   * Countries after the current page based on the bottom anchor.
   */
  const moreCountries = useMemo(() => {
    const anchor = Math.max(Math.min(botAnchor, lastPage), currentPage);
    if (anchor === currentPage) return [];
    return filteredCountries.slice(currentPage * perPage, botAnchor * perPage);
  }, [filteredCountries, perPage, currentPage, botAnchor, lastPage]);

  return (
    <div className="h-full flex flex-col">
      <div ref={containerRef} className="flex-1 min-h-0 overflow-y-auto">
        {/* Top-side loader */}
        {isMobile && topAnchor > 1 && (
          <InfiniteScrollLoader
            isPending={isTopPending}
            onLoaderIntersect={() => handlerLoaderIntersect('top')}
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Previous countries (prepended at the top) */}
          {isMobile &&
            previousCountries.map(country => (
              <CountryCard key={country.cca3} country={country} />
            ))}

          {/* Server-side rendered children */}
          {children}

          {/* More countries (appended at the bottom) */}
          {isMobile &&
            moreCountries.map(country => (
              <CountryCard key={country.cca3} country={country} />
            ))}
        </div>

        {/* Bottom-side loader */}
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
