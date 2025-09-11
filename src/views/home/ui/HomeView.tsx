// I've created HomeView component here to colocate it with other smaller components related to Home page
// Based on FSD principles, In Real word app we have to create a folder for each page inside 'src/pages' or 'src/views' based on the project structure

import { Country } from '@entities/country/model/types';
import { CountryCard } from '@entities/country/ui';
import { InfiniteScroll } from './InfiniteScroll';

interface Props {
  countries: Country[];
  currentPage: number;
  dataPerPage: number;
}

export const HomeView = ({ countries, currentPage, dataPerPage }: Props) => {
  const paginatedCountries = countries.slice(
    (currentPage - 1) * dataPerPage,
    currentPage * dataPerPage
  );

  const lastPage = Math.ceil(countries.length / dataPerPage);

  async function fetchCountries(page: number, perPage = 12) {
    'use server';
    await new Promise(resolve => setTimeout(resolve, 10_000));
    return countries.slice((page - 1) * perPage, page * perPage);
  }

  return (
    <InfiniteScroll
      fetchCountries={fetchCountries}
      initialPage={currentPage}
      lastPage={lastPage}
    >
      {paginatedCountries.map(country => (
        <CountryCard key={country.cca3} country={country} />
      ))}
    </InfiniteScroll>
  );
};
