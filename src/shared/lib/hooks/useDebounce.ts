import { useState, useEffect } from 'react';

/**
 * Custom React hook for handling debouncing.
 *
 * Debouncing ensures that a function (like an API call or an expensive calculation)
 * only runs after the user stops typing for a specified delay.
 *
 * This is especially useful for:
 * - Search inputs (avoid sending a request on every keystroke).
 * - Filtering large lists.
 * - Any expensive task that shouldn't run on every small input change.
 *
 * @param value The input value to debounce (usually a string).
 * @param delay The debounce delay in milliseconds. Default is 300ms.
 * @returns The debounced value that updates only after the delay has passed.
 */
export function useDebounce(value: string, delay: number = 300): string {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set a timer that updates debouncedValue after "delay" ms
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // If "value" changes before the delay finishes,
    // clear the timeout to avoid unnecessary updates
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
