import StoreProvider from '@app/store/StoreProvider';
import { readAllCountries } from '@entities/country/api';
import { HomeView } from '@views/home';
interface Props {
  searchParams: Promise<{ page?: string; perPage?: string; search?: string }>;
}

export default async function Home({ searchParams }: Props) {
  // I'm reading current page and data per page from search params
  // I'm passing default value because search params are always string or undefined
  const { page = '1', perPage = '12', search = '' } = await searchParams;
  // I'm converting them to number
  const currentPage = Number(page);
  const dataPerPage = Number(perPage);

  // Fetching all countries data from restcountries api
  // In a real world app, The pagination is implemented in the backend api
  // But since restcountries api doesn't support pagination, I'm fetching all data and doing pagination in the frontend
  const { data } = await readAllCountries();

  // I'm filtering countries based on their name and cca
  const filteredCountries =
    data?.filter(country =>
      `${country.name.common}${country.cca3}`
        .toLowerCase()
        .includes(search.toLowerCase())
    ) || [];

  // last page for our pagination component
  const lastPage = Math.ceil(filteredCountries.length / dataPerPage);
  // when the page from url params is bigger than our last page component, we show last page instead
  // this scenario might happen when we are in navigating various pages of our app and suddenly decide to filter the data
  const validCurrentPage = Math.min(currentPage, lastPage);

  // create a slice of countries to render based on page number, data per page and searchQuery
  const slicedCountries = filteredCountries.slice(
    (validCurrentPage - 1) * dataPerPage,
    validCurrentPage * dataPerPage
  );

  return (
    // I'm passing Initial data to my store
    <StoreProvider
      topAnchor={validCurrentPage}
      botAnchor={validCurrentPage}
      filteredCountries={filteredCountries}
      currentPage={validCurrentPage}
      perPage={dataPerPage}
      searchQuery={search}
      totalCountries={data || []}
    >
      <HomeView countries={slicedCountries} />
    </StoreProvider>
  );
}
