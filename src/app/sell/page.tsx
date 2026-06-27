import { Suspense } from "react";
import SellPageClient from "./SellPageClient";

export default function SellPage() {
  return (
    <Suspense>
      <SellPageClient />
    </Suspense>
  );
}
