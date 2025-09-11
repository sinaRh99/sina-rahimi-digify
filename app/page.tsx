import { readAllCountries } from '@entities/country/api';
import { HomeView } from '@views/home';

interface Props {
  searchParams: Promise<{ page?: string; perPage?: string }>;
}

export default async function Home({ searchParams }: Props) {
  // I'm reading current page and data per page from search params
  // I'm passing default value because search params are always string or undefined
  const { page = '1', perPage = '12' } = await searchParams;
  // I'm converting them to number
  const currentPage = Number(page);
  const dataPerPage = Number(perPage);

  // Fetching all countries data from restcountries api
  // In a real world app, The pagination is implemented in the backend api
  // But since restcountries api doesn't support pagination, I'm fetching all data and doing pagination in the frontend
  const { data, hasError, errorMessage } = await readAllCountries();
  console.log('🚀 ~ Home ~ hasError:', hasError);
  // console.log('🚀 ~ Home ~ errorMessage:', errorMessage);

  const countries =
    data?.slice((currentPage - 1) * dataPerPage, currentPage * dataPerPage) ||
    [];
  console.log('🚀 ~ Home ~ countries:', countries);

  return <HomeView countries={countries} />;
}
