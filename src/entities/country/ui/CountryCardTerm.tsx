// I've separated this small component to keep CountryCard component clean and readable
// Also when there is a need to change the design of term-definition pairs, we can do it here without touching CountryCard component

interface Props {
  term: string;
  definition: string | number;
  className: string;
}

export const CountryCardTerm = ({ term, definition, className }: Props) => {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`w-2 h-2 rounded-full flex-shrink-0 ${className}`}
      ></span>
      <div className="flex-1">
        <span className="text-gray-400">{term}: </span>
        <span className="text-gray-100 font-medium">{definition}</span>
      </div>
    </div>
  );
};
