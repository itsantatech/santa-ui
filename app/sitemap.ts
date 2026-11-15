import type { MetadataRoute } from "next";
import { fetchAdminList } from "@/lib/admin-api";
import { siteUrl } from "@/lib/seo";
import { localizedSlugPath } from "@/lib/paths";

type SlugRow = { slug: string; updatedAt?: string; isActive: boolean };
const locales = ["th", "en"] as const;
const sitemapPageSize = 1000;
const sitemapFetchBehavior = { next: { revalidate: 3600 } };

async function fetchAllActiveProducts(): Promise<{ items: SlugRow[] } | null> {
  const firstPage = await fetchAdminList<SlugRow>("/products/sitemap", {
    page: 1,
    pageSize: sitemapPageSize,
  }, sitemapFetchBehavior);

  if (!firstPage) {
    return null;
  }

  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.meta.totalPages - 1 }, (_, index) =>
      fetchAdminList<SlugRow>("/products/sitemap", {
        page: index + 2,
        pageSize: sitemapPageSize,
      }, sitemapFetchBehavior),
    ),
  );

  const completedPages = remainingPages.filter(
    (page): page is NonNullable<typeof page> => page !== null,
  );

  if (completedPages.length !== remainingPages.length) {
    throw new Error("Unable to fetch every product page for the sitemap.");
  }

  return { items: [firstPage, ...completedPages].flatMap((page) => page.items) };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, brands, articles, news] = await Promise.all([
    fetchAllActiveProducts(),
    fetchAdminList<SlugRow>("/categories", { isActive: true, page: 1, pageSize: 1000 }, sitemapFetchBehavior),
    fetchAdminList<SlugRow>("/brands", { isActive: true, page: 1, pageSize: 1000 }, sitemapFetchBehavior),
    fetchAdminList<SlugRow>("/articles", { isActive: true, page: 1, pageSize: 1000 }, sitemapFetchBehavior),
    fetchAdminList<SlugRow>("/news-and-activities", { isActive: true, page: 1, pageSize: 1000 }, sitemapFetchBehavior),
  ]);
  const staticPaths = ["", "/about-us", "/products", "/products/brands", "/articles", "/news-and-activities", "/faqs"];
  const rows = (response: { items: SlugRow[] } | null, prefix: string) => (response?.items ?? []).filter((item) => item.isActive).flatMap((item) => locales.map((locale) => ({ url: new URL(localizedSlugPath(locale, prefix, item.slug), siteUrl).toString(), lastModified: item.updatedAt ? new Date(item.updatedAt) : undefined })));
  return [
    ...locales.flatMap((locale) => staticPaths.map((path) => ({ url: new URL(`/${locale}${path}`, siteUrl).toString() }))),
    ...locales.flatMap((locale) => ["/privacy-policy", "/data-deletion"].map((path) => ({ url: new URL(`/${locale}${path}`, siteUrl).toString() }))),
    ...rows(products, "/products"), ...rows(categories, "/products/categories"), ...rows(brands, "/products/brands"), ...rows(articles, "/articles"), ...rows(news, "/news-and-activities"),
  ];
}
