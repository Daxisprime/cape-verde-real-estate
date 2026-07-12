import { Suspense } from "react";
import AgentPanelClient from "./AgentPanelClient";

export default function AgentPanelPage() {
  return (
    <Suspense>
      <AgentPanelClient />
    </Suspense>
  );
}
