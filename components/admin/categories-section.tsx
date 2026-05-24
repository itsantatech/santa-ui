import { fetchAdminList, type AdminListResponse } from "@/lib/admin-api";
import type { Locale } from "@/lib/i18n";
import { CategoriesSectionClient } from "./categories-section.client";

type CategoryRow = {
  code: string;
  id: number;
  rank: number;
  nameTh: string;
  nameEn: string;
  descriptionTh: string | null;
  descriptionEn: string | null;
  slug: string;
  iconImgUrl: string | null;
  coverImgUrl: string | null;
  isActive: boolean;
  subCategoryCount?: number;
};

type SubCategoryRow = {
  code: string;
  categoryCode: string;
  id: number;
  rank: number;
  nameTh: string;
  nameEn: string;
  descriptionTh?: string | null;
  descriptionEn?: string | null;
  slug: string;
  isActive: boolean;
  skuCount?: number;
  category?: {
    code: string;
    nameTh: string;
    nameEn: string;
  } | null;
};

type TabValue = "categories" | "sub-categories";

export async function CategoriesSection({
  locale,
  page,
  tab,
}: {
  locale: Locale;
  page: number;
  tab?: string;
}) {
  const activeTab: TabValue = tab === "sub-categories" ? "sub-categories" : "categories";
  const [categoriesResponse, subCategoriesResponse, categoryOptionsResponse] =
    await Promise.all([
      activeTab === "categories"
        ? fetchAdminList<CategoryRow>("/categories", { page })
        : Promise.resolve(null),
      activeTab === "sub-categories"
        ? fetchAdminList<SubCategoryRow>("/sub-categories", { page })
        : Promise.resolve(null),
      fetchAdminList<CategoryRow>("/categories", { page: 1, pageSize: 100 }),
    ]);

  return (
    <CategoriesSectionClient
      activeTab={activeTab}
      categories={categoriesResponse}
      categoryOptions={categoryOptionsResponse?.items ?? []}
      locale={locale}
      page={page}
      subCategories={subCategoriesResponse}
    />
  );
}

export type CategoryListResponse = AdminListResponse<CategoryRow>;
export type SubCategoryListResponse = AdminListResponse<SubCategoryRow>;
