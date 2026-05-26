import type { Locale } from "@/lib/i18n";
import type { AdminSection } from "./admin-sections";
import { ArticlesSection } from "./articles-section";
import { BrandsSection } from "./brands-section";
import { CategoriesSection } from "./categories-section";
import { InventorySection } from "./inventory-section";
import { NewsActivitiesSection } from "./news-activities-section";
import { OrdersSection } from "./orders-section";
import { ProductsServicesSection } from "./products-services-section.server";
import { QuotationsSection } from "./quotations-section";
import { SettingsSection } from "./settings-section";

type AdminContentProps = {
  canManageUsers?: boolean;
  locale: Locale;
  page: number;
  productFilters?: {
    brandCode?: string;
    categoryCode?: string;
    lowStockOnly?: boolean;
    pageSize?: number;
    search?: string;
    subCategoryCode?: string;
    tab?: string;
  };
  section: AdminSection;
};

export function AdminContent({
  canManageUsers,
  locale,
  page,
  productFilters,
  section,
}: AdminContentProps) {
  switch (section) {
    case "categories":
      return (
        <CategoriesSection
          locale={locale}
          page={page}
          pageSize={productFilters?.pageSize}
          tab={productFilters?.tab}
        />
      );
    case "brands":
      return (
        <BrandsSection
          locale={locale}
          page={page}
          pageSize={productFilters?.pageSize}
          search={productFilters?.search}
        />
      );
    case "inventory":
      return (
        <InventorySection
          filters={productFilters}
          locale={locale}
          page={page}
        />
      );
    case "orders":
      return <OrdersSection locale={locale} />;
    case "quotations":
      return <QuotationsSection locale={locale} />;
    case "news-activities":
      return (
        <NewsActivitiesSection
          locale={locale}
          page={page}
          pageSize={productFilters?.pageSize}
          search={productFilters?.search}
        />
      );
    case "articles":
      return (
        <ArticlesSection
          locale={locale}
          page={page}
          pageSize={productFilters?.pageSize}
          search={productFilters?.search}
        />
      );
    case "settings":
      return (
        <SettingsSection
          canManageUsers={canManageUsers}
          locale={locale}
          page={page}
          pageSize={productFilters?.pageSize}
          tab={productFilters?.tab}
        />
      );
    case "products-services":
    default:
      return (
        <ProductsServicesSection
          filters={productFilters}
          locale={locale}
          page={page}
        />
      );
  }
}
