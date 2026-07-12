import { createSupabaseBrowserClient } from "@/lib/supabase";

export interface WalletBalance {
  balance: number;
}

export async function getWalletBalance(userId: string): Promise<number> {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return 0;

  const { data } = await supabase
    .from("profiles")
    .select("wallet_balance")
    .eq("id", userId)
    .maybeSingle();

  return parseFloat((data as Record<string, unknown>)?.wallet_balance as string ?? "0");
}

export async function deductFromWallet(
  userId: string,
  amount: number
): Promise<{ success: boolean; newBalance: number }> {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { success: false, newBalance: 0 };

  const currentBalance = await getWalletBalance(userId);

  if (currentBalance < amount) {
    return { success: false, newBalance: currentBalance };
  }

  const newBalance = Math.round((currentBalance - amount) * 100) / 100;

  const { error } = await supabase
    .from("profiles")
    .update({ wallet_balance: newBalance } as never)
    .eq("id", userId);

  if (error) return { success: false, newBalance: currentBalance };

  return { success: true, newBalance };
}

export async function redeemVoucher(
  pinCode: string,
  accessToken: string
): Promise<{ success: boolean; credited?: number; newBalance?: number; error?: string }> {
  const response = await fetch("/api/wallet/redeem", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ pinCode }),
  });

  const data = await response.json();

  if (!response.ok) {
    return { success: false, error: data.error || "Erro desconhecido" };
  }

  return {
    success: true,
    credited: data.credited,
    newBalance: data.newBalance,
  };
}

export const FEATURE_PRICES = {
  AD_BUMP: 150,
  FEATURED_7_DAYS: 500,
  FEATURED_30_DAYS: 1500,
} as const;
