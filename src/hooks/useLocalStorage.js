import { useState } from 'react';

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  function setValue(value) {
    try {
      const next = typeof value === 'function' ? value(storedValue) : value;
      window.localStorage.setItem(key, JSON.stringify(next));
      setStoredValue(next);
    } catch {
      // ignore write errors (e.g. private browsing storage limits)
    }
  }

  return [storedValue, setValue];
}
