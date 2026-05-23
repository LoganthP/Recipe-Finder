/**
 * useDebounce — delays updating a value until after the specified delay.
 * @param {*} value — the value to debounce
 * @param {number} delay — milliseconds to wait (default 400)
 * @returns debounced value
 */
import { useState, useEffect } from 'react';

export default function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
