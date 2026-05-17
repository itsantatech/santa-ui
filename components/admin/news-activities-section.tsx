import { getDictionary, type Locale } from "@/lib/i18n";

export function NewsActivitiesSection({ locale }: { locale: Locale }) {
  const content = getDictionary(locale).adminSections["news-activities"];

  return (
    <div className="admin-section-panel">
      <h1 id="admin-heading">{content.title}</h1>
      <p>{content.description}</p>
    </div>
  );
}
