import Link from "next/link";
import { getDictionary, type Locale } from "@/lib/i18n";

type AdminSidebarProps = {
  locale: Locale;
};

const adminItems = [
  { icon: "deployed_code", active: true },
  { icon: "category", active: false },
  { icon: "copyright", active: false },
  { icon: "warehouse", active: false },
  { icon: "shopping_cart", active: false },
  { icon: "article", active: false },
  { icon: "newspaper", active: false },
  { icon: "subject", active: false },
  { icon: "settings", active: false },
] as const;

export function AdminSidebar({ locale }: AdminSidebarProps) {
  const content = getDictionary(locale);

  return (
    <aside className="admin-sidebar" aria-label={content.adminNavigationLabel}>
      <nav className="admin-sidebar-nav">
        {adminItems.map((item, index) => (
          <Link
            className={
              item.active
                ? "admin-sidebar-link admin-sidebar-link-active"
                : "admin-sidebar-link"
            }
            href={`/${locale}/admin`}
            key={content.adminNav[index]}
          >
            <span className="material-symbols-outlined admin-sidebar-icon" aria-hidden="true">
              {item.icon}
            </span>
            <span>{content.adminNav[index]}</span>
          </Link>
        ))}
      </nav>

      <div className="admin-sidebar-version">VERSION 1.0.0</div>
    </aside>
  );
}
