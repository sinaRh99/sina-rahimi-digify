'use client';

// simple loader block for showing loading animation when we are fetching data
// I've created this in a separate component because I want to use it both at the top and bottom of the page
// We pass ref from InfiniteScroll component and observe the loader intersection
// after the loader is fully intersected we fetch data

import { useEffect, useRef, useState } from 'react';
import { useIsMobile } from '@shared/lib/hooks/useIsMobile';

interface Prop {
  isPending?: boolean;
  onLoaderIntersect: () => void;
}

export const InfiniteScrollLoader = ({
  onLoaderIntersect,
  isPending,
}: Prop) => {
  const [progress, setProgress] = useState(0);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const isMobile = useIsMobile();

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
    if (progress === 1 && !isPending) {
      onLoaderIntersect();
    }
  }, [progress, isPending, onLoaderIntersect]);

  return (
    <div
      ref={loaderRef}
      className="pt-8 pb-4 w-full flex flex-col items-center justify-center relative"
    >
      <div className="w-14 h-14 bg-slate-900 rounded-full flex items-center justify-center relative overflow-hidden">
        <div
          className="w-14 h-14 bg-white absolute right-full"
          style={{
            transform: `translateX(${progress * 100}%)`,
          }}
        ></div>
        <div className="w-12 h-12 rounded-full bg-slate-900 relative"></div>
      </div>
      <div className="mt-4">load more...</div>
    </div>
  );
};
