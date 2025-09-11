// I've put Pagination inside @shared because it might be used in other places later.
// Also, it's not big enough to be considered a feature that's why i didn't place it on @features

import Link from "next/link";

interface Props {
  perPage: number;
  currentPage: number;
  length: number;
}

export const Pagination = ({ length, perPage, currentPage }: Props) => {
  // calculate how many pages we will have in total
  const lastPage = Math.ceil(length / perPage);

  // Generate an array of pages, I'm using Set to remove duplicate results
  // if currentPage - 1 and currentPage + 1 results in an invalid number for example 0 or negative number, currentPage will be placed instead.
  // because currentPage is always present inside of the array, the replacements will be removed because they are duplicate
  const pages = [
    ...new Set([
      1,
      currentPage - 1 > 0 ? currentPage - 1 : currentPage,
      currentPage,
      currentPage + 1 < lastPage ? currentPage + 1 : currentPage,
      lastPage,
    ]),
  ];

  return (
    <div className="flex gap-2 justify-center">
      {pages.map((page, i) => {
        const noGap = !pages[i - 1] || page - pages[i - 1] === 1;

        return (
          <div key={page} className="flex items-center gap-2">
            {!noGap && "..."}
            <Link
              href={`?page=${page}`}
              className="w-10 h-10 rounded-md bg-cyan-400 hover:bg-cyan-300 text-black flex items-center justify-center text-xs font-extrabold"
            >
              {page}
            </Link>
          </div>
        );
      })}
    </div>
  );
};
