import { useEffect, useState } from 'react';

// For this example, there is no need to pass breakpoint as a prop
// because we are using this hook in a single component and the breakpoint is fixed.
// however, I've added it just in case :D

// I've used 768px as default breakpoint because in tailwind md starts from 768px (https://tailwindcss.com/docs/responsive-design)
// And my countries page is in mobile view until 768px
export const useIsMobile = (breakpoint: number = 768) => {
  // First, we check if window is defined to avoid issues during server-side rendering
  // Then we set the initial state based on the current window width
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && window.innerWidth < breakpoint
  );

  useEffect(() => {
    const handleResize = () => {
      // Update the state based on the current window width
      setIsMobile(window.innerWidth < breakpoint);
    };

    // I've added the event listener to listen to resize event and call handleResize function
    window.addEventListener('resize', handleResize);

    return () => {
      // Cleanup the event listener on component unmount
      window.removeEventListener('resize', handleResize);
    };
  }, [breakpoint]);

  return isMobile;
};
