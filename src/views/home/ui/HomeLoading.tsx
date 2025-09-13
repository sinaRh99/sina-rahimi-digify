/**
 * HomeLoading component.
 *
 * Displays a temporary loading state for the Home view.
 * Uses `CountryCardSkeleton` to show placeholders while data is being fetched.
 *
 * @remarks
 * - Renders 12 skeleton cards by default.
 * - Layout uses a responsive grid to match the Home view design.
 */
import { CountryCardSkeleton } from '@entities/country/ui';

export const HomeLoading = () => {
  // Generate an array of 12 items to render placeholder skeletons.
  const items = Array.from({ length: 12 }, (_, index) => index);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map(item => (
        <CountryCardSkeleton key={item} />
      ))}
    </div>
  );
};
