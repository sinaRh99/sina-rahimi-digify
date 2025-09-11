'use client';

import { useIsMobile } from '@shared/lib/hooks/useIsMobile';
import { useEffect, useRef, useState } from 'react';
import { InfiniteScrollLoader } from './InfiniteScrollLoader';

interface Props {
  children: React.ReactNode;
}

export const InfiniteScroll = ({ children }: Props) => {
  const bottomLoaderRef = useRef<HTMLDivElement | null>(null);
  const topLoaderRef = useRef<HTMLDivElement | null>(null);
  const [topProgress, setTopProgress] = useState(0);
  const [BottomProgress, setBottomProgress] = useState(0);
  const isMobile = useIsMobile();

  useEffect(() => {
    // we know top loader and bottom loader are always going to be there but we are checking them just to avoid typescript errors
    // also we don't want to observe them is desktop view so we are checking isMobile too
    if (!bottomLoaderRef.current || !topLoaderRef.current || !isMobile) return;

    const bottomLoader = bottomLoaderRef.current;
    const topLoader = topLoaderRef.current;

    const observer = new IntersectionObserver(
      async entries => {
        entries.forEach(entry => {
          console.log(
            '🚀 ~ InfiniteScroll ~ entry:',
            entry.target.id,
            entry.intersectionRatio
          );
          if (entry.target.id === 'bottom-loader') {
            setBottomProgress(entry.intersectionRatio);
          }
          if (entry.target.id === 'top-loader') {
            setTopProgress(entry.intersectionRatio);
          }
        });
      },
      {
        threshold: Array.from({ length: 101 }, (_, i) => i / 100), // 0, 0.01, ... 1
      }
    );

    observer.observe(topLoader);
    observer.observe(bottomLoader);

    return () => {
      observer.unobserve(topLoader);
      observer.unobserve(bottomLoader);
    };
  }, [isMobile]);

  return (
    <div>
      <InfiniteScrollLoader
        isLoading
        id="top-loader"
        ref={topLoaderRef}
        progress={topProgress}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {children}
      </div>
      <InfiniteScrollLoader
        id="bottom-loader"
        ref={bottomLoaderRef}
        progress={BottomProgress}
      />
    </div>
  );
};
