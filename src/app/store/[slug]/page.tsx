export const dynamic = 'force-dynamic';

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase";
import StorePageClient from "./StorePageClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getStoreBySlug(slugParam: string) {
  const supabase = createSupabaseServerClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("stores")
    .select("id, owner_id, slug, title, description, logo_url, banner_url, store_location, category_focus")
    .eq("slug", slugParam)
    .maybeSingle();

  return data;
}

async function getProfile(slugParam: string) {
  const supabase = createSupabaseServerClient();
  if (!supabase) return null;

  const { data: bySlug } = await supabase
    .from("profiles")
    .select("*")
    .eq("slug", slugParam)
    .maybeSingle();

  if (bySlug) return bySlug;

  const { data: byId } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", slugParam)
    .maybeSingle();

  return byId;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const currentSlug = resolvedParams.slug;

  const store = await getStoreBySlug(currentSlug);
  if (store) {
    return {
      title: `${store.title} | Pro.CV`,
      description: store.description || `Visite a loja ${store.title} na plataforma Pro.CV`,
      openGraph: {
        title: `${store.title} | Pro.CV`,
        description: store.description || `Visite a loja ${store.title} na plataforma Pro.CV`,
        type: "profile",
        ...(store.logo_url && { images: [{ url: store.logo_url }] }),
      },
    };
  }

  const profile = await getProfile(currentSlug);

  if (!profile) {
    return {
      title: "Loja | Pro.CV",
      description: "Perfil de vendedor na plataforma Pro.CV",
    };
  }

  const memberDate = new Date(profile.created_at);
  const formattedDate = memberDate.toLocaleDateString("pt-CV", {
    month: "long",
    year: "numeric",
  });

  return {
    title: `${profile.name} \u25B7 Listings & Profile on Pro.CV`,
    description: `${profile.name} \u2713 Verified Member on Pro.CV \u2713 Member since ${formattedDate} \u2713 Browse all listings and connect via WhatsApp safely today!`,
    openGraph: {
      title: `${profile.name} \u25B7 Listings & Profile on Pro.CV`,
      description: `${profile.name} \u2713 Verified Member on Pro.CV \u2713 Member since ${formattedDate} \u2713 Browse all listings and connect via WhatsApp safely today!`,
      type: "profile",
      ...(profile.avatar && { images: [{ url: profile.avatar }] }),
    },
  };
}

export default async function StorePage({ params }: PageProps) {
  const resolvedParams = await params;
  const currentSlug = resolvedParams.slug;

  const store = await getStoreBySlug(currentSlug);
  if (store) {
    return <StorePageClient profileId={store.owner_id} slug={currentSlug} storeId={store.id} />;
  }

  const profile = await getProfile(currentSlug);
  if (profile) {
    return <StorePageClient profileId={profile.id} slug={currentSlug} storeId={null} />;
  }

  // Client-side mock hydration handles vendor-xxx and agent slugs;
  // pass null and let the client attempt mock lookup before showing 404
  return <StorePageClient profileId={null} slug={currentSlug} storeId={null} />;
}
