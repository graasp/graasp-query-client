import debounce from 'lodash.debounce';
import { useEffect, useMemo, useState } from 'react';

// TODO: define a single debounce hook
// probably it's more versatile to keep the callback one
// remove lodash debounce?
// see https://github.com/tannerlinsley/react-query/issues/293
// see https://usehooks.com/useDebounce/
export function useDebounce<T>(value: T, delay: number) {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(
    () => {
      // Update debounced value after delay
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      // Cancel the timeout if value changes (also on delay change or unmount)
      // This is how we prevent debounced value from updating if value is changed ...
      // .. within the delay period. Timeout gets cleared and restarted.
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay], // Only re-call effect if value or delay changes
  );

  return debouncedValue;
}

/**
 * This custom hooks create a debounced function that delays invoking func until after wait milliseconds have elapsed since the last time the debounced function was invoked.
 *
 * **Warning**: It is important to use useCallback for the callback params to ensure to not end in an infinite loop.
 *
 * @param callback The callback function to debounce, returned by a **useCallback**.
 * @param debounceDelayMS The number of milliseconds to delay.
 * @returns isDebounced Indicates if the callback is debounced or not.
 */
export const useDebounceCallback = (
  callback: () => void,
  debounceDelayMS: number,
): { isDebounced: boolean } => {
  const [isDebounced, setIsDebounced] = useState<boolean>(false);

  const debounceSetSend = useMemo(() => {
    setIsDebounced(true);
    return debounce(() => {
      callback();
      setIsDebounced(false);
    }, debounceDelayMS);
  }, [callback, debounceDelayMS]);

  // Stop the invocation of the debounced function after unmounting
  useEffect(() => () => debounceSetSend.cancel(), [debounceSetSend]);

  // Call debounce to minimize calls
  useEffect(() => debounceSetSend(), [debounceSetSend, callback]);

  return {
    isDebounced,
  };
};
