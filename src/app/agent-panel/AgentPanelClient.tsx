"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import {
  Ticket,
  Send,
  Mail,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Copy,
  ArrowLeft,
} from "lucide-react";

interface IssuedVoucher {
  pin: string;
  amount: number;
  contact: string;
  method: string;
  timestamp: string;
}

export default function AgentPanelClient() {
  const { user } = useSupabaseAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [contact, setContact] = useState("");
  const [amount, setAmount] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<"sms" | "email">("sms");
  const [issuing, setIssuing] = useState(false);
  const [lastIssued, setLastIssued] = useState<IssuedVoucher | null>(null);
  const [history, setHistory] = useState<IssuedVoucher[]>([]);

  useEffect(() => {
    async function checkRole() {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      const supabase = createSupabaseBrowserClient();
      if (!supabase) { setLoading(false); return; }

      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      const role = (data as Record<string, unknown>)?.role as string;
      if (role === "admin" || role === "agent") {
        setAuthorized(true);
      }
      setLoading(false);
    }
    checkRole();
  }, [user?.id]);

  const detectDeliveryMethod = (value: string) => {
    if (value.includes("@")) {
      setDeliveryMethod("email");
    } else {
      setDeliveryMethod("sms");
    }
    setContact(value);
  };

  const handleIssueVoucher = async () => {
    if (!contact || !amount || !user?.id) return;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({ title: "Erro", description: "Valor invalido.", variant: "destructive" });
      return;
    }

    setIssuing(true);
    const supabase = createSupabaseBrowserClient();
    const session = supabase ? await supabase.auth.getSession() : null;
    const token = session?.data?.session?.access_token || "";

    try {
      const response = await fetch("/api/vouchers/issue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ contact, amount: numAmount, deliveryMethod }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({ title: "Erro", description: data.error || "Falha ao emitir voucher.", variant: "destructive" });
        setIssuing(false);
        return;
      }

      const issued: IssuedVoucher = {
        pin: data.pin,
        amount: numAmount,
        contact,
        method: deliveryMethod,
        timestamp: new Date().toISOString(),
      };

      setLastIssued(issued);
      setHistory((prev) => [issued, ...prev]);
      setContact("");
      setAmount("");

      toast({
        title: "Voucher Emitido!",
        description: `PIN: ${data.pin} | ${numAmount} CVE enviado via ${deliveryMethod === "email" ? "email" : "SMS"}.`,
      });
    } catch {
      toast({ title: "Erro", description: "Erro de rede. Tente novamente.", variant: "destructive" });
    }

    setIssuing(false);
  };

  const copyPin = (pin: string) => {
    navigator.clipboard.writeText(pin);
    toast({ title: "Copiado!", description: "PIN copiado para a area de transferencia." });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-pulse text-gray-400">A verificar acesso...</div>
        </div>
      </div>
    );
  }

  if (!user || !authorized) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-md mx-auto mt-20 p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-900 mb-2">Acesso Restrito</h2>
          <p className="text-sm text-gray-600 mb-4">
            Este painel e exclusivo para agentes e administradores da plataforma.
          </p>
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-lg mx-auto px-4 pt-8 pb-20">
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Ticket className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Painel de Agente</h1>
            <p className="text-xs text-gray-500">Emitir vouchers digitais para clientes</p>
          </div>
        </div>

        {/* Issuance Form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Emitir Novo Voucher</h2>

          <div className="space-y-4">
            {/* Contact Input */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Contacto do Cliente (Telefone ou Email)
              </label>
              <div className="relative">
                {deliveryMethod === "email" ? (
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                ) : (
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                )}
                <input
                  type="text"
                  placeholder="Ex: 9XXXXXX ou email@exemplo.com"
                  value={contact}
                  onChange={(e) => detectDeliveryMethod(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none"
                />
              </div>
              <p className="mt-1 text-[11px] text-gray-400">
                Detetado automaticamente: <span className="font-medium text-gray-600">{deliveryMethod === "email" ? "Email" : "SMS"}</span>
              </p>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Valor Recebido (CVE)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">CVE</span>
                <input
                  type="number"
                  min="100"
                  step="100"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-14 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none"
                />
              </div>
              <div className="flex gap-2 mt-2">
                {[500, 1000, 2000, 5000].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setAmount(String(preset))}
                    className="px-2.5 py-1 text-[11px] font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleIssueVoucher}
              disabled={!contact || !amount || issuing}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-500/20"
            >
              {issuing ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {issuing ? "A emitir..." : "Emitir Voucher"}
            </button>
          </div>
        </div>

        {/* Last Issued Success Card */}
        {lastIssued && (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5 mb-5">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-bold text-emerald-900 mb-1">Voucher Emitido com Sucesso</h3>
                <p className="text-xs text-emerald-700 mb-3">
                  Enviado para {lastIssued.contact} via {lastIssued.method === "email" ? "email" : "SMS"}
                </p>
                <div className="bg-white/80 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-gray-500 uppercase tracking-wider">PIN</div>
                    <div className="font-mono text-lg font-bold text-gray-900">{lastIssued.pin}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-gray-500 uppercase tracking-wider">Valor</div>
                    <div className="text-lg font-bold text-emerald-700">{lastIssued.amount} CVE</div>
                  </div>
                  <button
                    onClick={() => copyPin(lastIssued.pin)}
                    className="ml-2 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Issuance History */}
        {history.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Vouchers Emitidos Hoje</h3>
            <div className="space-y-2.5">
              {history.slice(0, 10).map((v, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs ${v.method === "email" ? "bg-blue-500" : "bg-green-500"}`}>
                      {v.method === "email" ? <Mail className="h-3.5 w-3.5" /> : <Smartphone className="h-3.5 w-3.5" />}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-900">{v.contact}</div>
                      <div className="text-[11px] text-gray-400 font-mono">{v.pin}</div>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-gray-700">{v.amount} CVE</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
