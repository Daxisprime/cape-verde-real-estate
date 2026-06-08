"use client";

import { ReactNode } from "react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { PropertySearchProvider } from "@/contexts/PropertySearchContext";
import { SupabaseAuthProvider } from "@/contexts/SupabaseAuthContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { PaymentProvider } from "@/contexts/PaymentContext";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SupabaseAuthProvider>
      <AuthProvider>
        <LanguageProvider>
          <PropertySearchProvider>
            <PaymentProvider>
              <ChatProvider>
                {children}
              </ChatProvider>
            </PaymentProvider>
          </PropertySearchProvider>
        </LanguageProvider>
      </AuthProvider>
    </SupabaseAuthProvider>
  );
}
