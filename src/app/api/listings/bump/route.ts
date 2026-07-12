import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateSponsoredNotifications } from "@/lib/smart-push";

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

    const { listingId, listingType, action } = await req.json();

    if (!listingId || !listingType || !action) {
      return NextResponse.json({ error: "Parametros em falta." }, { status: 400 });
    }

    if (!["bump", "feature"].includes(action)) {
      return NextResponse.json({ error: "Acao invalida." }, { status: 400 });
    }

    const table = listingType === "property" ? "properties" : "marketplace_items";
    const ownerCol = listingType === "property" ? "agent_id" : "user_id";

    // Verify ownership
    const { data: listing } = await supabase
      .from(table)
      .select(`id, title, category, island, images, ${ownerCol}`)
      .eq("id", listingId)
      .maybeSingle();

    if (!listing) {
      return NextResponse.json({ error: "Anuncio nao encontrado." }, { status: 404 });
    }

    const ownerId = (listing as Record<string, unknown>)[ownerCol] as string;
    if (ownerId !== user.id) {
      return NextResponse.json({ error: "Sem permissao para este anuncio." }, { status: 403 });
    }

    if (action === "bump") {
      const { error: updateError } = await supabase
        .from(table)
        .update({ last_bumped_at: new Date().toISOString() } as never)
        .eq("id", listingId);

      if (updateError) {
        return NextResponse.json({ error: "Falha ao impulsionar." }, { status: 500 });
      }

      // Smart-Push on bump too
      const listingRecord = listing as Record<string, unknown>;
      const images = listingRecord.images as string[] | null;
      generateSponsoredNotifications(supabase, {
        id: listingId,
        title: (listingRecord.title as string) || "Novo anuncio",
        category: (listingRecord.category as string) || "",
        island: (listingRecord.island as string) || undefined,
        image_url: images?.[0] || undefined,
        listing_type: listingType as "property" | "marketplace",
      }, user.id).catch(() => {});

      return NextResponse.json({ success: true, message: "Anuncio impulsionado com sucesso!" });
    }

    if (action === "feature") {
      const featuredUntil = new Date();
      featuredUntil.setDate(featuredUntil.getDate() + 7);

      const { error: updateError } = await supabase
        .from(table)
        .update({
          is_featured: true,
          featured_until: featuredUntil.toISOString(),
          last_bumped_at: new Date().toISOString(),
        } as never)
        .eq("id", listingId);

      if (updateError) {
        return NextResponse.json({ error: "Falha ao destacar." }, { status: 500 });
      }

      // Smart-Push: send sponsored notifications to high-intent users
      const listingRecord = listing as Record<string, unknown>;
      const images = listingRecord.images as string[] | null;
      generateSponsoredNotifications(supabase, {
        id: listingId,
        title: (listingRecord.title as string) || "Novo anuncio",
        category: (listingRecord.category as string) || "",
        island: (listingRecord.island as string) || undefined,
        image_url: images?.[0] || undefined,
        listing_type: listingType as "property" | "marketplace",
      }, user.id).catch(() => {});

      return NextResponse.json({
        success: true,
        message: "Anuncio destacado por 7 dias!",
        featuredUntil: featuredUntil.toISOString(),
      });
    }

    return NextResponse.json({ error: "Acao desconhecida." }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
