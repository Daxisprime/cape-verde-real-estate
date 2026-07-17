"use client";

import { useEffect } from "react";
import CookieConsent from "@/components/CookieConsent";

export default function ClientBody({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    document.body.className = "antialiased";
  }, []);

  return (
    <div className="antialiased">
      {children}
      <CookieConsent />
    </div>
  );
}
