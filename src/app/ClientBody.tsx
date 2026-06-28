"use client";

import { useEffect } from "react";

export default function ClientBody({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    document.body.className = "antialiased";

    // Suppress false-positive "Supabase request failed" errors from the
    // preview proxy script (/.preview-script.js) which clones Supabase
    // responses and logs them via console.error. These are not real app errors.
    const originalError = console.error;
    console.error = (...args: unknown[]) => {
      if (
        typeof args[0] === 'string' &&
        args[0].includes('Supabase request failed')
      ) {
        return;
      }
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  return <div className="antialiased">{children}</div>;
}
