import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/th/admin", "/en/admin", "/th/profile", "/en/profile", "/th/cart", "/en/cart"] }, sitemap: new URL("/sitemap.xml", siteUrl).toString() };
}
