import { Suspense } from "react";
import MarketplaceClient from "./MarketplaceClient";

export default function MarketplacePage() {
  return (
    <Suspense>
      <MarketplaceClient />
    </Suspense>
  );
}
