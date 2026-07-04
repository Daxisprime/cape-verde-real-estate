import { Suspense } from "react";
import MyStorePageClient from "./MyStorePageClient";

export default function MyStorePagePage() {
  return (
    <Suspense>
      <MyStorePageClient />
    </Suspense>
  );
}
