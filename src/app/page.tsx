import { Suspense } from "react";
import MarketplaceClient from "@/app/marketplace/MarketplaceClient";

export default function HomePage() {
  return (
    <Suspense>
      <MarketplaceClient isHomepage />
    </Suspense>
  );
}
