import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createClient(url, key);
}

const REVIEW_WINDOW_DAYS = 45;

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

    const { itemId, vendorId: directVendorId, rating, comment } = await req.json();

    if (!itemId && !directVendorId) {
      return NextResponse.json({ error: "ID do item ou vendedor necessario." }, { status: 400 });
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Avaliacao deve ser entre 1 e 5." }, { status: 400 });
    }

    let vendorId: string;
    let resolvedItemId: string | null = itemId || null;

    if (itemId) {
      // Item-level review: look up the item to get vendor_id
      const { data: item, error: itemError } = await supabase
        .from("marketplace_items")
        .select("id, user_id")
        .eq("id", itemId)
        .maybeSingle();

      if (itemError || !item) {
        return NextResponse.json({ error: "Item nao encontrado." }, { status: 404 });
      }
      vendorId = item.user_id;
    } else {
      // Vendor-level review from store page: find the most recent item from this vendor
      vendorId = directVendorId;
      const { data: latestItem } = await supabase
        .from("marketplace_items")
        .select("id")
        .eq("user_id", vendorId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!latestItem) {
        return NextResponse.json({ error: "Vendedor sem itens para avaliar." }, { status: 404 });
      }
      resolvedItemId = latestItem.id;
    }

    if (user.id === vendorId) {
      return NextResponse.json({ error: "Nao pode avaliar a si proprio." }, { status: 403 });
    }

    // 45-day window check: must have an inquiry on this item within the last 45 days
    const windowDate = new Date();
    windowDate.setDate(windowDate.getDate() - REVIEW_WINDOW_DAYS);

    const { data: inquiry } = await supabase
      .from("marketplace_inquiries")
      .select("id")
      .eq("item_id", resolvedItemId)
      .eq("email", user.email)
      .gte("created_at", windowDate.toISOString())
      .limit(1)
      .maybeSingle();

    if (!inquiry) {
      return NextResponse.json(
        { error: `Voce so pode avaliar itens sobre os quais fez uma consulta nos ultimos ${REVIEW_WINDOW_DAYS} dias.` },
        { status: 403 }
      );
    }

    // Upsert the review (one per buyer per item)
    const { data: review, error: insertError } = await supabase
      .from("item_reviews")
      .upsert(
        {
          item_id: resolvedItemId,
          reviewer_id: user.id,
          vendor_id: vendorId,
          rating,
          comment: comment || null,
        },
        { onConflict: "item_id,reviewer_id" }
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
    const itemId = req.nextUrl.searchParams.get("itemId");
    const vendorId = req.nextUrl.searchParams.get("vendorId");

    if (!itemId && !vendorId) {
      return NextResponse.json({ error: "itemId or vendorId required" }, { status: 400 });
    }

    let query = supabase
      .from("item_reviews")
      .select("id, item_id, rating, comment, vendor_reply, created_at, reviewer_id, vendor_id")
      .order("created_at", { ascending: false })
      .limit(50);

    if (itemId) {
      query = query.eq("item_id", itemId);
    } else if (vendorId) {
      query = query.eq("vendor_id", vendorId);
    }

    const { data: reviews, error } = await query;

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

export async function PATCH(req: NextRequest) {
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

    const { reviewId, vendorReply } = await req.json();

    if (!reviewId || typeof reviewId !== "string") {
      return NextResponse.json({ error: "ID da avaliacao invalido." }, { status: 400 });
    }

    if (typeof vendorReply !== "string" || vendorReply.trim().length === 0) {
      return NextResponse.json({ error: "Resposta nao pode estar vazia." }, { status: 400 });
    }

    // Verify the user is the vendor for this review
    const { data: review } = await supabase
      .from("item_reviews")
      .select("id, vendor_id")
      .eq("id", reviewId)
      .maybeSingle();

    if (!review) {
      return NextResponse.json({ error: "Avaliacao nao encontrada." }, { status: 404 });
    }

    if (review.vendor_id !== user.id) {
      return NextResponse.json({ error: "Apenas o vendedor pode responder." }, { status: 403 });
    }

    const { error: updateError } = await supabase
      .from("item_reviews")
      .update({ vendor_reply: vendorReply.trim() })
      .eq("id", reviewId);

    if (updateError) {
      return NextResponse.json({ error: "Falha ao guardar resposta." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
