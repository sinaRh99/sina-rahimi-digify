// I've created HomeView component here to colocate it with other smaller components related to Home page
// Based on FSD principles, In Real word app we have to create a folder for each page inside 'src/pages' or 'src/views' based on the project structure

import { Country } from '@entities/country/model/types';
import { CountryCard } from '@entities/country/ui';
import { InfiniteScroll } from './InfiniteScroll';
import { CountriesFilter } from './CountriesFilter';
import { Pagination } from '@shared/ui/Pagination';
import { HomeViewPagination } from './HomeViewPagination';

interface Props {
  countries: Country[];
}

export const HomeView = async ({
  countries,
}: // currentPage,
// dataPerPage,
// search,
Props) => {
  return (
    <div className="h-full flex flex-col">
      <CountriesFilter />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <InfiniteScroll>
          {countries.map(country => (
            <CountryCard key={country.cca3} country={country} />
          ))}
        </InfiniteScroll>
      </div>
      {/* I've handled display state of pagination here because I wanted to make Pagination component as reusable as possible */}
      <HomeViewPagination />
    </div>
  );
};
