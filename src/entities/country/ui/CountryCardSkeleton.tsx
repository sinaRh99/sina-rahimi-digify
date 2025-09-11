// This is a skeleton loader for the CountryCard component
// It is used to show a placeholder while the actual data is being loaded
// This improves the user experience by providing visual feedback that something is happening

export const CountryCardSkeleton = () => {
  return (
    <div className="shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 hover:-translate-y-1 rounded-xl">
      <div className="relative h-48 overflow-hidden bg-gray-800 border border-gray-700 rounded-t-xl" />
      <div className="p-6 space-y-4">
        <div className="h-8 w-1/2 flex items-center">
          <div className="bg-gray-800 h-4 w-full rounded-xl" />
        </div>

        <div className="space-y-3">
          <div className="h-5 w-1/3 flex items-center">
            <div className="bg-gray-800 h-2 w-full rounded-xl" />
          </div>
          <div className="h-5 w-1/3 flex items-center">
            <div className="bg-gray-800 h-2 w-full rounded-xl" />
          </div>
          <div className="h-5 w-1/3 flex items-center">
            <div className="bg-gray-800 h-2 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};
