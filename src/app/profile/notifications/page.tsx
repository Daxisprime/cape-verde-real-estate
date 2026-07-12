import { Metadata } from "next";
import NotificationsPageClient from "./NotificationsPageClient";

export const metadata: Metadata = {
  title: "Notificacoes | Pro.CV",
  description: "Centro de notificacoes - Pro.CV",
};

export default function NotificationsPage() {
  return <NotificationsPageClient />;
}
