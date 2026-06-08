import { redirect } from "next/navigation";

export default function BuyPage() {
  redirect("/map?type=buy");
}
