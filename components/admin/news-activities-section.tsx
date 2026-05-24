import type { Locale } from "@/lib/i18n";
import { ContentManagementSection } from "./content-management-section";

export function NewsActivitiesSection({
  locale,
  page,
  search,
}: {
  locale: Locale;
  page: number;
  search?: string;
}) {
  return (
    <ContentManagementSection
      locale={locale}
      page={page}
      resource="news-and-activities"
      search={search}
      section="news-activities"
    />
  );
}
