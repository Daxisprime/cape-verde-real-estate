import { Metadata } from "next";
import OnboardFormClient from "./OnboardFormClient";

export const metadata: Metadata = {
  title: "Onboarding de Vendedor | Pro.CV Admin",
  description: "Formulario de registo rapido de vendedores em campo",
};

export default function OnboardPage() {
  return <OnboardFormClient />;
}
