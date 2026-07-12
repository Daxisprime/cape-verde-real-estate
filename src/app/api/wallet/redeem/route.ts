import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

    const { pinCode } = await req.json();

    if (!pinCode || typeof pinCode !== "string" || pinCode.length < 6) {
      return NextResponse.json({ error: "Codigo PIN invalido" }, { status: 400 });
    }

    const cleanPin = pinCode.replace(/\s|-/g, "").trim();

    const { data: voucher, error: fetchError } = await supabase
      .from("vouchers")
      .select("id, value_amount, is_redeemed")
      .eq("pin_code", cleanPin)
      .maybeSingle();

    if (fetchError || !voucher) {
      return NextResponse.json({ error: "Voucher nao encontrado. Verifique o codigo." }, { status: 404 });
    }

    if (voucher.is_redeemed) {
      return NextResponse.json({ error: "Este voucher ja foi utilizado." }, { status: 409 });
    }

    const { error: redeemError } = await supabase
      .from("vouchers")
      .update({
        is_redeemed: true,
        redeemed_by_user_id: user.id,
        redeemed_at: new Date().toISOString(),
      })
      .eq("id", voucher.id)
      .eq("is_redeemed", false);

    if (redeemError) {
      return NextResponse.json({ error: "Falha ao resgatar voucher. Tente novamente." }, { status: 500 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("wallet_balance")
      .eq("id", user.id)
      .maybeSingle();

    const currentBalance = parseFloat(profile?.wallet_balance ?? "0");
    const newBalance = currentBalance + parseFloat(voucher.value_amount);

    const { error: balanceError } = await supabase
      .from("profiles")
      .update({ wallet_balance: newBalance })
      .eq("id", user.id);

    if (balanceError) {
      await supabase
        .from("vouchers")
        .update({ is_redeemed: false, redeemed_by_user_id: null, redeemed_at: null })
        .eq("id", voucher.id);

      return NextResponse.json({ error: "Falha ao creditar saldo. Voucher nao foi consumido." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      credited: parseFloat(voucher.value_amount),
      newBalance,
      message: `${voucher.value_amount} CVE adicionados a sua carteira!`,
    });
  } catch {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
