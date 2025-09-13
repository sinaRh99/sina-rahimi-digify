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
"use client";

import { useEffect, useRef, useTransition } from "react";
import { InfiniteScrollLoader } from "./InfiniteScrollLoader";
import { CountryCard } from "@entities/country/ui";
import { useIsMobile } from "@shared/lib/hooks/useIsMobile";
import { useShallow } from "zustand/shallow";
import { useStore } from "@app/store/store";

/**
 * Custom hook to select country-related state and actions from the store.
 *
 * Selected state and actions:
 * - `previousCountries`: Countries to be prepended to SSR-rendered country cards.
 * - `moreCountries`: Countries to be appended to SSR-rendered country cards.
 * - `resetPagination`: Resets pagination-related state to the current `page` value and clears `previousCountries` and `moreCountries`.
 * - `lastPage`: The total number of pages for pagination and infinite scroll.
 * - `topAnchor`: Anchor index indicating where `previousCountries` should be sliced from.
 * - `setTopAnchor`: Setter function for `topAnchor`.
 * - `botAnchor`: Anchor index indicating where `moreCountries` should be sliced to.
 * - `setBotAnchor`: Setter function for `botAnchor`.
 *
 * @returns Selected country-related state and setter functions from the store.
 */
const useCountries = () =>
  useStore(
    useShallow((store) => ({
      previousCountries: store.previousCountries,
      moreCountries: store.moreCountries,
      resetPagination: store.resetPagination,
      lastPage: store.lastPage,
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
  const {
    previousCountries,
    moreCountries,
    topAnchor,
    setTopAnchor,
    lastPage,
    botAnchor,
    setBotAnchor,
    resetPagination,
  } = useCountries();

  /**
   * Tracks whether the container has been scrolled.
   * - Set to `true` when the user scrolls the container.
   * - Reset to `false` after `topLoader` changes.
   *
   * This ensures the top-side loader logic only runs after the user has
   * actually scrolled, and prevents it from triggering immediately on mount
   * or when the scrollbar is already at the top.
   */
  const scrollTriggered = useRef(false);

  // Reference to the container that renders country cards, used for scrolling.
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * Tracks whether the scroll event listener has already been added.
   * Prevents attaching multiple listeners across re-renders, which could
   * cause performance issues, duplicate event handling, and unexpected behavior.
   */
  const isListenerAttachedRef = useRef(false);

  /**
   * Transitions help prevent UI blocking by deferring state updates
   * until previous operations finish.
   * Useful for ensuring that loaders are not triggered multiple times
   * when fully visible, avoiding duplicate calls to intersection triggers.
   */
  const [isTopPending, startTopTransition] = useTransition();
  const [isBotPending, startBotTransition] = useTransition();

  /**
   * Tracks whether the current viewport width is smaller than Tailwind's `md` breakpoint (768px).
   * Returns `true` if the viewport is considered mobile, `false` otherwise.
   */
  const isMobile = useIsMobile();

  /**
   * Handle initial scroll setup.
   *
   * - Scrolls down slightly to prevent the top loader from triggering immediately.
   * - Sets a flag so the top loader only triggers after the first user scroll event.
   */
  useEffect(() => {
    /**
     * resets the anchors and previous and moreState whenever isMobile changes
     */
    resetPagination();

    /**
     * Scrolls the container slightly on mobile to prevent the top-side loader
     * from being immediately visible.
     *
     * Notes:
     * - Checks `containerRef.current` to avoid TypeScript warnings.
     * - No scrolling is performed on desktop (`isMobile` must be true).
     */
    if (!containerRef.current || !isMobile) return;
    const container = containerRef.current;
    container.scrollTop = 100;

    /**
     * Adds a scroll event listener to the container if it hasn't been added yet.
     *
     * Behavior:
     * 1. Checks `isListenerAttachedRef` to avoid adding multiple listeners.
     * 2. On container scroll, sets `scrollTriggered.current = true` so the top loader can add data.
     * 3. Marks `isListenerAttachedRef.current = true` to indicate the listener is active.
     */
    if (isListenerAttachedRef.current) return;
    const handleScroll = () => {
      scrollTriggered.current = true;
    };

    container.addEventListener("scroll", handleScroll);

    isListenerAttachedRef.current = true;
    /**
     * Cleanup:
     * - Before unmounting, removes the scroll listener and resets
     *   `isListenerAttachedRef.current` to `false` to indicate no active listener.
     */
    return () => {
      container.removeEventListener("scroll", handleScroll);
      isListenerAttachedRef.current = false;
    };
  }, [isMobile]);

  /**
   * Handles updates to anchors when top or bottom loaders intersect with the viewport.
   *
   * Behavior:
   * - `top` loader:
   *   - Only updates `topAnchor` if the user has scrolled (`scrollTriggered.current = true`).
   *   - Uses `startTopTransition` to defer state updates and prevent UI blocking.
   *   - Decrements `topAnchor` by 1 and scrolls the container slightly to hide the top loader.
   *   - Resets `scrollTriggered.current` to `false`.
   *
   * - `bot` loader:
   *   - Uses `startBotTransition` to defer state updates.
   *   - Increments `botAnchor` by 1 to append more countries.
   *
   * @param loader - Indicates which loader triggered the intersection (`'top'` or `'bot'`).
   */
  const handlerLoaderIntersect = (loader: "top" | "bot") => {
    if (loader === "top") {
      // Top loader logic
      if (scrollTriggered.current) {
        startTopTransition(() => {
          setTopAnchor(topAnchor - 1);
          scrollTriggered.current = false;
          if (containerRef.current) {
            containerRef.current.scrollTop = 100;
          }
        });
      }
    } else {
      // Bottom loader logic
      startBotTransition(() => {
        setBotAnchor(botAnchor + 1);
      });
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div ref={containerRef} className="flex-1 min-h-0 overflow-y-auto">
        {/* 
          Top-side loader:
          - Visible only when `topAnchor > 1`, meaning the user hasn't scrolled to the first page yet.  
          - Triggers `handlerLoaderIntersect("top")` when it intersects the viewport.
        */}
        {topAnchor > 1 && (
          <InfiniteScrollLoader
            isPending={isTopPending}
            onLoaderIntersect={() => handlerLoaderIntersect("top")}
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Previous countries (prepended at the top) */}
          {previousCountries.map((country) => (
            <CountryCard key={country.cca3} country={country} />
          ))}

          {/* Server-side rendered children */}
          {children}

          {/* More countries (appended at the bottom) */}
          {moreCountries.map((country) => (
            <CountryCard key={country.cca3} country={country} />
          ))}
        </div>

        {/* 
          Bottom-side loader:
          - Visible only when `botAnchor < lastPage`, meaning the user hasn't scrolled to the last page yet.  
          - Triggers `handlerLoaderIntersect("bot")` when it intersects the viewport.
        */}
        {botAnchor < lastPage && (
          <InfiniteScrollLoader
            isPending={isBotPending}
            onLoaderIntersect={() => handlerLoaderIntersect("bot")}
          />
        )}
      </div>
    </div>
  );
};
