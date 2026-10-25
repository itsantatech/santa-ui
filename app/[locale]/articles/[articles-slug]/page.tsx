import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicContentDetail } from "@/components/public-content";
import { SiteFooter } from "@/components/site-footer";
import { SiteNavbar } from "@/components/site-navbar";
import {
  createContentExcerpt,
  fetchPublicChrome,
  fetchPublicContentBySlug,
  fetchRelatedProducts,
  getLocalizedContent,
} from "@/lib/public-content";
import { isLocale, locales } from "@/lib/i18n";
import { encodePathSegment } from "@/lib/paths";
import { pageMetadata } from "@/lib/seo";

type ArticleDetailPageProps = {
  params: Promise<{ "articles-slug": string; locale: string }>;
};

// Related products are deliberately fetched without caching so changes made by
// editors appear immediately. This route must therefore render per request.
export const dynamic = "force-dynamic";

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

  const description = item
    ? createContentExcerpt(locale === "th" ? item.contentTh : item.contentEn) || title
    : title;

  return pageMetadata({
    title,
    description,
    locale,
    path: `/articles/${encodePathSegment(slug)}`,
    image: item?.imgUrl[0],
  });
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
  const relatedProducts = await fetchRelatedProducts(item.relatedSku);

  return (
    <main className="site-shell">
      <SiteNavbar locale={locale} />
      <PublicContentDetail
        item={item}
        locale={locale}
        mediaVariant="detail"
        relatedProducts={relatedProducts}
        sectionHref={`/${locale}/articles`}
        sectionLabel={locale === "th" ? "บทความ" : "Articles"}
      />
      <SiteFooter categories={categories} locale={locale} socialContacts={socialContacts} />
    </main>
  );
}
