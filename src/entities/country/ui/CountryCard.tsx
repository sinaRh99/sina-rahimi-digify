// I've created a simple CountryCard component to display country information
// I've placed this file inside the country entity folder because this component is related to country entity
// In a real word app, We might have other features related to country like neighboring countries, historical related countries etc
// So we might use the same CountryCard component in those features as well, so to keep things organized, I've placed this component inside country entity

import Image from 'next/image';
import { Country } from '../model/types';
import { CountryCardTerm } from './CountryCardTerm';

interface Props {
  country: Country;
}

export const CountryCard = ({ country }: Props) => {
  return (
    <div className="bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 hover:-translate-y-1 overflow-hidden border border-gray-700">
      <div className="relative h-48 overflow-hidden">
        <Image
          width={300}
          height={150}
          src={country.flags.png}
          alt={country.flags.alt || `Flag of ${country.name.common}`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
      </div>

      {/* Card Content */}
      <div className="p-6 space-y-4">
        {/* Country Name */}
        <h2 className="text-2xl font-bold text-white truncate">
          {country.name.common}
        </h2>

        {/* Country Details */}
        <div className="space-y-3">
          {/* Population */}
          <CountryCardTerm
            className="bg-blue-400"
            term="Population"
            // formatting population number with commas as thousands separators
            definition={country.population.toLocaleString()}
          />

          {/* Region */}
          <CountryCardTerm
            className="bg-green-400"
            term="Region"
            definition={country.region}
          />

          {/* Area */}
          <CountryCardTerm
            className="bg-orange-400"
            term="Area"
            definition={`${country.area} km²`}
          />
        </div>
      </div>
    </div>
  );
};
