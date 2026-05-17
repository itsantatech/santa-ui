import type { Locale } from "@/lib/i18n";
import { ContentListSection } from "./content-list-section";

export function ArticlesSection({
  locale,
  page,
}: {
  locale: Locale;
  page: number;
}) {
  return (
    <ContentListSection
      apiPath="/articles"
      locale={locale}
      page={page}
      section="articles"
    />
  );
}
