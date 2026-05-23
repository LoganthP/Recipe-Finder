/**
 * useDarkMode - keeps the app theme in localStorage and mirrors it on <html>.
 * Returns the current dark-mode state plus a toggle function.
 */
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'theme';

function getInitialTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'dark') return true;
  if (saved === 'light') return false;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches || false;
}

export default function useDarkMode() {
  const [isDark, setIsDark] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light');
  }, [isDark]);

  return [isDark, () => setIsDark(current => !current)];
}
