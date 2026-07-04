import { Suspense } from "react";
import DashboardPageClient from "./DashboardPageClient";

export default function DashboardPagePage() {
  return (
    <Suspense>
      <DashboardPageClient />
    </Suspense>
  );
}
