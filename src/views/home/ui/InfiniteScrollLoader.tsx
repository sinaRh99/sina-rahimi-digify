// simple loader block for showing loading animation when we are fetching data
// I've created this in a separate component because I want to use it both at the top and bottom of the page
// We pass ref from InfiniteScroll component and observe the loader intersection
// after the loader is fully intersected we fetch data

import classNames from './InfiniteScrollLoader.module.css';

interface Prop {
  ref: React.Ref<HTMLDivElement>;
  progress: number;
  id: string;
  isLoading?: boolean;
}

export const InfiniteScrollLoader = ({
  ref,
  progress,
  id,
  isLoading,
}: Prop) => {
  return (
    <div
      ref={ref}
      id={id}
      className="pt-8 pb-4 w-full flex flex-col items-center justify-center"
    >
      <div
        className={`${
          isLoading ? classNames.loading : ''
        } w-14 h-14 bg-slate-900 rounded-full flex items-center justify-center relative overflow-hidden`}
      >
        <div
          className="w-14 h-14 bg-white absolute right-full"
          style={{
            transform: `translateX(${(isLoading ? 0.44 : progress) * 100}%)`,
          }}
        ></div>
        <div className="w-12 h-12 rounded-full bg-slate-900 relative"></div>
      </div>
      <div className="mt-4">{isLoading ? 'loading...' : 'load more'}</div>
    </div>
  );
};
