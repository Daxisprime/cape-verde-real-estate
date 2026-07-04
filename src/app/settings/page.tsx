import { Suspense } from "react";
import SettingsPageClient from "./SettingsPageClient";

export default function SettingsPagePage() {
  return (
    <Suspense>
      <SettingsPageClient />
    </Suspense>
  );
}
