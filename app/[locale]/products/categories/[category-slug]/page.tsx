import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ProductCard, type ProductCardData } from "@/components/product-card";
import { ProductFilter, type ProductFilterOption } from "@/components/product-filter";
import { ProductListPagination } from "@/components/product-list-pagination";
import { ProductsPageControls } from "@/components/products-page-controls";
import { SiteFooter } from "@/components/site-footer";
import { SiteNavbar } from "@/components/site-navbar";
import { fetchAdminList } from "@/lib/admin-api";
import { isLocale, locales, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { normalizeRichTextHtml } from "@/lib/public-content";

type CategoryDetailPageProps = {
  params: Promise<{ "category-slug": string; locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// This route reads request search parameters and resolves a dynamic category slug.
// Keep the whole segment request-rendered so metadata and the page follow the same
// rendering mode instead of attempting an ISR prerender first.
export const dynamic = "force-dynamic";

type FooterCategory = {
  code: string;
  isActive: boolean;
  nameEn: string;
  nameTh: string;
  rank: number;
  slug: string;
};

type FooterSocialContact = {
  code: string;
  contactUrl: string;
  isActive: boolean;
};

type ProductRelation = {
  code: string;
  categoryCode?: string;
  nameTh: string;
  nameEn: string;
};

type CategoryRow = FooterCategory & {
  coverImgUrl?: string | null;
  descriptionEn?: string | null;
  descriptionTh?: string | null;
  seoDescriptionEn?: string;
  seoDescriptionTh?: string;
  seoTitleEn?: string;
  seoTitleTh?: string;
};

type ProductRow = ProductCardData & {
  rank: number;
  isActive: boolean;
  isPromotion: boolean;
  categories?: ProductRelation[];
  subCategories: ProductRelation[];
};

type SortOptionKey =
  | "name-th-asc"
  | "name-th-desc"
  | "name-en-asc"
  | "name-en-desc"
  | "price-desc"
  | "price-asc"
  | "rank-desc"
  | "rank-asc";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: CategoryDetailPageProps): Promise<Metadata> {
  const { locale, "category-slug": categorySlug } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  const category = await getCategoryBySlug(categorySlug);
  const title = category && category !== undefined
    ? getLocalizedText(locale, category.seoTitleTh, category.seoTitleEn) ||
      getLocalizedCategoryName(locale, category)
    : `${locale === "th" ? "หมวดหมู่" : "Category"}: ${formatSlugLabel(categorySlug)}`;
  const description = category && category !== undefined
    ? getLocalizedText(
        locale,
        category.seoDescriptionTh,
        category.seoDescriptionEn,
      ) ||
      getLocalizedText(locale, category.descriptionTh, category.descriptionEn) ||
      title
    : title;

  return pageMetadata({ title, description, locale, path: `/products/categories/${categorySlug}`, image: category?.coverImgUrl });
}

export default async function CategoryDetailPage({
  params,
  searchParams,
}: CategoryDetailPageProps) {
  await connection();

  const { locale, "category-slug": categorySlug } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const resolvedSearchParams = await searchParams;
  const page = getPositiveInteger(getSearchParam(resolvedSearchParams, "page")) ?? 1;
  const pageSize = getPositiveInteger(getSearchParam(resolvedSearchParams, "pageSize")) ?? 12;
  const search = getSearchParam(resolvedSearchParams, "search")?.trim() ?? "";
  const subCategoryCode = getSearchParam(resolvedSearchParams, "subCategoryCode")?.trim() ?? "";
  const brandCode = getSearchParam(resolvedSearchParams, "brandCode")?.trim() ?? "";
  const currentSort = normalizeSortKey(getSearchParam(resolvedSearchParams, "sort"));
  const sortQuery = getSortQuery(currentSort);
  const sortOptions = getSortOptions(locale);

  const [category, footerCategoriesResponse, socialContactsResponse] = await Promise.all([
    getCategoryBySlug(categorySlug),
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
  ]);

  if (category === null) {
    notFound();
  }

  const resolvedCategoryName =
    category && category !== undefined
      ? getLocalizedCategoryName(locale, category)
      : formatSlugLabel(categorySlug);

  const [productsResponse, subCategoriesResponse, brandsResponse] = await Promise.all([
    fetchAdminList<ProductRow>("/products", {
      brandCode: brandCode || undefined,
      categoryCode: category && category !== undefined ? category.code : undefined,
      isActive: true,
      page,
      pageSize,
      search: search || undefined,
      sortBy: sortQuery.sortBy,
      sortOrder: sortQuery.sortOrder,
      subCategoryCode: subCategoryCode || undefined,
    }),
    fetchAdminList<ProductRelation>("/sub-categories", {
      isActive: true,
      page: 1,
      pageSize: 100,
    }),
    fetchAdminList<ProductRelation>("/brands", {
      isActive: true,
      page: 1,
      pageSize: 100,
    }),
  ]);

  const footerCategories = sortFooterCategories(footerCategoriesResponse?.items ?? []);
  const products = productsResponse?.items ?? [];
  const totalItems = productsResponse?.meta.totalItems ?? 0;
  const totalPages = productsResponse?.meta.totalPages ?? 1;
  const currentPage = productsResponse?.meta.page ?? page;
  const categoryName = resolvedCategoryName;
  const categoryDescription =
    category && category !== undefined
      ? getLocalizedText(locale, category.descriptionTh, category.descriptionEn)
      : "";
  const filterStateKey = [category?.code ?? "", subCategoryCode, brandCode].join(":");
  const subCategoryOptions = toProductFilterOptions(
    (subCategoriesResponse?.items ?? []).filter(
      (item) =>
        category && category !== undefined
          ? item.categoryCode?.trim() === category.code
          : false,
    ),
    locale,
  );
  const brandOptions = toProductFilterOptions(brandsResponse?.items ?? [], locale);
  const selectedSubCategory = findSelectedOption(subCategoryOptions, subCategoryCode);
  const selectedBrand = findSelectedOption(brandOptions, brandCode);

  return (
    <main className="site-shell">
      <SiteNavbar locale={locale} />

      <section className="products-page-section">
        <div className="products-page-shell">
          <nav className="products-page-breadcrumb" aria-label="Breadcrumb">
            <Link href={`/${locale}`}>{locale === "th" ? "หน้าแรก" : "Home"}</Link>
            <span aria-hidden="true">&gt;</span>
            <Link href={`/${locale}/products`}>
              {locale === "th" ? "สินค้าและบริการ" : "Products & Services"}
            </Link>
            <span aria-hidden="true">&gt;</span>
            <span>{categoryName}</span>
          </nav>

          <div className="products-page-heading-row">
            <h1>{categoryName}</h1>
            <ProductsPageControls
              currentSearch={search}
              currentSort={currentSort}
              locale={locale}
              searchButtonLabel={locale === "th" ? "ค้นหา" : "Search"}
              searchPlaceholder={
                locale === "th"
                  ? "ค้นหาชื่อสินค้า, รุ่น หรือ ยี่ห้อ"
                  : "Search product name, model, or brand"
              }
              sortLabel={locale === "th" ? "เรียงลำดับตาม" : "Sort by"}
              sortOptions={sortOptions}
            />
          </div>

          {category && category !== undefined && category.coverImgUrl?.trim() ? (
            <div className="category-page-cover">
              <Image
                alt={categoryName}
                className="category-page-cover-image"
                fill
                sizes="1320px"
                src={category.coverImgUrl}
                unoptimized
              />
            </div>
          ) : null}

          {categoryDescription ? (
            <div
              className="category-page-description"
              dangerouslySetInnerHTML={{ __html: normalizeRichTextHtml(categoryDescription) }}
            />
          ) : null}

          <ProductFilter
            key={filterStateKey}
            fields={[
              {
                id: "subCategoryCode",
                label: locale === "th" ? "หมวดหมู่ย่อย" : "Sub-category",
                options: subCategoryOptions,
                placeholder: locale === "th" ? "เลือกหมวดหมู่ย่อย" : "Select sub-category",
                selected: selectedSubCategory ? [selectedSubCategory] : undefined,
              },
              {
                id: "brandCode",
                label: locale === "th" ? "แบรนด์" : "Brand",
                options: brandOptions,
                placeholder: locale === "th" ? "เลือกแบรนด์" : "Select brand",
                selected: selectedBrand ? [selectedBrand] : undefined,
              },
            ]}
            locale={locale === "th" ? "th-TH" : "en-US"}
            removeFilterLabel={locale === "th" ? "ลบตัวกรอง" : "Remove filter"}
            resultCount={totalItems}
            resultLabel={locale === "th" ? "ผลการค้นหาจำนวน" : "Search results"}
            resultUnit={locale === "th" ? "รายการ" : "items"}
            syncQueryParams
            title={locale === "th" ? "ตัวกรอง" : "Filters"}
            variant="admin"
          />

          {products.length > 0 ? (
            <div className="products-page-grid">
              {products.map((product) => (
                <ProductCard key={product.sku} locale={locale} product={product} />
              ))}
            </div>
          ) : (
            <div className="products-page-empty">
              {locale === "th" ? "ไม่พบสินค้าในหมวดหมู่นี้" : "No products found in this category"}
            </div>
          )}

          <ProductListPagination
            currentPage={currentPage}
            getPageHref={(nextPage) =>
              createCategoryPageHref(
                locale,
                category?.slug ?? categorySlug,
                resolvedSearchParams,
                nextPage,
              )
            }
            locale={locale}
            totalPages={totalPages}
          />
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

async function getCategoryBySlug(slug: string) {
  const normalizedSlug = slug.trim().toLowerCase();
  const response = await fetchAdminList<CategoryRow>("/categories", {
    isActive: true,
    page: 1,
    pageSize: 50,
    search: normalizedSlug,
  });

  if (!response) {
    return undefined;
  }

  return (
    response?.items.find(
      (item) => item.slug.trim().toLowerCase() === normalizedSlug,
    ) ?? null
  );
}

function sortFooterCategories(categories: FooterCategory[]) {
  return [...categories]
    .filter((item) => item.isActive && item.slug.trim().length > 0)
    .sort((left, right) => left.rank - right.rank || left.nameTh.localeCompare(right.nameTh));
}

function toProductFilterOptions(
  items: ProductRelation[],
  locale: Locale,
): ProductFilterOption[] {
  return items.map((item) => ({
    label: locale === "th" ? item.nameTh : item.nameEn,
    parentValue: item.categoryCode,
    value: item.code,
  }));
}

function findSelectedOption(options: ProductFilterOption[], value: string) {
  if (!value) {
    return undefined;
  }

  return options.find((option) => option.value === value);
}

function createCategoryPageHref(
  locale: Locale,
  categorySlug: string,
  searchParams: Record<string, string | string[] | undefined>,
  page: number,
) {
  const nextSearchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "page" || key === "categoryCode") {
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

  return `/${locale}/products/categories/${encodeURIComponent(categorySlug)}?${nextSearchParams.toString()}`;
}

function getLocalizedCategoryName(locale: Locale, category: CategoryRow) {
  return locale === "th" ? category.nameTh : category.nameEn;
}

function getLocalizedText(
  locale: Locale,
  th?: string | null,
  en?: string | null,
) {
  const value = locale === "th" ? th : en;
  return value?.trim() || "";
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

function getSortOptions(locale: Locale) {
  return [
    {
      label: locale === "th" ? "name(TH) ก-ฮ" : "name(TH) A-Z",
      value: "name-th-asc",
    },
    {
      label: locale === "th" ? "name(TH) ฮ-ก" : "name(TH) Z-A",
      value: "name-th-desc",
    },
    {
      label: locale === "th" ? "name(EN) a-z" : "name(EN) a-z",
      value: "name-en-asc",
    },
    {
      label: locale === "th" ? "name(EN) z-a" : "name(EN) z-a",
      value: "name-en-desc",
    },
    {
      label: locale === "th" ? "ราคา มากไปน้อย" : "Price high to low",
      value: "price-desc",
    },
    {
      label: locale === "th" ? "ราคา น้อยไปมาก" : "Price low to high",
      value: "price-asc",
    },
    {
      label: locale === "th" ? "rank มากไปน้อย" : "Rank high to low",
      value: "rank-desc",
    },
    {
      label: locale === "th" ? "rank น้อยไปมาก" : "Rank low to high",
      value: "rank-asc",
    },
  ] satisfies Array<{ label: string; value: SortOptionKey }>;
}

function normalizeSortKey(value: string | undefined): SortOptionKey {
  switch (value) {
    case "name-th-asc":
    case "name-th-desc":
    case "name-en-asc":
    case "name-en-desc":
    case "price-desc":
    case "price-asc":
    case "rank-asc":
    case "rank-desc":
      return value;
    default:
      return "rank-desc";
  }
}

function getSortQuery(sortKey: SortOptionKey) {
  switch (sortKey) {
    case "name-th-asc":
      return { sortBy: "nameTh", sortOrder: "asc" as const };
    case "name-th-desc":
      return { sortBy: "nameTh", sortOrder: "desc" as const };
    case "name-en-asc":
      return { sortBy: "nameEn", sortOrder: "asc" as const };
    case "name-en-desc":
      return { sortBy: "nameEn", sortOrder: "desc" as const };
    case "price-desc":
      return { sortBy: "price", sortOrder: "desc" as const };
    case "price-asc":
      return { sortBy: "price", sortOrder: "asc" as const };
    case "rank-asc":
      return { sortBy: "rank", sortOrder: "asc" as const };
    case "rank-desc":
    default:
      return { sortBy: "rank", sortOrder: "desc" as const };
  }
}

function formatSlugLabel(slug: string) {
  return decodeURIComponent(slug).replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
}
