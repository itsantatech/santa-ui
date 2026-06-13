import {
  getAlternateLocale,
  type Locale,
} from "@/lib/i18n";
import { getSession } from "@/lib/auth/keycloak";
import { fetchAdminList } from "@/lib/admin-api";
import type { AdminSection } from "./admin/admin-sections";
import { SiteNavbarClient } from "./site-navbar-client";

type SiteNavbarProps = {
  locale: Locale;
  variant?: "default" | "admin";
  adminSection?: AdminSection;
};

type NavbarCategory = {
  code: string;
  isActive: boolean;
  nameEn: string;
  nameTh: string;
  rank: number;
  slug: string;
};

export async function SiteNavbar({
  locale,
  variant = "default",
  adminSection,
}: SiteNavbarProps) {
  const [session, categoriesResponse] = await Promise.all([
    getSession(),
    fetchAdminList<NavbarCategory>("/categories", {
      isActive: true,
      page: 1,
      pageSize: 100,
    }),
  ]);
  const isAdminVariant = variant === "admin";
  const alternateLocale = getAlternateLocale(locale);
  const alternateLocaleHref =
    isAdminVariant && adminSection
      ? `/${alternateLocale}/admin?section=${adminSection}`
      : `/${alternateLocale}`;
  const categories = [...(categoriesResponse?.items ?? [])]
    .filter((item) => item.isActive && item.slug.trim().length > 0)
    .sort((left, right) => left.rank - right.rank || left.nameTh.localeCompare(right.nameTh));

  return (
    <SiteNavbarClient
      alternateLocale={alternateLocale}
      alternateLocaleHref={alternateLocaleHref}
      categories={categories}
      locale={locale}
      session={session}
      variant={variant}
    />
  );
}
