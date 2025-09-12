// I've created a separate file for read api calls
// In a real world app, we will have create, update and delete api calls as well
// So to keep things organized, I've created separate files for each type of api call

// I've placed this file inside the country entity folder because this api call is related to country entity
// In a real world app, we will have api calls related to other entities as well

import { cache } from 'react';
import { Country } from '../../model/types';
import { fetcher } from '@shared/lib/api';

// Reads countries from restcountries api
// I'm using react cache to cache the result of this function
// So that if this function is called multiple times, it will return the cached result
// Instead of making multiple api calls
export const readAllCountries = cache(async () => {
  // I'm passing fields param to the api because restcountries documentation says so, not passing them will result in a response with status 400
  // Each field specifies what data should the api return for each country
  // I'm asking for cca3 because its a unique 3words for each country and I can use it as key when I'm rendering a list
  const res = await fetcher<Country[]>(
    'https://restcountries.com/v3.1/all?fields=name,flags,population,area,region,cca3',
    { cache: 'force-cache' }
  );

  // await new Promise(resolve => setTimeout(resolve, 10_000));

  return res;
});
