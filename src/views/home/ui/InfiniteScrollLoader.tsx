'use client';

// simple loader block for showing loading animation when we are fetching data
// I've created this in a separate component because I want to use it both at the top and bottom of the page
// We pass ref from InfiniteScroll component and observe the loader intersection
// after the loader is fully intersected we fetch data

import { useEffect, useRef, useState, useTransition } from 'react';
import classNames from './InfiniteScrollLoader.module.css';
import { useIsMobile } from '@shared/lib/hooks/useIsMobile';
import { Country } from '@entities/country/model/types';

interface Prop {
  page: number;
  fetchCountries: (page: number) => Promise<Country[]>;
  setCountries: (countries: Country[]) => void;
}

export const InfiniteScrollLoader = ({
  page,
  fetchCountries,
  setCountries,
}: Prop) => {
  const [progress, setProgress] = useState(0);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const isMobile = useIsMobile();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    // I know top loader is always going to be there but I am checking it just to avoid typescript errors
    // also I don't want to observe them is desktop view so I'm checking isMobile too
    if (!loaderRef.current || !isMobile) return;

    const loader = loaderRef.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setProgress(entry.intersectionRatio); // sets the progress of loader spinner based on intersection ratio
      },
      {
        // I'm passing threshold array from 0 to 1 with step of 0.01
        // So I can get more granular intersection ratio
        // And I can use it to show progress of the loader
        // This way user will notice that he/she can see more data by scrolling
        threshold: Array.from({ length: 101 }, (_, i) => i / 100), // [0, 0.01, 0.02, ..., 1]
      }
    );

    observer.observe(loader);

    return () => {
      observer.unobserve(loader);
    };
  }, [isMobile]);

  useEffect(() => {
    /// I've separated fetching logic from intersection observer logic
    // Because I don't want to recreate an observer every time my transition pending state changes or every time page changes
    if (progress === 1 && !isPending) {
      // I use React's useTransition to mark pagination updates as "non-urgent" state updates.
      // This tells React to keep the UI responsive (like scrolling) while new data is being fetched.
      // Without it, React might block rendering during fetches, making the UI feel laggy.
      // startTransition wraps the async fetch, and isPending tells us when a transition is in progress.
      // It is also useful because the code doesn't double fetch when transition is already pending
      startTransition(async () => {
        const countries = await fetchCountries(page);
        setCountries(countries);
      });
    }
  }, [progress, isPending, fetchCountries, page, setCountries]);

  return (
    <div
      ref={loaderRef}
      className="pt-8 pb-4 w-full flex flex-col items-center justify-center"
    >
      <div
        className={`${
          isPending ? classNames.loading : ''
        } w-14 h-14 bg-slate-900 rounded-full flex items-center justify-center relative overflow-hidden`}
      >
        <div
          className="w-14 h-14 bg-white absolute right-full"
          style={{
            transform: `translateX(${(isPending ? 0.44 : progress) * 100}%)`,
          }}
        ></div>
        <div className="w-12 h-12 rounded-full bg-slate-900 relative"></div>
      </div>
      <div className="mt-4">{isPending ? 'loading...' : 'load more'}</div>
    </div>
  );
};
