'use client';

/**
 * A reusable, stateless pagination component.
 *
 * - Placed under `@shared` for use across multiple features and pages.
 * - Designed to be "dumb" (stateless) for maximum flexibility:
 *   - Does not manage pagination state internally.
 *   - Does not handle conditional rendering (e.g., hiding on mobile).
 *   - Consumers are responsible for managing `currentPage`, `lastPage`,
 *     and when/how the component is shown.
 */
interface Props {
  /**
   * The currently active page number.
   * Used to highlight the corresponding page button.
   */
  currentPage: number;

  /**
   * The maximum page number.
   * Defines the upper bound of pagination.
   */
  lastPage: number;

  /**
   * Number of adjacent pages to display
   * before and after the current page.
   *
   * @default 1
   */
  padding?: number;

  /**
   * Optional CSS class names applied to the root container.
   * Useful for layout or style overrides.
   */
  className?: string;

  /**
   * Callback fired when a page button is clicked.
   *
   * @param page - The page number that was clicked.
   */
  onPageChange: (page: number) => void;
}

export const Pagination = ({
  currentPage,
  lastPage,
  padding = 1,
  className,
  onPageChange,
}: Props) => {
  // Determine the visible range of page numbers.
  // Math.max ensures the start is at least 1.
  // Math.min ensures the end does not exceed `lastPage`.
  //
  // Example: currentPage=1, padding=2 → start=1, end=3 → [1,2,3].
  const start = Math.max(currentPage - padding, 1);
  const end = Math.min(currentPage + padding, lastPage);

  // Build the list of visible pages.
  // - Always include the first and last pages.
  // - Include the range around the current page (`start` → `end`).
  // - Wrap in a Set to avoid duplicates when ranges overlap with
  //   the first/last page.
  //
  // Example: currentPage=5, padding=2, lastPage=10 → [1, 3,4,5,6,7, 10].
  const pages = [
    ...new Set([
      1,
      ...Array.from({ length: end - start + 1 }, (_, i) => start + i),
      lastPage,
    ]),
  ];

  return (
    <div className={`flex gap-2 justify-center ${className}`}>
      {pages.map((page, i) => {
        // Check for a gap between this page and the previous one.
        // If a gap exists, render "..." as a visual separator.
        const noGap = !pages[i - 1] || page - pages[i - 1] === 1;

        return (
          <div key={page} className="flex items-center gap-2">
            {!noGap && '...'}
            <span
              className={`w-10 h-10 rounded-md ${
                page === currentPage
                  ? 'bg-amber-400'
                  : 'bg-cyan-400 hover:bg-cyan-300'
              } flex items-center justify-center text-black text-xs font-extrabold cursor-pointer`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </span>
          </div>
        );
      })}
    </div>
  );
};
