import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicContentDetail } from "@/components/public-content";
import { SiteFooter } from "@/components/site-footer";
import { SiteNavbar } from "@/components/site-navbar";
import {
  fetchPublicChrome,
  fetchPublicContentBySlug,
  getLocalizedContent,
} from "@/lib/public-content";
import { isLocale, locales } from "@/lib/i18n";

type ArticleDetailPageProps = {
  params: Promise<{ "articles-slug": string; locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: ArticleDetailPageProps): Promise<Metadata> {
  const { locale, "articles-slug": slug } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  const item = await fetchPublicContentBySlug("articles", slug);
  const title =
    item && isLocale(locale)
      ? getLocalizedContent(item, locale).topic
      : locale === "th"
        ? "บทความ"
        : "Article";

  return {
    title,
    description: title,
  };
}

export default async function ArticleDetailPage({
  params,
}: ArticleDetailPageProps) {
  const { locale, "articles-slug": slug } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const [{ categories, socialContacts }, item] = await Promise.all([
    fetchPublicChrome(),
    fetchPublicContentBySlug("articles", slug),
  ]);

  if (!item) {
    notFound();
  }

  return (
    <main className="site-shell">
      <SiteNavbar locale={locale} />
      <PublicContentDetail
        item={item}
        locale={locale}
        mediaVariant="about"
        sectionHref={`/${locale}/articles`}
        sectionLabel={locale === "th" ? "บทความ" : "Articles"}
      />
      <SiteFooter categories={categories} locale={locale} socialContacts={socialContacts} />
    </main>
  );
}
