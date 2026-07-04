import { Suspense } from "react";
import AnalyticsPageClient from "./AnalyticsPageClient";

export default function AnalyticsPagePage() {
  return (
    <Suspense>
      <AnalyticsPageClient />
    </Suspense>
  );
}
