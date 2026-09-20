import type { Metadata } from "next";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { PublicContentList } from "@/components/public-content";
import { SiteFooter } from "@/components/site-footer";
import { SiteNavbar } from "@/components/site-navbar";
import {
  buildPageHref,
  fetchPublicChrome,
  fetchPublicContentList,
  getContentSortQuery,
  getPositiveInteger,
  getSearchParam,
  type PublicContentItem,
} from "@/lib/public-content";
import { isLocale, locales } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

type LocalePageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LocalePageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  return pageMetadata({ title: locale === "th" ? "บทความและสาระน่ารู้" : "Articles", description: locale === "th" ? "บทความความรู้ด้านอุตสาหกรรมจาก SantaTech" : "Industrial knowledge and insights from SantaTech.", locale, path: "/articles" });
}

export default async function ArticlesPage({
  params,
  searchParams,
}: LocalePageProps) {
  await connection();

  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const resolvedSearchParams = await searchParams;
  const page = getPositiveInteger(getSearchParam(resolvedSearchParams, "page")) ?? 1;
  const sort = getSearchParam(resolvedSearchParams, "sort") ?? "latest";
  const sortQuery = getContentSortQuery(sort);
  const [{ categories, socialContacts }, response] = await Promise.all([
    fetchPublicChrome(),
    fetchPublicContentList("articles", {
      page,
      pageSize: 6,
      sortBy: sortQuery.sortBy,
      sortOrder: sortQuery.sortOrder,
    }),
  ]);
  const sortedItems = [...(response?.items ?? [])].sort(compareContentByLatest);

  return (
    <main className="site-shell">
      <SiteNavbar locale={locale} />
      <PublicContentList
        currentPage={response?.meta.page ?? page}
        description={
          locale === "th"
            ? "ไม่พลาดข่าวสารล่าสุดของ Santatech ทั้งกิจกรรมภายใน ความร่วมมือระหว่างองค์กร และบทความความรู้ด้านอุตสาหกรรม"
            : "Explore the latest SantaTech articles, industrial knowledge, and company updates."
        }
        emptyLabel={locale === "th" ? "ไม่พบบทความ" : "No articles found"}
        getPageHref={(nextPage) =>
          buildPageHref(`/${locale}/articles`, resolvedSearchParams, nextPage)
        }
        items={sortedItems}
        locale={locale}
        searchParams={resolvedSearchParams}
        sectionLabel={locale === "th" ? "บทความ" : "Article"}
        title={locale === "th" ? "บทความและสาระน่ารู้" : "Articles & Insights"}
        totalPages={response?.meta.totalPages ?? 1}
        type="articles"
      />
      <SiteFooter categories={categories} locale={locale} socialContacts={socialContacts} />
    </main>
  );
}

function compareContentByLatest(
  left: Pick<PublicContentItem, "createdAt" | "updatedAt" | "id">,
  right: Pick<PublicContentItem, "createdAt" | "updatedAt" | "id">,
) {
  const leftTime = Date.parse(left.createdAt ?? left.updatedAt ?? "");
  const rightTime = Date.parse(right.createdAt ?? right.updatedAt ?? "");
  const normalizedLeftTime = Number.isNaN(leftTime) ? 0 : leftTime;
  const normalizedRightTime = Number.isNaN(rightTime) ? 0 : rightTime;

  if (normalizedLeftTime !== normalizedRightTime) {
    return normalizedRightTime - normalizedLeftTime;
  }

  return right.id.localeCompare(left.id);
}
