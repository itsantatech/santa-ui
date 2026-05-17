import { getDictionary, type Locale } from "@/lib/i18n";

export function OrdersSection({ locale }: { locale: Locale }) {
  const content = getDictionary(locale).adminSections.orders;

  return (
    <div className="admin-section-panel">
      <h1 id="admin-heading">{content.title}</h1>
      <p>{content.description}</p>
    </div>
  );
}
