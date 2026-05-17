import type { Locale } from "@/lib/i18n";
import type { AdminSection } from "./admin-sections";
import { ArticlesSection } from "./articles-section";
import { BrandsSection } from "./brands-section";
import { CategoriesSection } from "./categories-section";
import { InventorySection } from "./inventory-section";
import { NewsActivitiesSection } from "./news-activities-section";
import { OrdersSection } from "./orders-section";
import { ProductsServicesSection } from "./products-services-section";
import { QuotationsSection } from "./quotations-section";
import { SettingsSection } from "./settings-section";

type AdminContentProps = {
  locale: Locale;
  section: AdminSection;
};

export function AdminContent({ locale, section }: AdminContentProps) {
  switch (section) {
    case "categories":
      return <CategoriesSection locale={locale} />;
    case "brands":
      return <BrandsSection locale={locale} />;
    case "inventory":
      return <InventorySection locale={locale} />;
    case "orders":
      return <OrdersSection locale={locale} />;
    case "quotations":
      return <QuotationsSection locale={locale} />;
    case "news-activities":
      return <NewsActivitiesSection locale={locale} />;
    case "articles":
      return <ArticlesSection locale={locale} />;
    case "settings":
      return <SettingsSection locale={locale} />;
    case "products-services":
    default:
      return <ProductsServicesSection locale={locale} />;
  }
}

