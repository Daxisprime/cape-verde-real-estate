import { Suspense } from "react";
import PropTechRevolutionPageClient from "./PropTechRevolutionPageClient";

export default function PropTechRevolutionPagePage() {
  return (
    <Suspense>
      <PropTechRevolutionPageClient />
    </Suspense>
  );
}
