import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateDigitalVoucher } from "@/lib/voucher-generation";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: "Configuracao do servidor em falta" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Sessao invalida" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const userRole = (profile as Record<string, unknown>)?.role as string;
    if (!userRole || !["admin", "agent"].includes(userRole)) {
      return NextResponse.json({ error: "Acesso restrito a agentes e administradores." }, { status: 403 });
    }

    const body = await req.json();
    const { contact, amount, deliveryMethod, customerName } = body;

    if (!contact || typeof contact !== "string" || contact.length < 5) {
      return NextResponse.json({ error: "Contacto do cliente invalido." }, { status: 400 });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0 || numAmount > 100000) {
      return NextResponse.json({ error: "Valor invalido. Min: 1 CVE, Max: 100.000 CVE." }, { status: 400 });
    }

    const method: "email" | "sms" = deliveryMethod === "email" ? "email" : "sms";

    const result = await generateDigitalVoucher(user.id, numAmount, method, contact);

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Falha na geracao do voucher." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      pin: result.pin,
      voucherId: result.voucherId,
      deliveredVia: method,
      contact,
      customerName: customerName || null,
      amount: numAmount,
      issuedBy: user.id,
      warning: result.error || null,
    });
  } catch {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
