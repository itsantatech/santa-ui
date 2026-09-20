import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n";

export const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? process.env.APP_BASE_URL ?? "http://localhost:3000",
);

export function localizedAlternates(path: string, locale: Locale) {
  const localizedPath = path.replace(/^\/(th|en)(?=\/|$)/, "");
  return {
    canonical: `/${locale}${localizedPath}`,
    languages: { th: `/th${localizedPath}`, en: `/en${localizedPath}` },
  };
}

export function pageMetadata({ description, image, locale, path, title, type = "website" }: { description: string; image?: string | null; locale: Locale; path: string; title: string; type?: "article" | "website" }): Metadata {
  const url = `/${locale}${path}`;
  return {
    title,
    description,
    alternates: localizedAlternates(path, locale),
    openGraph: { title, description, url, type, locale: locale === "th" ? "th_TH" : "en_US", images: image ? [{ url: image, alt: title }] : undefined },
    twitter: { card: image ? "summary_large_image" : "summary", title, description, images: image ? [image] : undefined },
  };
}
