// Its a simple hook for handling debouncing
// its useful when using with search inputs or any inputs that needs to do some heavy task when it's value changes
// I've made it a hook to use this logic inside multiple components

import { useState, useEffect } from 'react';

export function useDebounce(value: string, delay: number = 300): string {
  const [debouncedValue, setDebouncedValue] = useState(value);

  // inside the useEffect we will set the debouncedValue after a specified timeout passed from first key stroke
  // this way if the user is still typing we can wait until it finishes typing
  // and this hook returns debounced value and we can handle our async task or expensive task based on changes of debounced value
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup if value changes before delay ends
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
