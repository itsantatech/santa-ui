import { fetchAdminList, type AdminListResponse } from "@/lib/admin-api";
import type { Locale } from "@/lib/i18n";
import { BrandsSectionClient } from "./brands-section.client";

type BrandRow = {
  code: string;
  id: number;
  rank: number;
  nameTh: string;
  nameEn: string;
  descriptionTh?: string | null;
  descriptionEn?: string | null;
  slug: string;
  imgUrl: string | null;
  isActive: boolean;
  updatedAt?: string;
  updatedBy?: string;
  skuCount?: number;
};

export async function BrandsSection({
  locale,
  page,
  search,
}: {
  locale: Locale;
  page: number;
  search?: string;
}) {
  const response = await fetchAdminList<BrandRow>("/brands", {
    page,
    search,
  });

  return (
    <BrandsSectionClient
      initialResponse={response}
      initialSearch={search}
      locale={locale}
      page={page}
    />
  );
}

export type BrandListResponse = AdminListResponse<BrandRow>;
