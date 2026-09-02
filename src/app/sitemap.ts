import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return ["", "/privacy-policy", "/terms-of-service"].map((path) => ({ url: `${siteUrl}${path}`, lastModified: new Date() }));
}
