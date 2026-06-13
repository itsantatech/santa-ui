"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { AuthSession } from "@/lib/auth/keycloak";
import {
  type Locale,
  dictionaries,
  getDictionary,
} from "@/lib/i18n";

type SiteNavbarClientProps = {
  alternateLocale: Locale;
  alternateLocaleHref: string;
  categories: NavbarCategory[];
  locale: Locale;
  session: AuthSession | null;
  variant?: "default" | "admin";
};

type NavbarCategory = {
  code: string;
  nameEn: string;
  nameTh: string;
  slug: string;
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

export function SiteNavbarClient({
  alternateLocale,
  alternateLocaleHref,
  categories,
  locale,
  session,
  variant = "default",
}: SiteNavbarClientProps) {
  const content = getDictionary(locale);
  const pathname = usePathname();
  const navRef = useRef<HTMLElement | null>(null);
  const isAdminVariant = variant === "admin";
  const [openMenu, setOpenMenu] = useState<"categories" | "news" | null>(null);
  const categoriesNavLabel = content.nav[2];
  const newsNavLabel = content.nav[4];
  const navItems = content.nav.map((label, index) => ({
    hasMenu:
      label === dictionaries.th.nav[2] ||
      label === dictionaries.en.nav[2] ||
      label === dictionaries.th.nav[4] ||
      label === dictionaries.en.nav[4],
    href: getNavbarHref({ index, locale }),
    isActive: isNavbarItemActive({ index, locale, pathname }),
    label,
  }));
  const isNewsAndActivitiesActive =
    pathname === `/${locale}/news-and-activities` ||
    pathname.startsWith(`/${locale}/news-and-activities/`);
  const isArticlesActive =
    pathname === `/${locale}/articles` ||
    pathname.startsWith(`/${locale}/articles/`);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!navRef.current?.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

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
          <nav className="primary-nav" aria-label="Primary navigation" ref={navRef}>
            {navItems.map((item) =>
              item.label === categoriesNavLabel ? (
                <div className="primary-nav-dropdown" key={item.label}>
                  <button
                    aria-expanded={openMenu === "categories"}
                    aria-haspopup="menu"
                    className={item.isActive || openMenu === "categories" ? "primary-nav-link primary-nav-link-active" : "primary-nav-link"}
                    onClick={() => setOpenMenu((current) => (current === "categories" ? null : "categories"))}
                    type="button"
                  >
                    <span>{item.label}</span>
                    <ChevronIcon />
                  </button>
                  {openMenu === "categories" ? (
                    <ul className="primary-nav-menu primary-nav-menu-categories" role="menu">
                      {categories.map((category) => {
                        const href = `/${locale}/products/categories/${category.slug}`;
                        const isActive = pathname === href;

                        return (
                          <li key={category.code}>
                            <Link
                              className={isActive ? "primary-nav-menu-item active" : "primary-nav-menu-item"}
                              href={href}
                              onClick={() => setOpenMenu(null)}
                            >
                              {locale === "th" ? category.nameTh : category.nameEn}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </div>
              ) : item.label === newsNavLabel ? (
                <div className="primary-nav-dropdown" key={item.label}>
                  <button
                    aria-expanded={openMenu === "news"}
                    aria-haspopup="menu"
                    className={item.isActive || openMenu === "news" ? "primary-nav-link primary-nav-link-active" : "primary-nav-link"}
                    onClick={() => setOpenMenu((current) => (current === "news" ? null : "news"))}
                    type="button"
                  >
                    <span>{item.label}</span>
                    <ChevronIcon />
                  </button>
                  {openMenu === "news" ? (
                    <ul className="primary-nav-menu primary-nav-menu-news" role="menu">
                      <li>
                        <Link
                          className={
                            isNewsAndActivitiesActive
                              ? "primary-nav-menu-item active"
                              : "primary-nav-menu-item"
                          }
                          href={`/${locale}/news-and-activities`}
                          onClick={() => setOpenMenu(null)}
                        >
                          {content.newsDropdown.news}
                        </Link>
                      </li>
                      <li>
                        <Link
                          className={
                            isArticlesActive
                              ? "primary-nav-menu-item active"
                              : "primary-nav-menu-item"
                          }
                          href={`/${locale}/articles`}
                          onClick={() => setOpenMenu(null)}
                        >
                          {content.newsDropdown.articles}
                        </Link>
                      </li>
                    </ul>
                  ) : null}
                </div>
              ) : (
                <Link
                  href={item.href}
                  className={item.isActive ? "primary-nav-link primary-nav-link-active" : "primary-nav-link"}
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

function getNavbarHref({
  index,
  locale,
}: {
  index: number;
  locale: Locale;
}) {
  switch (index) {
    case 1:
      return `/${locale}/products`;
    case 2:
      return `/${locale}/products/categories`;
    case 3:
      return `/${locale}/products/brands`;
    case 5:
      return `/${locale}/about-us`;
    default:
      return `/${locale}`;
  }
}

function isNavbarItemActive({
  index,
  locale,
  pathname,
}: {
  index: number;
  locale: Locale;
  pathname: string;
}) {
  const localeRoot = `/${locale}`;

  switch (index) {
    case 0:
      return pathname === localeRoot;
    case 1:
      return (
        pathname === `/${locale}/products` ||
        (pathname.startsWith(`/${locale}/products/`) &&
          !pathname.startsWith(`/${locale}/products/categories/`) &&
          !pathname.startsWith(`/${locale}/products/brands/`) &&
          pathname !== `/${locale}/products/brands`)
      );
    case 2:
      return pathname.startsWith(`/${locale}/products/categories/`);
    case 3:
      return (
        pathname === `/${locale}/products/brands` ||
        pathname.startsWith(`/${locale}/products/brands/`)
      );
    case 4:
      return (
        pathname === `/${locale}/news-and-activities` ||
        pathname.startsWith(`/${locale}/news-and-activities/`) ||
        pathname === `/${locale}/articles` ||
        pathname.startsWith(`/${locale}/articles/`)
      );
    case 5:
      return pathname === `/${locale}/about-us`;
    default:
      return false;
  }
}
