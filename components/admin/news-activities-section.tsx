import type { Locale } from "@/lib/i18n";
import { ContentListSection } from "./content-list-section";

export function NewsActivitiesSection({
  locale,
  page,
}: {
  locale: Locale;
  page: number;
}) {
  return (
    <ContentListSection
      apiPath="/news-and-activities"
      locale={locale}
      page={page}
      section="news-activities"
    />
  );
}
