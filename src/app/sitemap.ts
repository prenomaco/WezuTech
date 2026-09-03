import type { MetadataRoute } from "next";
import { getPublishedProducts } from "@/lib/catalog";
import { siteUrl } from "@/lib/env";

/**
 * The sitemap follows what is actually published: the static pages plus a URL
 * for every product the catalogue is serving, so a product added in the
 * dashboard is discoverable without a deploy. Priorities rank the pages a
 * visitor is looking for above the legal ones rather than leaving them equal.
 */
const STATIC_PAGES = [
  { path: "", priority: 1, changeFrequency: "weekly" },
  { path: "/about", priority: 0.8, changeFrequency: "monthly" },
  { path: "/privacy-policy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/terms-of-service", priority: 0.2, changeFrequency: "yearly" },
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const pages: MetadataRoute.Sitemap = STATIC_PAGES.map((page) => ({
    url: `${siteUrl}${page.path}`,
    lastModified,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  /* A database that is unreachable at build time should cost the site its
     product URLs, not its sitemap. */
  try {
    const products = await getPublishedProducts();
    for (const product of products) {
      pages.push({
        url: `${siteUrl}/products/${product.slug}`,
        lastModified,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  } catch {
    /* Static pages still ship. */
  }

  return pages;
}
