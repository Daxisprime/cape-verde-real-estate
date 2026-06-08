// Global mounting utilities to handle SSR and mounting issues

import { useState, useEffect } from 'react';

/**
 * Custom hook to safely handle component mounting state
 * Provides a defensive approach against SSR/hydration issues
 */
export function useMountedState(initialState: boolean = false) {
  const [isMounted, setIsMounted] = useState(initialState);

  useEffect(() => {
    setIsMounted(true);

    // Defensive global variable setup
    if (typeof window !== 'undefined') {
      // Ensure mounted is defined globally for any legacy code
      (window as Window & { mounted?: boolean }).mounted = true;
    }
  }, []);

  return isMounted;
}

/**
 * Defensive mounting check utility
 */
export function isBrowserMounted(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return true;
}
