import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ProductListPagination } from "@/components/product-list-pagination";
import { SiteFooter } from "@/components/site-footer";
import { SiteNavbar } from "@/components/site-navbar";
import { fetchAdminList } from "@/lib/admin-api";
import { isLocale, locales, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

type BrandsPageProps = {
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
};

type FooterSocialContact = {
  code: string;
  contactUrl: string;
  isActive: boolean;
};

type BrandRow = {
  code: string;
  isActive: boolean;
  imgUrl: string | null;
  nameEn: string;
  nameTh: string;
  rank: number;
  slug: string;
};

const defaultPageSize = 30;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: BrandsPageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  return pageMetadata({ title: locale === "th" ? "แบรนด์" : "Brands", description: locale === "th" ? "รวมแบรนด์สินค้าอุตสาหกรรม" : "Industrial product brands", locale, path: "/products/brands" });
}

export default async function ProductBrandsPage({
  params,
  searchParams,
}: BrandsPageProps) {
  await connection();

  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const resolvedSearchParams = await searchParams;
  const page = getPositiveInteger(getSearchParam(resolvedSearchParams, "page")) ?? 1;
  const pageSize =
    getPositiveInteger(getSearchParam(resolvedSearchParams, "pageSize")) ?? defaultPageSize;
  const search = getSearchParam(resolvedSearchParams, "search")?.trim() ?? "";

  const [footerCategoriesResponse, socialContactsResponse, brandsResponse] = await Promise.all([
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
    fetchAdminList<BrandRow>("/brands", {
      isActive: true,
      page,
      pageSize,
      search: search || undefined,
    }),
  ]);

  const brands = (brandsResponse?.items ?? []).filter(
    (brand) => brand.isActive && brand.slug.trim().length > 0,
  );
  const currentPage = brandsResponse?.meta.page ?? page;
  const totalPages = brandsResponse?.meta.totalPages ?? 1;
  const footerCategories = sortFooterCategories(footerCategoriesResponse?.items ?? []);

  return (
    <main className="site-shell">
      <SiteNavbar locale={locale} />

      <section className="products-page-section">
        <div className="products-page-shell">
          <nav className="products-page-breadcrumb" aria-label="Breadcrumb">
            <Link href={`/${locale}`}>{locale === "th" ? "หน้าแรก" : "Home"}</Link>
            <span aria-hidden="true">&gt;</span>
            <span>{locale === "th" ? "แบรนด์" : "Brands"}</span>
          </nav>

          <div className="products-page-heading-row products-page-heading-row-stack">
            <h1>{locale === "th" ? "แบรนด์" : "Brands"}</h1>
            <form action="" className="brand-directory-search" role="search">
              <label className="sr-only" htmlFor="brand-directory-search-input">
                {locale === "th" ? "ค้นหาแบรนด์" : "Search brands"}
              </label>
              <input
                defaultValue={search}
                id="brand-directory-search-input"
                name="search"
                placeholder={locale === "th" ? "ค้นหาแบรนด์" : "Search brands"}
                type="search"
              />
              <button type="submit">{locale === "th" ? "ค้นหา" : "Search"}</button>
            </form>
          </div>

          {brands.length > 0 ? (
            <div className="brand-directory-grid">
              {brands.map((brand) => (
                <Link
                  className="brand-directory-card"
                  href={`/${locale}/products/brands/${brand.slug.trim()}`}
                  key={brand.code}
                >
                  <div className="brand-directory-card-media">
                    {brand.imgUrl ? (
                      <Image
                        alt={getLocalizedBrandName(locale, brand)}
                        className="brand-directory-card-image"
                        fill
                        sizes="(max-width: 900px) 33vw, 16vw"
                        src={brand.imgUrl}
                        unoptimized
                      />
                    ) : (
                      <span className="brand-directory-card-placeholder" aria-hidden="true">
                        {getLocalizedBrandName(locale, brand).slice(0, 1)}
                      </span>
                    )}
                  </div>
                  <span className="brand-directory-card-name">
                    {getLocalizedBrandName(locale, brand)}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="products-page-empty">
              {locale === "th" ? "ไม่พบแบรนด์" : "No brands found"}
            </div>
          )}

          <ProductListPagination
            currentPage={currentPage}
            getPageHref={(nextPage) =>
              createBrandsPageHref(locale, resolvedSearchParams, nextPage, pageSize)
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

function createBrandsPageHref(
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

  return `/${locale}/products/brands?${nextSearchParams.toString()}`;
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

function sortFooterCategories(categories: FooterCategory[]) {
  return [...categories]
    .filter((item) => item.isActive && item.slug.trim().length > 0)
    .sort((left, right) => left.rank - right.rank || left.nameTh.localeCompare(right.nameTh));
}

function getLocalizedBrandName(locale: Locale, brand: BrandRow) {
  return locale === "th" ? brand.nameTh : brand.nameEn;
}
