import { Suspense } from "react";
import FavoritesPageClient from "./FavoritesPageClient";

export default function FavoritesPagePage() {
  return (
    <Suspense>
      <FavoritesPageClient />
    </Suspense>
  );
}
