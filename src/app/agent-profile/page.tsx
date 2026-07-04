import { Suspense } from "react";
import AgentProfilePageClient from "./AgentProfilePageClient";

export default function AgentProfilePagePage() {
  return (
    <Suspense>
      <AgentProfilePageClient />
    </Suspense>
  );
}
