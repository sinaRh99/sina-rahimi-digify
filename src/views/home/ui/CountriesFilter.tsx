'use client';

import { useDebounce } from '@shared/lib/hooks/useDebounce';
import { Select } from '@shared/ui/Select';
import { TextField } from '@shared/ui/TextField';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChangeEvent, useEffect, useState, useTransition } from 'react';

const values = [12, 24, 34, 56];

interface Props {
  dataPerPage: number;
  search: string;
}

export const CountriesFilter = ({ dataPerPage, search }: Props) => {
  const [query, setQuery] = useState(search);
  const debouncedQuery = useDebounce(query);
  const [isPending, startTransition] = useTransition();

  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePerPageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());

    // create a new params object
    params.set('perPage', String(e.target.value)); // update only `perPage` param
    router.push(`?${params.toString()}`); // navigate to the new url
  };

  useEffect(() => {
    if (isPending) return; // avoid multiple navigation when user is still typing
    if (debouncedQuery === search) return; // avoid navigation if the query is same as current search param
    // I'm using useTransition to avoid blocking the UI when navigating
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      // create a new params object
      params.set('search', debouncedQuery); // update only `search` param
      router.push(`?${params.toString()}`); // navigate to the new url
    });
  }, [debouncedQuery, isPending, search, searchParams, router]);

  return (
    <div className="pb-8 pt-4">
      <div className="max-w-[500px] flex gap-4">
        <TextField
          value={query}
          placeholder="Search countries..."
          onChange={e => setQuery(e.target.value)}
        />
        <Select value={dataPerPage} onChange={handlePerPageChange}>
          {values.map(value => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
};
