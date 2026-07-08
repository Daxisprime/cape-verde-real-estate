export const dynamic = 'force-dynamic';

import { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase";
import StorePageClient from "./StorePageClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getProfile(slugParam: string) {
  const supabase = createSupabaseServerClient();
  if (!supabase) return null;

  // Try by id first (most common - UUIDs for real users)
  const { data: byId } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", slugParam)
    .maybeSingle();

  if (byId) return byId;

  // Try by slug column (custom vanity URLs)
  const { data: bySlug } = await supabase
    .from("profiles")
    .select("*")
    .eq("slug", slugParam)
    .maybeSingle();

  if (bySlug) return bySlug;

  return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const currentSlug = resolvedParams.slug;
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
  const profile = await getProfile(currentSlug);

  return <StorePageClient profileId={profile?.id || null} slug={currentSlug} />;
}
