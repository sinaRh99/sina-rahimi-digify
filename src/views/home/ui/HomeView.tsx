// I've created HomeView component here to colocate it with other smaller components related to Home page
// Based on FSD principles, In Real word app we have to create a folder for each page inside 'src/pages' or 'src/views' based on the project structure

import { Country } from '@entities/country/model/types';
import { CountryCard } from '@entities/country/ui';
import { InfiniteScroll } from './InfiniteScroll';
import { CountriesFilter } from './CountriesFilter';
import { Pagination } from '@shared/ui/Pagination';

interface Props {
  countries: Country[];
  currentPage: number;
  dataPerPage: number;
  search: string;
}

export const HomeView = async ({
  countries,
  currentPage,
  dataPerPage,
  search,
}: Props) => {
  // I'm filtering countries based on their name and cca
  const filteredCountries = countries.filter(country =>
    `${country.name.common}${country.cca3}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // last page for our pagination component
  const lastPage = Math.ceil(filteredCountries.length / dataPerPage);

  // when the page from url params is bigger than our last page component, we show last page instead
  // this scenario might happen when we are in navigating various pages of our app and suddenly decide to filter the data
  const validCurrentPage = Math.min(currentPage, lastPage);

  async function fetchCountries(page: number) {
    'use server';
    const minPage = Math.min(page, lastPage);
    return filteredCountries.slice(
      (minPage - 1) * dataPerPage,
      minPage * dataPerPage
    );
  }

  const paginatedCountries = await fetchCountries(validCurrentPage);

  return (
    <div className="h-full flex flex-col">
      <CountriesFilter search={search} dataPerPage={dataPerPage} />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <InfiniteScroll
          fetchCountries={fetchCountries}
          initialPage={validCurrentPage}
          lastPage={lastPage}
        >
          {paginatedCountries.map(country => (
            <CountryCard key={country.cca3} country={country} />
          ))}
        </InfiniteScroll>
      </div>
      {/* I've handled display state of pagination here because I wanted to make Pagination component as reusable as possible */}
      <div className="hidden md:block">
        {lastPage > 1 && (
          <Pagination
            currentPage={validCurrentPage}
            lastPage={lastPage}
            padding={1}
            className="mt-8"
          />
        )}
      </div>
    </div>
  );
};
