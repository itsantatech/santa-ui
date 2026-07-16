import {
  getAlternateLocale,
  type Locale,
} from "@/lib/i18n";
import { getSession, type AuthSession } from "@/lib/auth/keycloak";
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
}: SiteNavbarProps) {
  const [session, categoriesResponse] = await Promise.all([
    getNavbarSession(variant),
    fetchAdminList<NavbarCategory>("/categories", {
      isActive: true,
      page: 1,
      pageSize: 100,
    }),
  ]);
  const alternateLocale = getAlternateLocale(locale);
  const categories = [...(categoriesResponse?.items ?? [])]
    .filter((item) => item.isActive && item.slug.trim().length > 0)
    .sort((left, right) => left.rank - right.rank || left.nameTh.localeCompare(right.nameTh));

  return (
    <SiteNavbarClient
      alternateLocale={alternateLocale}
      categories={categories}
      locale={locale}
      session={session}
      variant={variant}
    />
  );
}

async function getNavbarSession(
  variant: SiteNavbarProps["variant"],
): Promise<AuthSession | null> {
  if (variant !== "admin") {
    return null;
  }

  return getSession();
}
