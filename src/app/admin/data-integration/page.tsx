import { Suspense } from "react";
import DataIntegrationAdminPageClient from "./DataIntegrationAdminPageClient";

export default function DataIntegrationAdminPagePage() {
  return (
    <Suspense>
      <DataIntegrationAdminPageClient />
    </Suspense>
  );
}
