"use client";

import { ReactNode } from "react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { PropertySearchProvider } from "@/contexts/PropertySearchContext";
import { SupabaseAuthProvider } from "@/contexts/SupabaseAuthContext";
import { PaymentProvider } from "@/contexts/PaymentContext";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SupabaseAuthProvider>
      <PaymentProvider>
        <LanguageProvider>
          <PropertySearchProvider>
            {children}
          </PropertySearchProvider>
        </LanguageProvider>
      </PaymentProvider>
    </SupabaseAuthProvider>
  );
}
