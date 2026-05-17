import { getDictionary, type Locale } from "@/lib/i18n";
import { UnavailableApiTable } from "./unavailable-api-table";

export function QuotationsSection({ locale }: { locale: Locale }) {
  const content = getDictionary(locale).adminSections.quotations;

  return (
    <div className="admin-section-panel">
      <h1 id="admin-heading">{content.title}</h1>
      <p>{content.description}</p>
      <UnavailableApiTable locale={locale} resource="/quotations" />
    </div>
  );
}
