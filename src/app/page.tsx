import { Suspense } from "react";
import MarketplaceClient from "./marketplace/MarketplaceClient";

export default function HomePage() {
  return (
    <Suspense>
      <MarketplaceClient />
    </Suspense>
  );
}
