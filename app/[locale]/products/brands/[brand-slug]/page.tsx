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

type BrandDetailPageProps = {
  params: Promise<{ "brand-slug": string; locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

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

type BrandRow = {
  code: string;
  isActive: boolean;
  imgUrl: string | null;
  nameEn: string;
  nameTh: string;
  rank: number;
  slug: string;
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
}: BrandDetailPageProps): Promise<Metadata> {
  const { locale, "brand-slug": brandSlug } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  const brand = await getBrandBySlug(brandSlug);
  const title = brand && brand !== undefined
    ? getLocalizedText(locale, brand.seoTitleTh, brand.seoTitleEn) ||
      getLocalizedBrandName(locale, brand)
    : `${locale === "th" ? "แบรนด์" : "Brand"}: ${formatSlugLabel(brandSlug)}`;
  const description = brand && brand !== undefined
    ? getLocalizedText(locale, brand.seoDescriptionTh, brand.seoDescriptionEn) ||
      getLocalizedText(locale, brand.descriptionTh, brand.descriptionEn) ||
      title
    : title;

  return { title, description };
}

export default async function BrandDetailPage({
  params,
  searchParams,
}: BrandDetailPageProps) {
  await connection();

  const { locale, "brand-slug": brandSlug } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const resolvedSearchParams = await searchParams;
  const page = getPositiveInteger(getSearchParam(resolvedSearchParams, "page")) ?? 1;
  const pageSize = getPositiveInteger(getSearchParam(resolvedSearchParams, "pageSize")) ?? 12;
  const search = getSearchParam(resolvedSearchParams, "search")?.trim() ?? "";
  const categoryCode = getSearchParam(resolvedSearchParams, "categoryCode")?.trim() ?? "";
  const subCategoryCode = getSearchParam(resolvedSearchParams, "subCategoryCode")?.trim() ?? "";
  const currentSort = normalizeSortKey(getSearchParam(resolvedSearchParams, "sort"));
  const sortQuery = getSortQuery(currentSort);
  const sortOptions = getSortOptions(locale);

  const [brand, footerCategoriesResponse, socialContactsResponse] = await Promise.all([
    getBrandBySlug(brandSlug),
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

  if (brand === null) {
    notFound();
  }

  const resolvedBrandName =
    brand && brand !== undefined
      ? getLocalizedBrandName(locale, brand)
      : formatSlugLabel(brandSlug);

  const [productsResponse, brandUniverseResponse] = await Promise.all([
    fetchAdminList<ProductRow>("/products", {
      brandCode: brand && brand !== undefined ? brand.code : undefined,
      categoryCode: categoryCode || undefined,
      isActive: true,
      page,
      pageSize,
      search: search || undefined,
      sortBy: sortQuery.sortBy,
      sortOrder: sortQuery.sortOrder,
      subCategoryCode: subCategoryCode || undefined,
    }),
    fetchAdminList<ProductRow>("/products", {
      brandCode: brand && brand !== undefined ? brand.code : undefined,
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
  const brandDescription =
    brand && brand !== undefined
      ? getLocalizedText(locale, brand.descriptionTh, brand.descriptionEn)
      : "";
  const availableCategories = getAvailableCategories(brandUniverseResponse?.items ?? []);
  const availableSubCategories = getAvailableSubCategories(brandUniverseResponse?.items ?? []);
  const filterStateKey = [brand?.code ?? "", categoryCode, subCategoryCode].join(":");
  const categoryOptions = toProductFilterOptions(availableCategories, locale);
  const subCategoryOptions = toProductFilterOptions(availableSubCategories, locale);
  const selectedCategory = findSelectedOption(categoryOptions, categoryCode);
  const selectedSubCategory = findSelectedOption(subCategoryOptions, subCategoryCode);

  return (
    <main className="site-shell">
      <SiteNavbar locale={locale} />

      <section className="products-page-section">
        <div className="products-page-shell">
          <nav className="products-page-breadcrumb" aria-label="Breadcrumb">
            <Link href={`/${locale}`}>{locale === "th" ? "หน้าแรก" : "Home"}</Link>
            <span aria-hidden="true">&gt;</span>
            <Link href={`/${locale}/products/brands`}>
              {locale === "th" ? "แบรนด์" : "Brands"}
            </Link>
            <span aria-hidden="true">&gt;</span>
            <span>{resolvedBrandName}</span>
          </nav>

          <div className="products-page-heading-row">
            <h1>{resolvedBrandName}</h1>
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

          <div className="brand-detail-intro">
            {brand && brand !== undefined && brand.imgUrl?.trim() ? (
              <div className="brand-detail-logo-card">
                <Image
                  alt={resolvedBrandName}
                  className="brand-detail-logo-image"
                  fill
                  sizes="120px"
                  src={brand.imgUrl}
                  unoptimized
                />
              </div>
            ) : null}

            {brandDescription ? (
              <p className="brand-detail-description">{brandDescription}</p>
            ) : null}
          </div>

          <ProductFilter
            key={filterStateKey}
            fields={[
              {
                id: "categoryCode",
                label: locale === "th" ? "หมวดหมู่" : "Category",
                options: categoryOptions,
                placeholder: locale === "th" ? "เลือกหมวดหมู่" : "Select category",
                selected: selectedCategory ? [selectedCategory] : undefined,
              },
              {
                id: "subCategoryCode",
                dependsOn: "categoryCode",
                disabledPlaceholder:
                  locale === "th" ? "เลือกหมวดหมู่ก่อน" : "Select category first",
                label: locale === "th" ? "หมวดหมู่ย่อย" : "Sub-category",
                options: subCategoryOptions,
                placeholder: locale === "th" ? "เลือกหมวดหมู่ย่อย" : "Select sub-category",
                selected: selectedSubCategory ? [selectedSubCategory] : undefined,
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
              {locale === "th" ? "ไม่พบสินค้าของแบรนด์นี้" : "No products found for this brand"}
            </div>
          )}

          <ProductListPagination
            currentPage={currentPage}
            getPageHref={(nextPage) =>
              createBrandPageHref(
                locale,
                brand?.slug ?? brandSlug,
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

async function getBrandBySlug(slug: string) {
  const normalizedSlug = slug.trim().toLowerCase();
  const response = await fetchAdminList<BrandRow>("/brands", {
    isActive: true,
    page: 1,
    pageSize: 50,
    search: normalizedSlug,
  });

  if (!response) {
    return undefined;
  }

  return (
    response.items.find((item) => item.slug.trim().toLowerCase() === normalizedSlug) ?? null
  );
}

function getAvailableCategories(products: ProductRow[]) {
  const categories = new Map<string, ProductRelation>();

  for (const product of products) {
    for (const category of product.categories ?? []) {
      categories.set(category.code, category);
    }
  }

  return [...categories.values()].sort((left, right) =>
    left.nameTh.localeCompare(right.nameTh),
  );
}

function getAvailableSubCategories(products: ProductRow[]) {
  const subCategories = new Map<string, ProductRelation>();

  for (const product of products) {
    for (const subCategory of product.subCategories ?? []) {
      subCategories.set(subCategory.code, subCategory);
    }
  }

  return [...subCategories.values()].sort((left, right) =>
    left.nameTh.localeCompare(right.nameTh),
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

function createBrandPageHref(
  locale: Locale,
  brandSlug: string,
  searchParams: Record<string, string | string[] | undefined>,
  page: number,
) {
  const nextSearchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "page" || key === "brandCode") {
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

  return `/${locale}/products/brands/${encodeURIComponent(brandSlug)}?${nextSearchParams.toString()}`;
}

function getLocalizedBrandName(locale: Locale, brand: BrandRow) {
  return locale === "th" ? brand.nameTh : brand.nameEn;
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
