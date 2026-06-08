import { redirect } from "next/navigation";

export default function RentPage() {
  redirect("/map?type=rent");
}
