"use client";

import React, { useEffect, useState, useCallback } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import Header from "@/components/Header";
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Megaphone,
  MessageCircle,
  Settings,
  Sparkles,
  Loader2,
  Calendar,
  Trash2,
} from "lucide-react";

interface Notification {
  id: string;
  type: "system" | "chat" | "recommendation" | "sponsored";
  title: string;
  content: string | null;
  image_url: string | null;
  link_url: string | null;
  is_read: boolean;
  created_at: string;
}

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  system: { icon: Settings, color: "bg-gray-100 text-gray-600", label: "Sistema" },
  chat: { icon: MessageCircle, color: "bg-blue-100 text-blue-600", label: "Mensagem" },
  recommendation: { icon: Sparkles, color: "bg-amber-100 text-amber-600", label: "Recomendacao" },
  sponsored: { icon: Megaphone, color: "bg-emerald-100 text-emerald-700", label: "Patrocinado" },
};

export default function NotificationsPageClient() {
  const { user, profile } = useSupabaseAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const fetchNotifications = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    const supabase = createSupabaseBrowserClient();
    if (!supabase) { setLoading(false); return; }

    let query = supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100);

    if (filter !== "all") {
      query = query.eq("type", filter);
    }

    const { data } = await query;
    setNotifications((data as Notification[]) || []);
    setLoading(false);
  }, [user, filter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Real-time subscription
  useEffect(() => {
    if (!user) return;
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    const channel = supabase
      .channel("notifications_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const markAsRead = async (id: string) => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    if (!user) return;
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const deleteNotification = async (id: string) => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.from("notifications").delete().eq("id", id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const memberSince = profile?.created_at
    ? new Date(profile.created_at as string).toLocaleDateString("pt-CV", { month: "long", year: "numeric" })
    : "";

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("pt-CV", { day: "2-digit", month: "2-digit" });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <BellOff className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-700">Inicie sessao para ver notificacoes</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        <div className="lg:grid lg:grid-cols-4 lg:gap-6">
          {/* Left Sidebar - Profile Summary */}
          <aside className="lg:col-span-1 mb-6 lg:mb-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-24">
              <div className="text-center">
                {profile?.avatar ? (
                  <img
                    src={profile.avatar as string}
                    alt="Avatar"
                    className="w-16 h-16 rounded-full object-cover mx-auto border-2 border-gray-100"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white text-xl font-bold mx-auto">
                    {(profile?.name as string)?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                )}
                <h3 className="mt-3 text-sm font-bold text-gray-900">{(profile?.name as string) || "Utilizador"}</h3>
                <p className="text-xs text-gray-500 flex items-center justify-center gap-1 mt-1">
                  <Calendar className="w-3 h-3" /> {memberSince}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Total</span>
                  <span className="font-semibold text-gray-700">{notifications.length}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Nao lidas</span>
                  <span className="font-semibold text-red-600">{unreadCount}</span>
                </div>
              </div>

              {/* Filter tabs */}
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-1.5">
                {[
                  { key: "all", label: "Todas" },
                  { key: "system", label: "Sistema" },
                  { key: "chat", label: "Mensagens" },
                  { key: "recommendation", label: "Sugestoes" },
                  { key: "sponsored", label: "Patrocinado" },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={`w-full text-left text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                      filter === f.key
                        ? "bg-teal-50 text-teal-700"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content - Notification List */}
          <section className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-gray-700" />
                <h1 className="text-lg font-bold text-gray-900">Notificacoes</h1>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1.5 text-xs font-medium text-teal-600 hover:text-teal-800 transition-colors"
                >
                  <CheckCheck className="w-4 h-4" />
                  Marcar todas como lidas
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <BellOff className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Sem notificacoes para mostrar.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notif) => {
                  const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.system;
                  const Icon = config.icon;

                  return (
                    <div
                      key={notif.id}
                      className={`bg-white rounded-xl border transition-all hover:shadow-sm ${
                        notif.is_read ? "border-gray-100" : "border-teal-200 bg-teal-50/30"
                      }`}
                    >
                      <div className="flex items-start gap-3 p-4">
                        {/* Image or Icon */}
                        {notif.image_url ? (
                          <div className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-gray-100">
                            <img
                              src={notif.image_url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${config.color}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className={`text-sm truncate ${notif.is_read ? "font-medium text-gray-700" : "font-bold text-gray-900"}`}>
                                {notif.title}
                              </p>
                              {notif.content && (
                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.content}</p>
                              )}
                            </div>
                            <span className="text-[10px] text-gray-400 whitespace-nowrap flex-shrink-0">
                              {formatDate(notif.created_at)}
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${config.color}`}>
                              <Icon className="w-3 h-3" />
                              {config.label}
                            </span>

                            {notif.link_url && (
                              <a
                                href={notif.link_url}
                                className="text-[10px] font-medium text-teal-600 hover:text-teal-800 transition-colors"
                              >
                                Ver mais
                              </a>
                            )}

                            {!notif.is_read && (
                              <button
                                onClick={() => markAsRead(notif.id)}
                                className="ml-auto flex items-center gap-1 text-[10px] font-medium text-gray-400 hover:text-teal-600 transition-colors"
                              >
                                <Check className="w-3 h-3" /> Lida
                              </button>
                            )}

                            <button
                              onClick={() => deleteNotification(notif.id)}
                              className="ml-auto text-gray-300 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
