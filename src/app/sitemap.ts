import { MetadataRoute } from "next";
import { capeVerdeProperties } from "@/data/cape-verde-properties";
import { slugify } from "@/lib/slugify";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://pro.cv";

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/marketplace`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/map`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/calculators`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/safety`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/auth`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/advice`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  const propertyPages: MetadataRoute.Sitemap = capeVerdeProperties
    .filter((p) => p.status === "active" || !p.status)
    .map((property) => ({
      url: `${baseUrl}/property/${property.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  const listingSlugPages: MetadataRoute.Sitemap = capeVerdeProperties
    .filter((p) => p.status === "active" || !p.status)
    .map((property) => ({
      url: `${baseUrl}/listings/${slugify(property.title)}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  return [...staticPages, ...propertyPages, ...listingSlugPages];
}
