import {
  getAlternateLocale,
  type Locale,
} from "@/lib/i18n";
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
  const categories = await fetchPublicCategories();
  const alternateLocale = getAlternateLocale(locale);

  return (
    <SiteNavbarClient
      alternateLocale={alternateLocale}
      categories={categories}
      locale={locale}
      variant={variant}
    />
  );
}
