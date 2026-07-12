import { SupabaseClient } from "@supabase/supabase-js";

interface ListingInfo {
  id: string;
  title: string;
  category: string;
  island?: string;
  image_url?: string;
  listing_type: "property" | "marketplace";
}

export async function generateSponsoredNotifications(
  supabase: SupabaseClient,
  listing: ListingInfo,
  sellerId: string
) {
  try {
    const { data: interestedUsers } = await supabase
      .from("favorites")
      .select("user_id")
      .neq("user_id", sellerId)
      .limit(50);

    const userIds: string[] = [];

    if (interestedUsers && interestedUsers.length > 0) {
      const ids = [...new Set(interestedUsers.map((u) => u.user_id as string))];
      userIds.push(...ids.slice(0, 20));
    }

    if (userIds.length === 0) return { sent: 0 };

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, notification_preferences")
      .in("id", userIds);

    const eligibleUsers = (profiles || []).filter((p) => {
      const prefs = (p.notification_preferences as Record<string, boolean>) || {};
      return prefs.sponsored !== false;
    });

    if (eligibleUsers.length === 0) return { sent: 0 };

    const locationLabel = listing.island ? ` em ${listing.island}` : "";
    const notifications = eligibleUsers.map((u) => ({
      user_id: u.id,
      type: "sponsored" as const,
      title: "Recomendacao para si!",
      content: `Veja este ${listing.title}${locationLabel}.`,
      image_url: listing.image_url || null,
      link_url: listing.listing_type === "property"
        ? `/property/${listing.id}`
        : `/marketplace?item=${listing.id}`,
      is_read: false,
    }));

    const { error } = await supabase.from("notifications").insert(notifications);

    if (error) {
      console.error("Smart-push insert error:", error.message);
      return { sent: 0 };
    }

    return { sent: notifications.length };
  } catch (err) {
    console.error("Smart-push error:", err);
    return { sent: 0 };
  }
}
