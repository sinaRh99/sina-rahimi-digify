import { useEffect, useState } from 'react';

// In this example, there’s technically no need to pass a breakpoint as a prop,
// since we only use this hook in a single component with a fixed breakpoint.
// However, I added it for flexibility just in case. :D

// I used 768px as the default breakpoint because Tailwind’s `md` starts at 768px
// (https://tailwindcss.com/docs/responsive-design).
// My countries page is in mobile view until 768px, so that’s a good default here.
export const useIsMobile = (breakpoint: number = 768) => {
  // First, check if "window" is defined to avoid issues during server-side rendering.
  // Then, set the initial state based on the current window width.
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && window.innerWidth < breakpoint
  );

  useEffect(() => {
    const handleResize = () => {
      // Update the state whenever the window is resized
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Add a resize event listener and run handleResize on each change
    window.addEventListener('resize', handleResize);

    return () => {
      // Clean up the event listener on component unmount
      window.removeEventListener('resize', handleResize);
    };
  }, [breakpoint]);

  return isMobile;
};
