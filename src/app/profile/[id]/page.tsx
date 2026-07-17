import { Suspense } from "react";
import VendorProfilePageClient from "./VendorProfilePageClient";

export const dynamic = "force-dynamic";

export default async function VendorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <Suspense>
      <VendorProfilePageClient id={id} />
    </Suspense>
  );
}
