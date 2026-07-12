import { createSupabaseBrowserClient } from "@/lib/supabase";

export type CategoryTier = "casual" | "high_value" | "high_margin";

const CASUAL_CATEGORIES = ["Fashion", "Home & Furniture", "Home Decor", "Books", "Food & Restaurants", "Services", "Building Materials"];
const HIGH_VALUE_CATEGORIES = ["Electronics", "Smartphones", "Laptops"];
const HIGH_MARGIN_CATEGORIES = ["Vehicles", "Cars", "Apartment", "House", "Villa", "Land", "Duplex", "Studio", "Penthouse", "Townhouse"];

const LIMITS: Record<CategoryTier, number> = {
  casual: 10,
  high_value: 3,
  high_margin: 1,
};

export function getCategoryTier(category: string): CategoryTier {
  if (HIGH_MARGIN_CATEGORIES.includes(category)) return "high_margin";
  if (HIGH_VALUE_CATEGORIES.includes(category)) return "high_value";
  return "casual";
}

export function getCategoryLimit(category: string): number {
  return LIMITS[getCategoryTier(category)];
}

export async function getActiveListingCount(userId: string, category: string): Promise<number> {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return 0;

  const tier = getCategoryTier(category);
  const categoriesInTier = tier === "casual"
    ? CASUAL_CATEGORIES
    : tier === "high_value"
      ? HIGH_VALUE_CATEGORIES
      : HIGH_MARGIN_CATEGORIES;

  const isProperty = HIGH_MARGIN_CATEGORIES.includes(category) &&
    !["Vehicles", "Cars"].includes(category);

  let count = 0;

  if (isProperty) {
    const { count: propCount, error } = await supabase
      .from("properties")
      .select("*", { count: "exact", head: true })
      .eq("agent_id", userId)
      .eq("status", "active");
    if (!error && propCount !== null) count = propCount;
  } else {
    const { count: itemCount, error } = await supabase
      .from("marketplace_items")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "active")
      .in("category", categoriesInTier);
    if (!error && itemCount !== null) count = itemCount;
  }

  return count;
}

export async function checkListingLimit(
  userId: string,
  category: string,
  paywallActive: boolean
): Promise<{ allowed: boolean; current: number; limit: number }> {
  const limit = getCategoryLimit(category);
  const current = await getActiveListingCount(userId, category);

  if (!paywallActive) {
    return { allowed: true, current, limit };
  }

  return { allowed: current < limit, current, limit };
}
