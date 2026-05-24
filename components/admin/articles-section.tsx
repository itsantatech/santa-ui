import type { Locale } from "@/lib/i18n";
import { ContentManagementSection } from "./content-management-section";

export function ArticlesSection({
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
      resource="articles"
      search={search}
      section="articles"
    />
  );
}
