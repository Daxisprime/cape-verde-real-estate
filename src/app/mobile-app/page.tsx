import { Suspense } from "react";
import MobileAppPageClient from "./MobileAppPageClient";

export default function MobileAppPagePage() {
  return (
    <Suspense>
      <MobileAppPageClient />
    </Suspense>
  );
}
