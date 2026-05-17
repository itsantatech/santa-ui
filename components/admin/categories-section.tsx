import { getDictionary, type Locale } from "@/lib/i18n";

export function CategoriesSection({ locale }: { locale: Locale }) {
  const content = getDictionary(locale).adminSections.categories;

  return (
    <div className="admin-section-panel">
      <h1 id="admin-heading">{content.title}</h1>
      <p>{content.description}</p>
    </div>
  );
}
