import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createClient(url, key);
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getServiceSupabase();
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile || !["admin", "agent"].includes((profile as Record<string, unknown>).role as string)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const status = req.nextUrl.searchParams.get("status") || "pending_review";

    const { data: verifications, error } = await supabase
      .from("merchant_verifications")
      .select("id, user_id, full_legal_name, nif_number, id_document_url, status, submitted_at, verified_at, admin_notes")
      .eq("status", status)
      .order("submitted_at", { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: "Failed to fetch verifications" }, { status: 500 });
    }

    return NextResponse.json({ verifications: verifications || [] });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getServiceSupabase();
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile || (profile as Record<string, unknown>).role !== "admin") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const { verificationId, newStatus, adminNotes } = await req.json();

    if (!verificationId || !["verified", "rejected"].includes(newStatus)) {
      return NextResponse.json({ error: "Invalid params" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {
      status: newStatus,
      admin_notes: adminNotes || null,
    };

    if (newStatus === "verified") {
      updateData.verified_at = new Date().toISOString();
    }

    const { data: verification, error: updateError } = await supabase
      .from("merchant_verifications")
      .update(updateData)
      .eq("id", verificationId)
      .select("user_id")
      .single();

    if (updateError || !verification) {
      return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }

    if (newStatus === "verified") {
      await supabase
        .from("profiles")
        .update({ verified: true } as never)
        .eq("id", verification.user_id);
    }

    return NextResponse.json({ success: true, status: newStatus });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
