import { Suspense } from "react";
import SubscriptionPageClient from "./SubscriptionPageClient";

export default function SubscriptionPagePage() {
  return (
    <Suspense>
      <SubscriptionPageClient />
    </Suspense>
  );
}
