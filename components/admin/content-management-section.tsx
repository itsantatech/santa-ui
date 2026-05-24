import { fetchAdminList, type AdminListResponse } from "@/lib/admin-api";
import type { Locale } from "@/lib/i18n";
import { ContentManagementSectionClient } from "./content-management-section.client";

export type ContentResource = "articles" | "news-and-activities";
export type ContentSection = "articles" | "news-activities";

export type ContentRow = {
  id: string;
  rank: number;
  topicTh: string;
  topicEn: string;
  contentTh: string;
  contentEn: string;
  slug: string;
  imgUrl: string[];
  relatedSku: string[];
  isActive: boolean;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
};

export type ContentListResponse = AdminListResponse<ContentRow>;

export async function ContentManagementSection({
  locale,
  page,
  resource,
  search,
  section,
}: {
  locale: Locale;
  page: number;
  resource: ContentResource;
  search?: string;
  section: ContentSection;
}) {
  const response = await fetchAdminList<ContentRow>(`/${resource}`, {
    page,
    search,
  });

  return (
    <ContentManagementSectionClient
      initialResponse={response}
      initialSearch={search}
      locale={locale}
      page={page}
      resource={resource}
      section={section}
    />
  );
}
