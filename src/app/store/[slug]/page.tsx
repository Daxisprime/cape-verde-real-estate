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

  // Single flexible query across all identifier columns
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .or(`slug.eq.${slugParam},id.eq.${slugParam},facebook_handle.eq.${slugParam},name.eq.${slugParam}`)
    .maybeSingle();

  if (error || !profile) return null;
  return profile;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getProfile(slug);

  if (!profile) {
    return {
      title: "Loja Nao Encontrada | Pro.CV",
      description: "Esta loja nao foi encontrada na plataforma Pro.CV",
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
  const { slug } = await params;
  const profile = await getProfile(slug);

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Loja Nao Encontrada</h1>
          <p className="text-gray-500">Este perfil de vendedor nao existe na nossa plataforma.</p>
        </div>
      </div>
    );
  }

  return <StorePageClient profileId={profile.id} slug={slug} />;
}
