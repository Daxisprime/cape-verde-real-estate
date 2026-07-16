import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: "Server config missing" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { storeUserId, action } = body;

    if (!storeUserId || typeof storeUserId !== "string") {
      return NextResponse.json({ error: "storeUserId required" }, { status: 400 });
    }

    if (!action || !["chat_open", "whatsapp_click", "phone_view"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const { data: newCount, error } = await supabase.rpc("increment_store_leads", {
      store_user_id: storeUserId,
    });

    if (error) {
      return NextResponse.json({ error: "Failed to track lead" }, { status: 500 });
    }

    // Check if paywall should be activated
    const { data: profile } = await supabase
      .from("profiles")
      .select("created_at, accumulated_leads_count, paywall_active")
      .eq("id", storeUserId)
      .maybeSingle();

    if (profile && !profile.paywall_active) {
      const createdAt = new Date(profile.created_at);
      const daysSinceCreation = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
      const leads = profile.accumulated_leads_count || 0;

      if (daysSinceCreation > 60 && leads >= 15) {
        await supabase
          .from("profiles")
          .update({ paywall_active: true } as never)
          .eq("id", storeUserId);
      } else if (daysSinceCreation > 60 && leads < 15) {
        await supabase
          .from("profiles")
          .update({ trial_extended: true } as never)
          .eq("id", storeUserId);
      }
    }

    return NextResponse.json({ success: true, leads: newCount });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
