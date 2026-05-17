import Image from "next/image";
import Link from "next/link";
import {
  Locale,
  getAlternateLocale,
  getDictionary,
  dictionaries,
} from "@/lib/i18n";
import { getSession } from "@/lib/auth/keycloak";
import type { AdminSection } from "./admin/admin-sections";

type SiteNavbarProps = {
  locale: Locale;
  variant?: "default" | "admin";
  adminSection?: AdminSection;
};

function ChevronIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="nav-icon">
      <path
        d="M5.5 7.5 10 12l4.5-4.5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="search-icon">
      <path
        d="m14.2 14.2 3.1 3.1M8.7 15.1a6.4 6.4 0 1 1 0-12.8 6.4 6.4 0 0 1 0 12.8Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function SantaTechLogo({ locale }: { locale: Locale }) {
  return (
    <Link className="brand-logo" href={`/${locale}`} aria-label="SantaTech home">
      <Image
        src="/santa-logo.svg"
        alt="SantaTech"
        width={154}
        height={58}
        priority
      />
    </Link>
  );
}

function LocaleFlag({ locale }: { locale: Locale }) {
  return (
    <span className={`locale-flag locale-flag-${locale}`} aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
      <span />
    </span>
  );
}

export async function SiteNavbar({
  locale,
  variant = "default",
  adminSection,
}: SiteNavbarProps) {
  const content = getDictionary(locale);
  const session = await getSession();
  const isAdminVariant = variant === "admin";
  const alternateLocale = getAlternateLocale(locale);
  const alternateLocaleHref =
    isAdminVariant && adminSection
      ? `/${alternateLocale}/admin?section=${adminSection}`
      : `/${alternateLocale}`;
  const newsNavLabel = content.nav[4];
  const navItems = content.nav.map((label) => ({
    label,
    hasMenu:
      label === dictionaries.th.nav[2] ||
      label === dictionaries.en.nav[2] ||
      label === dictionaries.th.nav[4] ||
      label === dictionaries.en.nav[4],
  }));

  return (
    <header className="site-header">
      <div
        className={
          isAdminVariant
            ? "site-header-inner site-header-inner-admin"
            : "site-header-inner"
        }
      >
        <SantaTechLogo locale={locale} />

        {!isAdminVariant ? (
          <nav className="primary-nav" aria-label="Primary navigation">
            {navItems.map((item) =>
              item.label === newsNavLabel ? (
                <details className="primary-nav-dropdown" key={item.label}>
                  <summary className="primary-nav-link">
                    <span>{item.label}</span>
                    <ChevronIcon />
                  </summary>
                  <ul className="primary-nav-menu" role="menu">
                    <li>
                      <Link className="primary-nav-menu-item active" href={`/${locale}/news`}>
                        {content.newsDropdown.news}
                      </Link>
                    </li>
                    <li>
                      <Link className="primary-nav-menu-item" href={`/${locale}/articles`}>
                        {content.newsDropdown.articles}
                      </Link>
                    </li>
                  </ul>
                </details>
              ) : (
                <Link
                  href={`/${locale}`}
                  className="primary-nav-link"
                  key={item.label}
                >
                  <span>{item.label}</span>
                  {item.hasMenu ? <ChevronIcon /> : null}
                </Link>
              ),
            )}
          </nav>
        ) : null}

        {!isAdminVariant ? (
          <form className="nav-search" role="search" action={`/${locale}/search`}>
            <label className="sr-only" htmlFor="site-search">
              {content.searchPlaceholder}
            </label>
            <SearchIcon />
            <input
              id="site-search"
              name="q"
              type="search"
              placeholder={content.searchPlaceholder}
            />
            <button type="submit">{content.searchAction}</button>
          </form>
        ) : null}

        {isAdminVariant ? null : (
          <Link
            className="language-switch"
            href={alternateLocaleHref}
            aria-label={content.languageLabel}
            hrefLang={alternateLocale}
          >
            <span>{locale.toUpperCase()}</span>
            <LocaleFlag locale={locale} />
            {/* <ChevronIcon /> */}
          </Link>
        )}

        {isAdminVariant ? (
          <Link
            className="language-switch admin-language-switch"
            href={alternateLocaleHref}
            aria-label={content.languageLabel}
            hrefLang={alternateLocale}
          >
            <span>{locale.toUpperCase()}</span>
            <LocaleFlag locale={locale} />
          </Link>
        ) : null}

        {session ? (
          <div className="nav-session">
            <span className="nav-username">{session.username}</span>
            <Link className="sign-out-link" href="/api/auth/logout">
              {content.signOut}
            </Link>
          </div>
        ) : (
          <Link className="sign-in-link" href={`/api/auth/login?locale=${locale}`}>
            {content.signIn}
          </Link>
        )}
      </div>
    </header>
  );
}
