import type { Locale } from "@/lib/i18n";
import { ContentManagementSection } from "./content-management-section";

export function ArticlesSection({
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
      resource="articles"
      search={search}
      section="articles"
    />
  );
}
