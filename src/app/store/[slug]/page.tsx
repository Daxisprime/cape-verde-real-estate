import { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase";
import StorePageClient from "./StorePageClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getProfile(slug: string) {
  const supabase = createSupabaseServerClient();
  if (!supabase) return null;

  // Try matching by slug first, then by user ID
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (profile) return profile;

  // Fallback: try matching by ID directly
  const { data: profileById } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", slug)
    .maybeSingle();

  return profileById;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getProfile(slug);

  if (!profile) {
    return {
      title: "Store Not Found | Pro.CV",
      description: "This store could not be found on Pro.CV",
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
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Store Not Found</h1>
          <p className="text-gray-500">This seller profile does not exist.</p>
        </div>
      </div>
    );
  }

  return <StorePageClient profileId={profile.id} slug={slug} />;
}
