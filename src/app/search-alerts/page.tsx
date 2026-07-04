import { Suspense } from "react";
import SearchAlertsPageClient from "./SearchAlertsPageClient";

export default function SearchAlertsPagePage() {
  return (
    <Suspense>
      <SearchAlertsPageClient />
    </Suspense>
  );
}
