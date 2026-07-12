import { createSupabaseBrowserClient } from "@/lib/supabase";

const TRIAL_DURATION_DAYS = 60;
const TRIAL_LEAD_THRESHOLD = 15;

export async function trackLeadEvent(vendorId: string): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  if (!supabase || !vendorId) return;

  await supabase.rpc("increment_leads_count" as never, { vendor_id: vendorId } as never).then(({ error }) => {
    if (error) {
      supabase
        .from("profiles")
        .update({ accumulated_leads_count: 1 } as never)
        .eq("id", vendorId)
        .then(() => {});
    }
  });
}

export async function incrementLeadsDirect(vendorId: string): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  if (!supabase || !vendorId) return;

  const { data } = await supabase
    .from("profiles")
    .select("accumulated_leads_count")
    .eq("id", vendorId)
    .maybeSingle();

  const current = (data as Record<string, unknown>)?.accumulated_leads_count as number ?? 0;

  await supabase
    .from("profiles")
    .update({ accumulated_leads_count: current + 1 } as never)
    .eq("id", vendorId);
}

export interface TrialStatus {
  isExpired: boolean;
  daysRemaining: number;
  leadsCount: number;
  leadsThreshold: number;
}

export function checkTrialExpiry(createdAt: string, leadsCount: number): TrialStatus {
  const storeAge = Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  const daysRemaining = Math.max(0, TRIAL_DURATION_DAYS - storeAge);
  const isExpired = storeAge >= TRIAL_DURATION_DAYS && leadsCount >= TRIAL_LEAD_THRESHOLD;

  return {
    isExpired,
    daysRemaining,
    leadsCount,
    leadsThreshold: TRIAL_LEAD_THRESHOLD,
  };
}

export async function bumpListing(
  listingId: string,
  table: "properties" | "marketplace_items"
): Promise<boolean> {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return false;

  const { error } = await supabase
    .from(table)
    .update({ last_bumped_at: new Date().toISOString() } as never)
    .eq("id", listingId);

  return !error;
}
