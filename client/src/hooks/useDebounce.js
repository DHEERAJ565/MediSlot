import { useState, useEffect } from 'react';

/**
 * ============================================================================
 * UNIT III: Custom Hook — useDebounce
 * ============================================================================
 * Demonstrates:
 * - Functional component logic reuse via custom hooks.
 * - Side-effect management with useEffect.
 * - Cleanup function mechanism to clear timeouts on rapid re-renders.
 * - Performance optimization to prevent excessive filtering/API calls.
 *
 * @param {any} value - The input value to debounce (e.g. search query)
 * @param {number} delayMs - Delay duration in milliseconds (defaults to 300ms)
 * @returns {any} debouncedValue
 */
export const useDebounce = (value, delayMs = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set a timer to update debounced value after delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    // Effect cleanup: cancelled if value or delayMs changes before timeout fires
    return () => {
      clearTimeout(handler);
    };
  }, [value, delayMs]);

  return debouncedValue;
};

export default useDebounce;
