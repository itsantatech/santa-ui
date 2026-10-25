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

type NewsDetailPageProps = {
  params: Promise<{ locale: string; "news-and-activities-slug": string }>;
};

// Related products are deliberately fetched without caching so changes made by
// editors appear immediately. This route must therefore render per request.
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: NewsDetailPageProps): Promise<Metadata> {
  const { locale, "news-and-activities-slug": slug } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  const item = await fetchPublicContentBySlug("news-and-activities", slug);
  const title =
    item && isLocale(locale)
      ? getLocalizedContent(item, locale).topic
      : locale === "th"
        ? "ข่าวสารและกิจกรรม"
        : "News & Activities";

  const description = item
    ? createContentExcerpt(locale === "th" ? item.contentTh : item.contentEn) || title
    : title;

  return pageMetadata({
    title,
    description,
    locale,
    path: `/news-and-activities/${encodePathSegment(slug)}`,
    image: item?.imgUrl[0],
  });
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { locale, "news-and-activities-slug": slug } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const [{ categories, socialContacts }, item] = await Promise.all([
    fetchPublicChrome(),
    fetchPublicContentBySlug("news-and-activities", slug),
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
        mediaVariant="about"
        relatedProducts={relatedProducts}
        sectionHref={`/${locale}/news-and-activities`}
        sectionLabel={locale === "th" ? "ข่าวสารและกิจกรรม" : "News & Activities"}
      />
      <SiteFooter categories={categories} locale={locale} socialContacts={socialContacts} />
    </main>
  );
}
