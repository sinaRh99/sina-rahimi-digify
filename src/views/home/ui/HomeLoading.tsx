// This is a temporary loading state component for the Home view.
// It uses CountryCardSkeleton component to show loading placeholders

import { CountryCardSkeleton } from '@entities/country/ui';

export const HomeLoading = () => {
  // Creating an array of 12 items to render 12 skeleton cards
  const items = Array.from({ length: 12 }, (_, index) => index);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map(item => (
        <CountryCardSkeleton key={item} />
      ))}
    </div>
  );
};
