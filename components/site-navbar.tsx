import {
  getAlternateLocale,
  type Locale,
} from "@/lib/i18n";
import { getSession } from "@/lib/auth/keycloak";
import { fetchPublicCategories } from "@/lib/public-content";
import type { AdminSection } from "./admin/admin-sections";
import { SiteNavbarClient } from "./site-navbar-client";

type SiteNavbarProps = {
  locale: Locale;
  variant?: "default" | "admin";
  adminSection?: AdminSection;
};

export async function SiteNavbar({
  locale,
  variant = "default",
}: SiteNavbarProps) {
  const [session, categories] = await Promise.all([
    getSession(),
    fetchPublicCategories(),
  ]);
  const alternateLocale = getAlternateLocale(locale);

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
