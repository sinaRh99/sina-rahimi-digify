"use client";

/**
 * InfiniteScrollLoader component.
 *
 * - Simple loader block for showing a loading animation while fetching data.
 * - Created as a separate component to be used both at the top and bottom of the page.
 * - Receives a ref from `InfiniteScroll` and observes its intersection with the viewport.
 * - Calls `onLoaderIntersect` once fully intersected to trigger data fetching.
 */
import { useEffect, useRef, useState } from "react";
import { useIsMobile } from "@shared/lib/hooks/useIsMobile";

interface Prop {
  /** Indicates if a data fetch operation is currently pending */
  isPending?: boolean;
  /** Callback triggered when the loader fully intersects the viewport */
  onLoaderIntersect: () => void;
}

export const InfiniteScrollLoader = ({
  onLoaderIntersect,
  isPending,
}: Prop) => {
  const [progress, setProgress] = useState(0);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const isMobile = useIsMobile();

  /**
   * Tracks whether an IntersectionObserver instance has already been created.
   * Prevents creating multiple observers, which could lead to:
   * - Duplicate intersection callbacks
   * - Unnecessary performance overhead
   * - Unexpected or inconsistent loader behavior
   */
  const hasIntersectionObserver = useRef(false);

  useEffect(() => {
    // Top loader is always present, but we check to avoid TypeScript errors
    // Also, we only observe on mobile to prevent unnecessary observers on desktop
    if (!loaderRef.current || !isMobile) return;

    const loader = loaderRef.current;

    /**
     * Sets up an IntersectionObserver for the loader element to track its visibility.
     *
     * Behavior:
     * 1. Checks `hasIntersectionObserver` to avoid creating multiple observers,
     *    which could lead to duplicate callbacks and performance issues.
     * 2. If no observer exists, creates one and observes the `loader` element.
     * 3. Updates the loader spinner progress based on `entry.intersectionRatio`.
     * 4. Uses a threshold array from 0 to 1 in 0.01 increments for smooth, granular progress updates.
     * 5. Marks `hasIntersectionObserver.current = true` to indicate an active observer
     */
    if (hasIntersectionObserver.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Sets the loader spinner progress based on intersection ratio
        setProgress(entry.intersectionRatio);
      },
      {
        // Threshold array from 0 to 1 in steps of 0.01 for granular intersection detection
        // This allows the loader to visually indicate progress to the user
        threshold: Array.from({ length: 101 }, (_, i) => i / 100),
      }
    );

    observer.observe(loader);
    hasIntersectionObserver.current = true;
    /**
     * Cleanup:
     * - On unmount, unobserves the loader and resets `hasIntersectionObserver.current = false`.
     */
    return () => {
      observer.unobserve(loader);
      hasIntersectionObserver.current = false;
    };
  }, [isMobile]);

  useEffect(() => {
    // Trigger data fetch when fully intersected and no pending operation
    if (progress === 1 && !isPending) {
      onLoaderIntersect();
    }
  }, [progress, isPending, onLoaderIntersect]);

  return (
    <div
      ref={loaderRef}
      className="pt-8 pb-4 w-full flex md:hidden flex-col items-center justify-center relative"
    >
      <div className="w-14 h-14 bg-slate-900 rounded-full flex items-center justify-center relative overflow-hidden">
        {/* Animated overlay showing progress */}
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
