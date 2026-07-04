import { Suspense } from "react";
import AdminDashboardClient from "./AdminDashboardClient";

export default function AdminDashboardPage() {
  return (
    <Suspense>
      <AdminDashboardClient />
    </Suspense>
  );
}
