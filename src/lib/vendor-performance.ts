export async function trackStoreLead(storeUserId: string, action: "chat_open" | "whatsapp_click" | "phone_view") {
  try {
    await fetch("/api/leads/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeUserId, action }),
    });
  } catch {
    // Non-critical - silently fail
  }
}

export function incrementLeadsDirect(vendorId: string) {
  trackStoreLead(vendorId, "whatsapp_click");
}

