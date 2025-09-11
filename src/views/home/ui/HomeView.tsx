// I've created HomeView component here to colocate it with other smaller components related to Home page
// Based on FSD principles, In Real word app we have to create a folder for each page inside 'src/pages' or 'src/views' based on the project structure

import { Country } from '@entities/country/model/types';
import { CountryCard } from '@entities/country/ui';
import { InfiniteScroll } from './InfiniteScroll';

interface Props {
  countries: Country[];
}

export const HomeView = ({ countries }: Props) => {
  return (
    <InfiniteScroll>
      {countries.map(country => (
        <CountryCard key={country.cca3} country={country} />
      ))}
    </InfiniteScroll>
  );
};
