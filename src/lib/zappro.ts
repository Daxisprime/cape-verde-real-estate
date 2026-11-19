import { createClient } from '@supabase/supabase-js';

export type StoreType = 'retail' | 'showcase';

export interface ProductOption {
  name: string;
  choices: string[];
}

export interface DeliveryZone {
  zone: string;
  fee: number;
}

export interface ZapShop {
  id: string;
  slug: string;
  name: string;
  whatsapp_number: string;
  store_type: StoreType;
  logo_url: string | null;
  banner_url: string | null;
  currency: string;
  description: string | null;
  delivery_zones: DeliveryZone[];
}

export interface ZapProduct {
  id: string;
  title: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  options: ProductOption[];
}

export interface SelectedOption {
  name: string;
  choice: string;
  priceDelta: number;
}

export interface CartItem {
  key: string;
  productId: string;
  title: string;
  qty: number;
  selectedOptions: SelectedOption[];
  unitPrice: number;
}

export const PAYMENT_METHODS = ['Cash', 'Vinti4 / POS', 'Bank Transfer / Mobile Money'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const ZAPPRO_SIGNATURE = '\n\n⚡ _Storefront powered by ZapPro_';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let client: ReturnType<typeof createClient> | null = null;

export function zapproClient() {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  if (!client) {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        storageKey: 'zappro-auth-token',
      },
      global: { headers: { 'X-Client-Info': 'zappro-web' } },
    });
  }
  return client;
}

// ---------- Defensive parsing of rows from zappro_shops / zappro_products ----------

type Row = Record<string, unknown>;

function asArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function str(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function num(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function parseOptions(value: unknown): ProductOption[] {
  return asArray(value)
    .map((o) => {
      const row = (o ?? {}) as Row;
      const name = str(row.name);
      const choices = asArray(row.choices)
        .map((c) => (typeof c === 'string' ? c.trim() : typeof c === 'number' ? String(c) : ''))
        .filter(Boolean);
      return name && choices.length ? { name, choices } : null;
    })
    .filter((o): o is ProductOption => o !== null);
}

export function parseZones(value: unknown): DeliveryZone[] {
  return asArray(value)
    .map((z) => {
      const row = (z ?? {}) as Row;
      const zone = str(row.zone) ?? str(row.name);
      return zone ? { zone, fee: Math.max(0, num(row.fee)) } : null;
    })
    .filter((z): z is DeliveryZone => z !== null);
}

export function parseShop(row: Row): ZapShop {
  return {
    id: String(row.id),
    slug: String(row.slug ?? ''),
    name: str(row.name) ?? 'Store',
    whatsapp_number: String(row.whatsapp_number ?? ''),
    store_type: row.store_type === 'showcase' ? 'showcase' : 'retail',
    logo_url: str(row.logo_url),
    banner_url: str(row.banner_url),
    currency: str(row.currency) ?? 'CVE',
    description: str(row.description),
    delivery_zones: parseZones(row.delivery_zones),
  };
}

export function parseProduct(row: Row): ZapProduct {
  return {
    id: String(row.id),
    title: str(row.title) ?? str(row.name) ?? 'Untitled',
    description: str(row.description),
    price: num(row.price),
    image_url: str(row.image_url),
    category: str(row.category),
    options: parseOptions(row.options),
  };
}

export function isProductActive(row: Row): boolean {
  return row.is_active !== false && row.in_stock !== false && row.active !== false;
}

/** Reads a price hint like "Spicy Sauce (+100)" from a choice label. */
export function choicePriceDelta(choice: string): number {
  const match = choice.match(/\(\s*\+\s*([\d.,]+)\s*\)/);
  return match ? num(match[1].replace(/,/g, '')) : 0;
}

export function choiceLabel(choice: string): string {
  return choice.replace(/\(\s*\+\s*[\d.,]+\s*\)/, '').trim() || choice;
}

// ---------- Formatting ----------

export function formatPrice(amount: number, currency: string): string {
  return `${Math.round(amount).toLocaleString('pt-PT')} ${currency}`;
}

export function cleanWhatsAppNumber(raw: string): string {
  return raw.replace(/\D/g, '');
}

export function buildWhatsAppUrl(number: string, message: string): string {
  return `https://wa.me/${cleanWhatsAppNumber(number)}?text=${encodeURIComponent(message)}`;
}

export function orderCodeFromId(id: string): string {
  return id.replace(/-/g, '').slice(0, 6).toUpperCase();
}

// ---------- Receipts ----------

interface OrderReceipt {
  shop: ZapShop;
  code: string | null;
  items: CartItem[];
  customerName: string;
  customerPhone: string;
  zone: DeliveryZone | null;
  landmark: string;
  payment: PaymentMethod;
  subtotal: number;
  total: number;
}

export function buildOrderMessage(r: OrderReceipt): string {
  const c = r.shop.currency;
  const lines = r.items.map((i) => {
    const opts = i.selectedOptions.map((o) => `   - ${o.name}: ${o.choice}`).join('\n');
    return `• ${i.qty}x ${i.title} — ${formatPrice(i.unitPrice * i.qty, c)}${opts ? `\n${opts}` : ''}`;
  });
  const parts = [
    `🛒 *NEW ORDER${r.code ? ` #${r.code}` : ''}*`,
    `*${r.shop.name}*`,
    '',
    '*Items*',
    ...lines,
    '',
    `Subtotal: ${formatPrice(r.subtotal, c)}`,
  ];
  if (r.zone) parts.push(`Delivery (${r.zone.zone}): ${formatPrice(r.zone.fee, c)}`);
  parts.push(`*TOTAL: ${formatPrice(r.total, c)}*`, '', `👤 *Name:* ${r.customerName}`);
  if (r.customerPhone) parts.push(`📞 *Phone:* ${r.customerPhone}`);
  if (r.zone) parts.push(`📍 *Zone:* ${r.zone.zone}`);
  if (r.landmark) parts.push(`🏠 *Landmark:* ${r.landmark}`);
  parts.push(`💳 *Payment:* ${r.payment}`);
  return parts.join('\n') + ZAPPRO_SIGNATURE;
}

interface InquiryReceipt {
  shop: ZapShop;
  code: string | null;
  product: ZapProduct;
  customerName: string;
  customerPhone: string;
  message: string;
}

export function buildInquiryMessage(r: InquiryReceipt): string {
  const parts = [
    `📩 *NEW INQUIRY${r.code ? ` #${r.code}` : ''}*`,
    `*${r.shop.name}*`,
    '',
    `*Listing:* ${r.product.title}`,
    `*Price:* ${formatPrice(r.product.price, r.shop.currency)}`,
    '',
    `👤 *Name:* ${r.customerName}`,
    `📞 *Phone:* ${r.customerPhone}`,
  ];
  if (r.message) parts.push(`🗓️ *Viewing / Question:* ${r.message}`);
  return parts.join('\n') + ZAPPRO_SIGNATURE;
}

// ---------- Saving orders ----------

/**
 * Saves the order and returns a short order code, or null if it could not be saved.
 * A failed save never blocks the WhatsApp hand-off so the merchant still receives the order.
 */
export async function saveOrder(payload: Row): Promise<string | null> {
  const db = zapproClient();
  if (!db) return null;
  const { data, error } = await db
    .from('zappro_orders')
    .insert(payload as never)
    .select('id')
    .maybeSingle();
  const row = data as { id?: string } | null;
  if (error || !row?.id) {
    console.error('ZapPro: could not save order', error?.message);
    return null;
  }
  return orderCodeFromId(String(row.id));
}

/**
 * Opens a blank tab synchronously (so mobile browsers don't block it as a popup),
 * then points it at WhatsApp once the async save has finished.
 */
export function openPendingTab(): Window | null {
  return typeof window !== 'undefined' ? window.open('', '_blank') : null;
}

export function sendToWhatsApp(tab: Window | null, url: string) {
  if (tab && !tab.closed) tab.location.href = url;
  else window.location.href = url;
}
