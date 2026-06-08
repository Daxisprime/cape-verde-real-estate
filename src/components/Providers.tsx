"use client";

import { ReactNode } from "react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { PropertySearchProvider } from "@/contexts/PropertySearchContext";
import { SupabaseAuthProvider } from "@/contexts/SupabaseAuthContext";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SupabaseAuthProvider>
      <AuthProvider>
        <LanguageProvider>
          <PropertySearchProvider>
            {children}
          </PropertySearchProvider>
        </LanguageProvider>
      </AuthProvider>
    </SupabaseAuthProvider>
  );
}
