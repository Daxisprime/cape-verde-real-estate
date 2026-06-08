"use client";

import { useEffect } from 'react';

interface MountingProviderProps {
  children: React.ReactNode;
}

declare global {
  interface Window {
    mounted?: boolean;
    isMounted?: boolean;
    clientMounted?: boolean;
  }
}

export default function MountingProvider({ children }: MountingProviderProps) {
  useEffect(() => {
    // Initialize mounting globals on client side
    if (typeof window !== 'undefined') {
      // Set up global variables defensively
      window.mounted = true;
      window.isMounted = true;
      window.clientMounted = true;
    }
  }, []);

  return <>{children}</>;
}
