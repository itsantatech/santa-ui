import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductListPagination } from "@/components/product-list-pagination";
import { SiteFooter } from "@/components/site-footer";
import { SiteNavbar } from "@/components/site-navbar";
import { fetchAdminList } from "@/lib/admin-api";
import { isLocale, locales, type Locale } from "@/lib/i18n";

type LocalePageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type FooterCategory = {
  code: string;
  isActive: boolean;
  nameEn: string;
  nameTh: string;
  rank: number;
  slug: string;
  iconImgUrl?: string | null;
};

type FooterSocialContact = {
  code: string;
  contactUrl: string;
  isActive: boolean;
};

type FaqRow = {
  id: string;
  rank: number;
  questionTh?: string | null;
  questionEn?: string | null;
  answerTh?: string | null;
  answerEn?: string | null;
  url?: string | null;
  categoryCode?: string | null;
  isActive: boolean;
};

const defaultPageSize = 12;

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

  return {
    title: locale === "th" ? "คำถามที่พบบ่อย" : "FAQs",
    description: locale === "th" ? "คำถามที่พบบ่อย" : "FAQs",
  };
}

export default async function FaqsPage({ params, searchParams }: LocalePageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const resolvedSearchParams = await searchParams;
  const page = getPositiveInteger(getSearchParam(resolvedSearchParams, "page")) ?? 1;
  const pageSize =
    getPositiveInteger(getSearchParam(resolvedSearchParams, "pageSize")) ?? defaultPageSize;
  const search = getSearchParam(resolvedSearchParams, "search")?.trim() ?? "";
  const categoryCode = getSearchParam(resolvedSearchParams, "categoryCode")?.trim() ?? "";

  const [categoriesResponse, socialContactsResponse, faqsResponse] = await Promise.all([
    fetchAdminList<FooterCategory>("/categories", {
      isActive: true,
      page: 1,
      pageSize: 100,
    }),
    fetchAdminList<FooterSocialContact>("/social-media-contacts", {
      isActive: true,
      page: 1,
      pageSize: 20,
    }),
    fetchAdminList<FaqRow>("/faqs", {
      isActive: true,
      page: 1,
      pageSize: 100,
      search: search || undefined,
    }),
  ]);

  const footerCategories = sortFooterCategories(categoriesResponse?.items ?? []);
  const activeFaqs = (faqsResponse?.items ?? [])
    .filter((item) => item.isActive)
    .sort((left, right) => right.rank - left.rank);
  const visibleFaqs = categoryCode
    ? activeFaqs.filter((item) => item.categoryCode?.trim() === categoryCode)
    : activeFaqs;
  const paginatedFaqs = paginateItems(visibleFaqs, page, pageSize);
  const faqCategories = getFaqCategories(footerCategories, activeFaqs, locale);
  const selectedCategory = faqCategories.find((item) => item.code === categoryCode) ?? null;

  return (
    <main className="site-shell">
      <SiteNavbar locale={locale} />

      <section className="products-page-section">
        <div className="products-page-shell">
          <nav className="products-page-breadcrumb" aria-label="Breadcrumb">
            <Link href={`/${locale}`}>{locale === "th" ? "หน้าแรก" : "Home"}</Link>
            <span aria-hidden="true">&gt;</span>
            <span>{locale === "th" ? "คำถามที่พบบ่อย (FAQs)" : "Frequently Asked Questions (FAQs)"}</span>
          </nav>

          <div className="faqs-page-heading">
            <h1>{locale === "th" ? "คำถามที่พบบ่อย (FAQs)" : "Frequently Asked Questions (FAQs)"}</h1>
          </div>

          <form action="" className="brand-directory-search faq-search" role="search">
            {categoryCode ? <input name="categoryCode" type="hidden" value={categoryCode} /> : null}
            <label className="sr-only" htmlFor="faq-search-input">
              {locale === "th" ? "ค้นหาคำถาม" : "Search FAQs"}
            </label>
            <input
              defaultValue={search}
              id="faq-search-input"
              name="search"
              placeholder={locale === "th" ? "ค้นหาคำถาม" : "Search questions"}
              type="search"
            />
            <button type="submit">{locale === "th" ? "ค้นหา" : "Search"}</button>
          </form>

          <div className="faqs-page-layout">
            <aside className="faqs-sidebar">
              <h2>{locale === "th" ? "หมวดหมู่คำถาม" : "FAQ categories"}</h2>
              <nav aria-label={locale === "th" ? "หมวดหมู่คำถาม" : "FAQ categories"}>
                <ul className="faqs-category-list">
                  {faqCategories.map((category) => (
                    <li key={category.code}>
                      <Link
                        className={
                          category.code === selectedCategory?.code
                            ? "faqs-category-link is-active"
                            : "faqs-category-link"
                        }
                        href={createFaqCategoryHref(locale, category.code, search)}
                      >
                        <span className="faqs-category-icon" aria-hidden="true">
                          {category.iconImgUrl?.trim() ? (
                            <span
                              className="faqs-category-icon-image"
                              style={{ backgroundImage: `url("${encodeURI(category.iconImgUrl)}")` }}
                            />
                          ) : (
                            <span className="material-symbols-outlined">
                              {getFallbackFaqCategoryIcon(category.code)}
                            </span>
                          )}
                        </span>
                        <span className="faqs-category-copy">
                          <strong>{locale === "th" ? category.nameTh : category.nameEn}</strong>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>

            <div className="faqs-content">
              {paginatedFaqs.items.length > 0 ? (
                <div className="faqs-accordion-list">
                  {paginatedFaqs.items.map((faq, index) => {
                    const answer = normalizeRichTextHtml(
                      locale === "th" ? faq.answerTh : faq.answerEn,
                    );
                    const question =
                      (locale === "th" ? faq.questionTh : faq.questionEn)?.trim() || "";
                    const itemNumber = (paginatedFaqs.page - 1) * paginatedFaqs.pageSize + index + 1;

                    return (
                      <details
                        className="faqs-accordion-item"
                        key={faq.id}
                        open={index === 0}
                      >
                        <summary className="faqs-accordion-summary">
                          <span>{`Q${itemNumber}: ${question}`}</span>
                          <span
                            className="material-symbols-outlined faqs-accordion-icon"
                            aria-hidden="true"
                          >
                            expand_more
                          </span>
                        </summary>
                        <div className="faqs-accordion-body">
                          <div dangerouslySetInnerHTML={{ __html: answer }} />
                          {faq.url?.trim() ? (
                            <a
                              className="faqs-accordion-link"
                              href={faq.url}
                              rel="noreferrer"
                              target="_blank"
                            >
                              {locale === "th" ? "ดูรายละเอียดเพิ่มเติม" : "View details"}
                            </a>
                          ) : null}
                        </div>
                      </details>
                    );
                  })}
                </div>
              ) : (
                <div className="products-page-empty">
                  {locale === "th" ? "ไม่พบคำถามที่พบบ่อย" : "No FAQs found"}
                </div>
              )}

              {paginatedFaqs.totalPages > 1 ? (
                <ProductListPagination
                  currentPage={paginatedFaqs.page}
                  getPageHref={(nextPage) =>
                    createFaqPageHref(locale, resolvedSearchParams, nextPage, pageSize)
                  }
                  locale={locale}
                  totalPages={paginatedFaqs.totalPages}
                />
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter
        categories={footerCategories}
        locale={locale}
        socialContacts={socialContactsResponse?.items ?? []}
      />
    </main>
  );
}

function createFaqPageHref(
  locale: Locale,
  searchParams: Record<string, string | string[] | undefined>,
  page: number,
  pageSize: number,
) {
  const nextSearchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "page") {
      continue;
    }

    if (Array.isArray(value)) {
      value.forEach((entry) => nextSearchParams.append(key, entry));
      continue;
    }

    if (typeof value === "string" && value.length > 0) {
      nextSearchParams.set(key, value);
    }
  }

  nextSearchParams.set("page", String(page));
  nextSearchParams.set("pageSize", String(pageSize));

  return `/${locale}/faqs?${nextSearchParams.toString()}`;
}

function createFaqCategoryHref(locale: Locale, categoryCode: string, search: string) {
  const nextSearchParams = new URLSearchParams();
  nextSearchParams.set("categoryCode", categoryCode);

  if (search) {
    nextSearchParams.set("search", search);
  }

  return `/${locale}/faqs?${nextSearchParams.toString()}`;
}

function getFaqCategories(categories: FooterCategory[], faqs: FaqRow[], locale: Locale) {
  const usedCodes = new Set(
    faqs.map((item) => item.categoryCode?.trim()).filter((value): value is string => Boolean(value)),
  );

  return categories
    .filter((item) => usedCodes.has(item.code))
    .sort(
      (left, right) =>
        right.rank - left.rank ||
        (locale === "th" ? left.nameTh : left.nameEn).localeCompare(
          locale === "th" ? right.nameTh : right.nameEn,
        ),
    );
}

function paginateItems<T>(items: T[], page: number, pageSize: number) {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const normalizedPage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (normalizedPage - 1) * pageSize;

  return {
    items: items.slice(startIndex, startIndex + pageSize),
    page: normalizedPage,
    pageSize,
    totalItems,
    totalPages,
  };
}

function normalizeRichTextHtml(value?: string | null) {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    return "<p>-</p>";
  }

  return normalizedValue.includes("<") ? normalizedValue : `<p>${escapeHtml(normalizedValue)}</p>`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getSearchParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = searchParams[key];

  return Array.isArray(value) ? value[0] : value;
}

function getPositiveInteger(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return undefined;
  }

  return parsed;
}

function getFallbackFaqCategoryIcon(code: string) {
  const symbols = [
    "science",
    "medical_services",
    "precision_manufacturing",
    "handyman",
    "sensors",
    "monitoring",
  ];
  const seed = code.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return symbols[seed % symbols.length] ?? "help";
}

function sortFooterCategories(categories: FooterCategory[]) {
  return [...categories]
    .filter((item) => item.isActive && item.slug.trim().length > 0)
    .sort((left, right) => left.rank - right.rank || left.nameTh.localeCompare(right.nameTh));
}
