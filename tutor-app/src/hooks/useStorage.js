import { useState, useCallback } from 'react';

// Persistent state backed by localStorage
export function useStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : initial;
    } catch {
      return initial;
    }
  });

  const set = useCallback((next) => {
    setValue(prev => {
      const val = typeof next === 'function' ? next(prev) : next;
      try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
      return val;
    });
  }, [key]);

  return [value, set];
}
