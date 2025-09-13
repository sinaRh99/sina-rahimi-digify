/**
 * HomeView component.
 *
 * - Colocated with other smaller components related to the Home page.
 * - Based on FSD principles: in a real-world app, each page would typically have its own folder
 *   inside `src/pages` or `src/views` depending on the project structure.
 *
 * - Uses an InfiniteScroll wrapper to load more or previous data on mobile view.
 * - I could have made the mobile loader entirely separate because infinite scrolling requires
 *   client-side handling, but since the task requirement was to use SSR for the first load,
 *   I combined both approaches.
 * - Two loaders (top and bottom) are used inside InfiniteScroll to append data dynamically.
 * - Another approach could have been to detect the user agent and handle desktop pagination
 *   versus mobile InfiniteScroll, but that approach would not respond to screen width changes.
 *   Doing it this way was also more enjoyable for me.
 */
import { Country } from '@entities/country/model/types';
import { CountryCard } from '@entities/country/ui';
import { InfiniteScroll } from './InfiniteScroll';
import { CountriesFilter } from './CountriesFilter';
import { HomeViewPagination } from './HomeViewPagination';

interface Props {
  /** Initial list of countries fetched from the server. */
  countries: Country[];
}

export const HomeView = async ({
  countries, // initial list of countries from server
}: Props) => {
  return (
    <div className="h-full flex flex-col">
      {/* Filter and search controls */}
      <CountriesFilter />

      <div className="min-h-0 flex-1">
        {/* On mobile, InfiniteScroll will add more cards at the top or bottom while scrolling */}
        <InfiniteScroll>
          {/* Rendering SSR country cards on initial load */}
          {countries.map(country => (
            <CountryCard key={country.cca3} country={country} />
          ))}
        </InfiniteScroll>
      </div>

      {/* Pagination state handled here to keep the Pagination component reusable */}
      <HomeViewPagination />
    </div>
  );
};
