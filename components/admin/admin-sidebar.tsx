import Link from "next/link";
import { getDictionary, type Locale } from "@/lib/i18n";
import { type AdminSection, adminSections } from "./admin-sections";

type AdminSidebarProps = {
  locale: Locale;
  activeSection: AdminSection;
};

const adminItems = [
  { section: adminSections[0], icon: "deployed_code" },
  { section: adminSections[1], icon: "category" },
  { section: adminSections[2], icon: "copyright" },
  { section: adminSections[3], icon: "warehouse" },
  { section: adminSections[4], icon: "shopping_cart" },
  { section: adminSections[5], icon: "article" },
  { section: adminSections[6], icon: "newspaper" },
  { section: adminSections[7], icon: "subject" },
  { section: adminSections[8], icon: "settings" },
] as const;

export function AdminSidebar({ locale, activeSection }: AdminSidebarProps) {
  const content = getDictionary(locale);

  return (
    <aside className="admin-sidebar" aria-label={content.adminNavigationLabel}>
      <nav className="admin-sidebar-nav">
        {adminItems.map((item) => {
          const isActive = item.section === activeSection;

          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              className={
                isActive
                  ? "admin-sidebar-link admin-sidebar-link-active"
                  : "admin-sidebar-link"
              }
              href={`/${locale}/admin?section=${item.section}`}
              key={item.section}
            >
              <span className="material-symbols-outlined admin-sidebar-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span>{content.adminNav[item.section]}</span>
            </Link>
          );
        })}
      </nav>

      <div className="admin-sidebar-version">VERSION 1.0.0</div>
    </aside>
  );
}
