import { createClient } from '@supabase/supabase-js';

// ---------- Types matching the existing zappro_* schema ----------

export interface DeliveryZone {
  id: string;
  name: string;
  fee: number;
}

export interface RetailOptionChoice {
  label: string;
  price_delta: number;
}
export interface RetailOption {
  name: string;
  choices: RetailOptionChoice[];
}
export interface ShowcaseSpec {
  label: string;
  value: string;
}

export interface ZapShop {
  id: string;
  owner_id: string;
  slug: string;
  name: string;
  whatsapp_number: string;
  store_type: 'retail' | 'showcase';
  logo_url: string | null;
  banner_url: string | null;
  currency: string;
  delivery_zones: DeliveryZone[] | null;
  sync_to_marketplace: boolean;
  plan_tier: 'free' | 'pro';
  monthly_order_count: number;
  created_at: string;
}

export interface ZapProduct {
  id: string;
  shop_id: string;
  title: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  options: RetailOption[] | ShowcaseSpec[] | null;
  in_stock: boolean;
  created_at: string;
}

export interface ZapOrderInsert {
  shop_id: string;
  order_type: 'order' | 'inquiry';
  customer_name: string;
  customer_phone: string | null;
  delivery_zone: string | null;
  delivery_fee: number;
  delivery_landmark: string | null;
  payment_method: string | null;
  items: unknown;
  subtotal: number;
  total: number;
  notes: string | null;
  status: 'new';
}

// ---------- Supabase client (ZapPro-scoped session) ----------

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let _client: ReturnType<typeof createClient> | null = null;

export function zapproClient() {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  if (_client) return _client;
  _client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: 'zappro-auth-token',
    },
    global: { headers: { 'X-Client-Info': 'zappro-web' } },
  });
  return _client;
}

// ---------- Currency formatting ----------

export function formatPrice(amount: number, currency: string): string {
  const rounded = Math.round(amount);
  const formatted = rounded.toLocaleString('en-US');
  return `${formatted} ${currency}`;
}

// ---------- WhatsApp helpers ----------

export function cleanWhatsAppNumber(raw: string): string {
  return raw.replace(/\D/g, '');
}

export function buildWhatsAppUrl(number: string, message: string): string {
  return `https://wa.me/${cleanWhatsAppNumber(number)}?text=${encodeURIComponent(message)}`;
}

export function orderCodeFromId(id: string): string {
  return id.replace(/-/g, '').slice(0, 6).toUpperCase();
}

// ---------- Cart item shape ----------

export interface CartItem {
  productId: string;
  title: string;
  basePrice: number;
  qty: number;
  selectedOptions: { name: string; choice: string; priceDelta: number }[];
  unitPrice: number;
  lineTotal: number;
}

export function computeUnitPrice(base: number, deltas: number[]): number {
  return base + deltas.reduce((a, b) => a + b, 0);
}

// ---------- Demo data ----------

export const DEMO_RETAIL_SLUG = 'demo-retail';
export const DEMO_SHOWCASE_SLUG = 'demo-showcase';

export const demoRetailShop: ZapShop = {
  id: 'demo-retail-shop',
  owner_id: 'demo',
  slug: DEMO_RETAIL_SLUG,
  name: 'Sabor da Terra',
  whatsapp_number: '238991234567',
  store_type: 'retail',
  logo_url: null,
  banner_url: null,
  currency: 'CVE',
  delivery_zones: [
    { id: 'z1', name: 'Achada Grande', fee: 200 },
    { id: 'z2', name: 'Fazenda', fee: 250 },
    { id: 'z3', name: 'Palmarejo', fee: 300 },
    { id: 'z4', name: 'Plateau', fee: 350 },
  ],
  sync_to_marketplace: true,
  plan_tier: 'pro',
  monthly_order_count: 0,
  created_at: new Date().toISOString(),
};

export const demoRetailProducts: ZapProduct[] = [
  {
    id: 'r1',
    shop_id: 'demo-retail-shop',
    title: 'Smash Duplo',
    description: 'Dois hambúrgres smash, cheddar, picles, molho da casa no pão brioche.',
    price: 950,
    image_url:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=70',
    category: 'Burgers',
    options: [
      {
        name: 'Extra',
        choices: [
          { label: 'Normal', price_delta: 0 },
          { label: 'Extra Cheese', price_delta: 150 },
          { label: 'Extra Bacon', price_delta: 200 },
        ],
      },
      {
        name: 'Spice',
        choices: [
          { label: 'Mild', price_delta: 0 },
          { label: 'Spicy', price_delta: 0 },
        ],
      },
    ],
    in_stock: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'r2',
    shop_id: 'demo-retail-shop',
    title: 'Frango Grelhado',
    description: 'Meio frango grelhado, batata frita e salada.',
    price: 850,
    image_url:
      'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=900&q=70',
    category: 'Pratos',
    options: [],
    in_stock: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'r3',
    shop_id: 'demo-retail-shop',
    title: 'Cachupa Quente',
    description: 'Cachupa tradicional caboverdiana, servida com linguiça e ovo.',
    price: 700,
    image_url:
      'https://images.unsplash.com/photo-1604908554007-3d69-1cb3a9d6dba3?auto=format&fit=crop&w=900&q=70',
    category: 'Pratos',
    options: [],
    in_stock: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'r4',
    shop_id: 'demo-retail-shop',
    title: 'Sumo Natural de Papaya',
    description: 'Sumo natural 350ml, sem açúcar adicionado.',
    price: 300,
    image_url:
      'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=900&q=70',
    category: 'Bebidas',
    options: [],
    in_stock: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'r5',
    shop_id: 'demo-retail-shop',
    title: 'Pastel com Queijo',
    description: 'Pastel frito recheado com queijo local. Unidade.',
    price: 120,
    image_url:
      'https://images.unsplash.com/photo-1505253716362-afaea1d3d1a0?auto=format&fit=crop&w=900&q=70',
    category: 'Snacks',
    options: [],
    in_stock: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'r6',
    shop_id: 'demo-retail-shop',
    title: 'Bifana no Pão',
    description: 'Bifana de porco marinada, mostarda e cebola caramelizada.',
    price: 480,
    image_url:
      'https://images.unsplash.com/photo-1521305916504-4a112358de2c?auto=format&fit=crop&w=900&q=70',
    category: 'Sandes',
    options: [
      {
        name: 'Bebida',
        choices: [
          { label: 'Sem bebida', price_delta: 0 },
          { label: 'Sumo +', price_delta: 200 },
          { label: 'Refrigerante +', price_delta: 150 },
        ],
      },
    ],
    in_stock: true,
    created_at: new Date().toISOString(),
  },
];

export const demoShowcaseShop: ZapShop = {
  id: 'demo-showcase-shop',
  owner_id: 'demo',
  slug: DEMO_SHOWCASE_SLUG,
  name: 'CV Motors & Imóveis',
  whatsapp_number: '238998765432',
  store_type: 'showcase',
  logo_url: null,
  banner_url: null,
  currency: 'CVE',
  delivery_zones: null,
  sync_to_marketplace: false,
  plan_tier: 'pro',
  monthly_order_count: 0,
  created_at: new Date().toISOString(),
};

export const demoShowcaseProducts: ZapProduct[] = [
  {
    id: 's1',
    shop_id: 'demo-showcase-shop',
    title: 'Toyota Hilux 2.4 Diesel 4x4',
    description:
      'Pick-up robusta, única dona, revisões na concessionária. Pneus novos, ar condicionado, câmara de marcha.',
    price: 4500000,
    image_url:
      'https://images.unsplash.com/photo-1605436855712-4e1e3d6c8e8e?auto=format&fit=crop&w=1200&q=70',
    category: 'Viaturas',
    options: [
      { label: 'Ano', value: '2022' },
      { label: 'Caixa', value: 'Manual' },
      { label: 'Combustível', value: 'Diesel' },
      { label: 'Km', value: '38.000' },
    ],
    in_stock: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 's2',
    shop_id: 'demo-showcase-shop',
    title: 'T2 Ocean View — Santa Maria',
    description:
      'Apartamento T2 a 200m da praia de Santa Maria, varanda com vista oceano, condomínio com piscina.',
    price: 18500000,
    image_url:
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=70',
    category: 'Imóveis',
    options: [
      { label: 'Tipologia', value: 'T2' },
      { label: 'Área', value: '92 m²' },
      { label: 'Vista', value: 'Oceano' },
      { label: 'Piso', value: '3º' },
    ],
    in_stock: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 's3',
    shop_id: 'demo-showcase-shop',
    title: 'Honda CG 160 Start',
    description: 'Mota nova, garantia de 2 anos, ideal para entregas e deslocações urbanas.',
    price: 320000,
    image_url:
      'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=70',
    category: 'Motas',
    options: [
      { label: 'Ano', value: '2024' },
      { label: 'Cilindrada', value: '160cc' },
      { label: 'Combustível', value: 'Gasolina' },
    ],
    in_stock: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 's4',
    shop_id: 'demo-showcase-shop',
    title: 'Armazém Industrial — Praia',
    description:
      'Armazém 280m² com escritório, portão de carga, zona industrial da Achada Grande. Ideal para logística.',
    price: 22000000,
    image_url:
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=70',
    category: 'Imóveis',
    options: [
      { label: 'Área', value: '280 m²' },
      { label: 'Tipo', value: 'Armazém' },
      { label: 'Portão', value: 'Carga' },
    ],
    in_stock: true,
    created_at: new Date().toISOString(),
  },
];

export function getDemoShop(slug: string): ZapShop | null {
  if (slug === DEMO_RETAIL_SLUG) return demoRetailShop;
  if (slug === DEMO_SHOWCASE_SLUG) return demoShowcaseShop;
  return null;
}

export function getDemoProducts(slug: string): ZapProduct[] {
  if (slug === DEMO_RETAIL_SLUG) return demoRetailProducts;
  if (slug === DEMO_SHOWCASE_SLUG) return demoShowcaseProducts;
  return [];
}

export function isDemoSlug(slug: string): boolean {
  return slug === DEMO_RETAIL_SLUG || slug === DEMO_SHOWCASE_SLUG;
}
