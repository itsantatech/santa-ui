import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminContent } from "@/components/admin/admin-content";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import {
  defaultAdminSection,
  isAdminSection,
} from "@/components/admin/admin-sections";
import { SiteNavbar } from "@/components/site-navbar";
import { requireAdminSession } from "@/lib/auth/keycloak";
import { getDictionary, isLocale, locales } from "@/lib/i18n";

type HomeProps = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{
    page?: string | string[];
    section?: string | string[];
    tab?: string | string[];
    categoryCode?: string | string[];
    subCategoryCode?: string | string[];
    brandCode?: string | string[];
    isActive?: string | string[];
    lowStockOnly?: string | string[];
    pageSize?: string | string[];
    search?: string | string[];
  }>;
};

type ProductFilterQuery = {
  brandCode?: string;
  categoryCode?: string;
  isActive?: boolean;
  lowStockOnly?: boolean;
  pageSize?: number;
  search?: string;
  subCategoryCode?: string;
  tab?: string;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: HomeProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  const dictionary = getDictionary(locale);

  return {
    title: dictionary.metadataTitle,
    description: dictionary.metadataDescription,
    alternates: {
      languages: {
        th: "/th",
        en: "/en",
      },
    },
  };
}

export default async function Home({ params, searchParams }: HomeProps) {
  const { locale } = await params;
  const query = await searchParams;

  if (typeof locale !== "string" || !isLocale(locale)) {
    notFound();
  }

  const sectionParam = Array.isArray(query?.section)
    ? query?.section[0]
    : query?.section;
  const pageParam = Array.isArray(query?.page) ? query?.page[0] : query?.page;
  const pageSizeParam = Array.isArray(query?.pageSize)
    ? query?.pageSize[0]
    : query?.pageSize;
  const tabParam = Array.isArray(query?.tab) ? query?.tab[0] : query?.tab;
  const activeSection =
    typeof sectionParam === "string" && isAdminSection(sectionParam)
      ? sectionParam
      : defaultAdminSection;
  const page = getPositiveInteger(pageParam);
  const productFilters: ProductFilterQuery = {
    brandCode: getSingleQueryParam(query?.brandCode),
    categoryCode: getSingleQueryParam(query?.categoryCode),
    isActive: getBooleanQuery(getSingleQueryParam(query?.isActive)),
    lowStockOnly: getBooleanQuery(getSingleQueryParam(query?.lowStockOnly)),
    pageSize: getPageSize(pageSizeParam),
    search: getProductSearch(getSingleQueryParam(query?.search)),
    subCategoryCode: getSingleQueryParam(query?.subCategoryCode),
    tab: typeof tabParam === "string" ? tabParam : undefined,
  };

  const session = await requireAdminSession({
    returnTo: `/${locale}/admin?section=${activeSection}`,
    forbiddenRedirectTo: `/${locale}`,
  });

  const canManageUsers = session.roles.some((role) => {
    const normalized = role.toLowerCase().replace(/[\s-]+/g, "_");
    return normalized === "superadmin" || normalized === "super_admin";
  });

  return (
    <main className="admin-page">
      <SiteNavbar
        adminSection={activeSection}
        locale={locale}
        variant="admin"
      />

      <div className="admin-layout">
        <AdminSidebar activeSection={activeSection} locale={locale} />
        <section className="admin-content" aria-labelledby="admin-heading">
          <AdminContent
            canManageUsers={canManageUsers}
            locale={locale}
            page={page}
            productFilters={productFilters}
            section={activeSection}
          />
        </section>
      </div>
    </main>
  );
}

function getPositiveInteger(value: string | undefined, fallback = 1) {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function getPageSize(value: string | undefined) {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 100 ? parsed : 50;
}

function getSingleQueryParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getProductSearch(value: string | undefined) {
  const trimmed = value?.trim();

  return trimmed && trimmed.length >= 3 ? trimmed : undefined;
}

function getBooleanQuery(value: string | undefined) {
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return undefined;
}
