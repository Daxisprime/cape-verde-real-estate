import { Suspense } from "react";
import TestPageClient from "./TestPageClient";

export default function TestPagePage() {
  return (
    <Suspense>
      <TestPageClient />
    </Suspense>
  );
}
