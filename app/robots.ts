import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/th/admin", "/en/admin", "/th/profile", "/en/profile", "/th/cart", "/en/cart"] }, sitemap: "https://santatechnology.com/" };
}
