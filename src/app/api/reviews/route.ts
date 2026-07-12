import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
    }

    const supabase = getServiceSupabase();
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Sessao invalida" }, { status: 401 });
    }

    const { vendorId, rating, comment } = await req.json();

    if (!vendorId || typeof vendorId !== "string") {
      return NextResponse.json({ error: "ID do vendedor invalido." }, { status: 400 });
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Avaliacao deve ser entre 1 e 5." }, { status: 400 });
    }

    if (user.id === vendorId) {
      return NextResponse.json({ error: "Nao pode avaliar a si proprio." }, { status: 403 });
    }

    // Verify interaction history: check property_inquiries and marketplace_inquiries
    const { data: propInquiry } = await supabase
      .from("property_inquiries")
      .select("id")
      .eq("seller_id", vendorId)
      .eq("email", user.email)
      .limit(1)
      .maybeSingle();

    const { data: mktInquiry } = await supabase
      .from("marketplace_inquiries")
      .select("id")
      .eq("seller_id", vendorId)
      .limit(1)
      .maybeSingle();

    // Also check if reviewer has any inquiry by user_id match (for logged-in inquiries)
    const { data: propInquiryById } = await supabase
      .from("property_inquiries")
      .select("id")
      .eq("seller_id", vendorId)
      .limit(1)
      .maybeSingle();

    const hasInteraction = !!(propInquiry || mktInquiry || propInquiryById);

    if (!hasInteraction) {
      return NextResponse.json(
        { error: "Voce so pode avaliar vendedores com quem interagiu." },
        { status: 403 }
      );
    }

    // Insert the review
    const { data: review, error: insertError } = await supabase
      .from("vendor_reviews")
      .upsert(
        {
          vendor_id: vendorId,
          reviewer_id: user.id,
          rating,
          comment: comment || null,
        },
        { onConflict: "vendor_id,reviewer_id" }
      )
      .select("id, rating, comment, created_at")
      .single();

    if (insertError) {
      return NextResponse.json({ error: "Falha ao submeter avaliacao." }, { status: 500 });
    }

    return NextResponse.json({ success: true, review });
  } catch {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = getServiceSupabase();
    const vendorId = req.nextUrl.searchParams.get("vendorId");

    if (!vendorId) {
      return NextResponse.json({ error: "vendorId required" }, { status: 400 });
    }

    const { data: reviews, error } = await supabase
      .from("vendor_reviews")
      .select("id, rating, comment, created_at, reviewer_id")
      .eq("vendor_id", vendorId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: "Falha ao carregar avaliacoes." }, { status: 500 });
    }

    const ratings = (reviews || []).map((r) => r.rating);
    const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

    return NextResponse.json({
      reviews: reviews || [],
      averageRating: Math.round(avgRating * 10) / 10,
      totalCount: ratings.length,
    });
  } catch {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
