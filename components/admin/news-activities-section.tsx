import type { Locale } from "@/lib/i18n";
import { ContentManagementSection } from "./content-management-section";

export function NewsActivitiesSection({
  locale,
  page,
  pageSize,
  search,
}: {
  locale: Locale;
  page: number;
  pageSize?: number;
  search?: string;
}) {
  return (
    <ContentManagementSection
      locale={locale}
      page={page}
      pageSize={pageSize}
      resource="news-and-activities"
      search={search}
      section="news-activities"
    />
  );
}
