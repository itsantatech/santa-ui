import type { MetadataRoute } from "next";
import { fetchAdminList } from "@/lib/admin-api";
import { siteUrl } from "@/lib/seo";

type SlugRow = { slug: string; updatedAt?: string; isActive: boolean };
const locales = ["th", "en"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, brands, articles, news] = await Promise.all([
    fetchAdminList<SlugRow>("/products", { isActive: true, page: 1, pageSize: 1000 }),
    fetchAdminList<SlugRow>("/categories", { isActive: true, page: 1, pageSize: 1000 }),
    fetchAdminList<SlugRow>("/brands", { isActive: true, page: 1, pageSize: 1000 }),
    fetchAdminList<SlugRow>("/articles", { isActive: true, page: 1, pageSize: 1000 }),
    fetchAdminList<SlugRow>("/news-and-activities", { isActive: true, page: 1, pageSize: 1000 }),
  ]);
  const staticPaths = ["", "/about-us", "/products", "/products/brands", "/articles", "/news-and-activities", "/faqs"];
  const rows = (response: { items: SlugRow[] } | null, prefix: string) => (response?.items ?? []).filter((item) => item.isActive).flatMap((item) => locales.map((locale) => ({ url: new URL(`/${locale}${prefix}/${item.slug}`, siteUrl).toString(), lastModified: item.updatedAt ? new Date(item.updatedAt) : undefined })));
  return [
    ...locales.flatMap((locale) => staticPaths.map((path) => ({ url: new URL(`/${locale}${path}`, siteUrl).toString() }))),
    ...rows(products, "/products"), ...rows(categories, "/products/categories"), ...rows(brands, "/products/brands"), ...rows(articles, "/articles"), ...rows(news, "/news-and-activities"),
  ];
}
