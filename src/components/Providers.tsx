"use client";

import { ReactNode } from "react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { PropertySearchProvider } from "@/contexts/PropertySearchContext";
import { SupabaseAuthProvider } from "@/contexts/SupabaseAuthContext";
import { PaymentProvider } from "@/contexts/PaymentContext";
import { SearchModeProvider } from "@/contexts/SearchModeContext";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SupabaseAuthProvider>
      <AuthProvider>
        <LanguageProvider>
          <SearchModeProvider>
            <PropertySearchProvider>
              <PaymentProvider>
                {children}
              </PaymentProvider>
            </PropertySearchProvider>
          </SearchModeProvider>
        </LanguageProvider>
      </AuthProvider>
    </SupabaseAuthProvider>
  );
}
