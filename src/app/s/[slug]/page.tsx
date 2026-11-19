import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import StorefrontClient from './StorefrontClient';
import { ZapShop, ZapProduct, getDemoShop, getDemoProducts, isDemoSlug } from '@/lib/zappro';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function StorefrontPage({ params }: PageProps) {
  const { slug } = await params;

  // Demo routes: in-memory, no DB hit.
  if (isDemoSlug(slug)) {
    const shop = getDemoShop(slug)!;
    const products = getDemoProducts(slug);
    return <StorefrontClient shop={shop} products={products} isDemo />;
  }

  // Real store: read from zappro_shops by slug.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  let shop: ZapShop | null = null;
  let products: ZapProduct[] = [];

  if (url && anonKey) {
    const client = createClient(url, anonKey, { auth: { persistSession: false } });
    const { data: shopRow } = await client
      .from('zappro_shops')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    if (shopRow) {
      shop = shopRow as ZapShop;
      const { data: productRows } = await client
        .from('zappro_products')
        .select('*')
        .eq('shop_id', shop.id)
        .eq('in_stock', true)
        .order('created_at', { ascending: false });
      products = (productRows as ZapProduct[]) || [];
    }
  }

  if (!shop) notFound();
  return <StorefrontClient shop={shop!} products={products} isDemo={false} />;
}
