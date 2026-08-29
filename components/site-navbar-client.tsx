"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { AuthSession } from "@/lib/auth/keycloak";
import { ProductSearch } from "@/components/product-search";
import {
  type Locale,
  dictionaries,
  getDictionary,
} from "@/lib/i18n";

type SiteNavbarClientProps = {
  alternateLocale: Locale;
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

function CloseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="nav-icon">
      <path
        d="M5 5l10 10M15 5 5 15"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="nav-icon">
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

function MenuIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="nav-icon">
      <path
        d="M4 6h12M4 10h12M4 14h12"
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

function AuthLink({
  children,
  className,
  href,
  ariaLabel,
}: {
  children: React.ReactNode;
  className?: string;
  href: string;
  ariaLabel?: string;
}) {
  return (
    <a aria-label={ariaLabel} className={className} href={href}>
      {children}
    </a>
  );
}

export function SiteNavbarClient({
  alternateLocale,
  categories,
  locale,
  session,
  variant = "default",
}: SiteNavbarClientProps) {
  const content = getDictionary(locale);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const navRef = useRef<HTMLElement | null>(null);
  const sessionMenuRef = useRef<HTMLDivElement | null>(null);
  const isAdminVariant = variant === "admin";
  const [openMenu, setOpenMenu] = useState<"categories" | "news" | null>(null);
  const [isSessionMenuOpen, setIsSessionMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [openMobileSubmenu, setOpenMobileSubmenu] = useState<"categories" | "news" | null>(null);
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
  const alternateLocaleHref = getAlternateLocaleHref({
    alternateLocale,
    pathname,
    searchParams: searchParams.toString(),
  });
  const isCustomer = session?.roles.some(
    (role) => role.trim().toLowerCase() === "customer",
  );
  const customerMenuItems = [
    { href: `/${locale}/profile`, label: locale === "th" ? "ข้อมูลโปรไฟล์" : "Profile" },
    { href: `/${locale}/orders`, label: locale === "th" ? "คำสั่งซื้อของฉัน" : "My orders" },
    { href: `/${locale}/deliveries`, label: locale === "th" ? "ที่อยู่ในการจัดส่ง" : "Delivery addresses" },
  ];

  function goToProductSearch(query: string) {
    const trimmedQuery = query.trim();

    setIsMobileSearchOpen(false);
    setIsMobileMenuOpen(false);

    router.push(
      trimmedQuery.length > 0
        ? `/${locale}/products?search=${encodeURIComponent(trimmedQuery)}`
        : `/${locale}/products`,
    );
  }

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!navRef.current?.contains(event.target as Node)) {
        setOpenMenu(null);
      }

      if (!sessionMenuRef.current?.contains(event.target as Node)) {
        setIsSessionMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const mobileBottomLinks = [
    {
      href: session ? `/${locale}/admin` : `/api/auth/login?locale=${locale}`,
      icon: "person",
      label: session ? session.username : content.signIn,
    },
    {
      href: "/api/auth/logout",
      icon: "logout",
      label: content.signOut,
    },
    {
      href: `/${locale}/products`,
      icon: "shopping_bag",
      label: locale === "th" ? "ตะกร้าสินค้า" : "Products",
    },
    {
      href: `/${locale}/faqs`,
      icon: "help",
      label: locale === "th" ? "คำถามที่พบบ่อย - FAQs" : "FAQs",
    },
  ];

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
          <nav
            className="primary-nav site-navbar-desktop-nav"
            aria-label="Primary navigation"
            ref={navRef}
          >
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
                        const href = `/${locale}/products/categories/${category.slug.trim()}`;
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
          <ProductSearch
            embedded
            buttonClassName="nav-search-button"
            fieldClassName="nav-search-field"
            labels={{
              search: content.searchAction,
              searchPlaceholder: content.searchPlaceholder,
            }}
            locale={locale}
            onSearch={goToProductSearch}
            onSelect={(product) => goToProductSearch(product.sku)}
            rootClassName="nav-search site-navbar-desktop-search"
          />
        ) : null}

        {isAdminVariant ? null : (
          <Link
            className="language-switch site-navbar-desktop-language"
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
          <div className="nav-session site-navbar-desktop-session">
            {isCustomer ? (
              <div className="nav-session-dropdown" ref={sessionMenuRef}>
                <button
                  aria-expanded={isSessionMenuOpen}
                  aria-haspopup="menu"
                  className="nav-username nav-username-button"
                  onClick={() => setIsSessionMenuOpen((current) => !current)}
                  type="button"
                >
                  {session.username}
                </button>
                {isSessionMenuOpen ? (
                  <ul className="primary-nav-menu nav-session-menu" role="menu">
                    {customerMenuItems.map((item, index) => (
                      <li key={item.href}>
                        <Link
                          className={index === 1 ? "primary-nav-menu-item active" : "primary-nav-menu-item"}
                          href={item.href}
                          onClick={() => setIsSessionMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                    <li>
                      <AuthLink className="primary-nav-menu-item" href="/api/auth/logout">
                        {content.signOut}
                      </AuthLink>
                    </li>
                  </ul>
                ) : null}
              </div>
            ) : (
              <Link className="nav-username" href={`/${locale}/admin`}>
                {session.username}
              </Link>
            )}
            {!isCustomer ? (
              <AuthLink className="sign-out-link" href="/api/auth/logout">
                {content.signOut}
              </AuthLink>
            ) : null}
          </div>
        ) : (
          <AuthLink
            className="sign-in-link site-navbar-desktop-session"
            href={`/api/auth/login?locale=${locale}`}
          >
            {content.signIn}
          </AuthLink>
        )}

        {!isAdminVariant ? (
          <div className="mobile-header-actions" aria-label="Mobile actions">
            <Link
              className="mobile-header-action"
              href={session ? `/${locale}/admin` : `/api/auth/login?locale=${locale}`}
              aria-label={session ? session.username : content.signIn}
            >
              <span className="material-symbols-outlined" aria-hidden="true">person</span>
            </Link>
            <Link
              className="mobile-header-action"
              href={`/${locale}/products`}
              aria-label={locale === "th" ? "สินค้าและบริการ" : "Products & Services"}
            >
              <span className="material-symbols-outlined" aria-hidden="true">shopping_bag</span>
            </Link>
            <button
              type="button"
              className="mobile-header-action"
              aria-expanded={isMobileSearchOpen}
              aria-label={locale === "th" ? "เปิดการค้นหา" : "Open search"}
              onClick={() => {
                setIsMobileSearchOpen((current) => !current);
                setIsMobileMenuOpen(false);
              }}
            >
              <SearchIcon />
            </button>
            <button
              type="button"
              className="mobile-header-action"
              aria-expanded={isMobileMenuOpen}
              aria-label={locale === "th" ? "เปิดเมนู" : "Open menu"}
              onClick={() => {
                setIsMobileSearchOpen(false);
                setIsMobileMenuOpen((current) => !current);
                setOpenMobileSubmenu(null);
              }}
            >
              {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        ) : null}

        {!isAdminVariant && isMobileSearchOpen ? (
          <ProductSearch
            embedded
            buttonClassName="mobile-nav-search-button"
            fieldClassName="mobile-nav-search-field"
            labels={{
              search: content.searchAction,
              searchPlaceholder: content.searchPlaceholder,
            }}
            locale={locale}
            onSearch={goToProductSearch}
            onSelect={(product) => goToProductSearch(product.sku)}
            rootClassName="mobile-nav-search"
          />
        ) : null}
      </div>

      {!isAdminVariant ? (
        <>
          <button
            aria-hidden={!isMobileMenuOpen}
            className={isMobileMenuOpen ? "mobile-nav-overlay mobile-nav-overlay-open" : "mobile-nav-overlay"}
            onClick={() => {
              setIsMobileMenuOpen(false);
              setOpenMobileSubmenu(null);
            }}
            tabIndex={isMobileMenuOpen ? 0 : -1}
            type="button"
          />
          <aside
            aria-hidden={!isMobileMenuOpen}
            className={isMobileMenuOpen ? "mobile-nav-drawer mobile-nav-drawer-open" : "mobile-nav-drawer"}
          >
            <div className="mobile-nav-drawer-top">
              <button
                type="button"
                className="mobile-nav-close"
                aria-label={locale === "th" ? "ปิดเมนู" : "Close menu"}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <CloseIcon />
              </button>
            </div>

            <nav className="mobile-nav-list" aria-label="Mobile navigation">
              <Link href={`/${locale}`} onClick={() => setIsMobileMenuOpen(false)}>
                {content.nav[0]}
              </Link>
              <Link href={`/${locale}/products`} onClick={() => setIsMobileMenuOpen(false)}>
                {content.nav[1]}
              </Link>
              <button
                type="button"
                aria-expanded={openMobileSubmenu === "categories"}
                className={
                  openMobileSubmenu === "categories"
                    ? "mobile-nav-toggle mobile-nav-toggle-open"
                    : "mobile-nav-toggle"
                }
                onClick={() => setOpenMobileSubmenu((current) => current === "categories" ? null : "categories")}
              >
                <span>{content.nav[2]}</span>
                <ChevronIcon />
              </button>
              {openMobileSubmenu === "categories" ? (
                <div className="mobile-nav-submenu">
                  {categories.map((category) => (
                    <Link
                      href={`/${locale}/products/categories/${category.slug.trim()}`}
                      key={category.code}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {locale === "th" ? category.nameTh : category.nameEn}
                    </Link>
                  ))}
                </div>
              ) : null}
              <Link href={`/${locale}/products/brands`} onClick={() => setIsMobileMenuOpen(false)}>
                {content.nav[3]}
              </Link>
              <button
                type="button"
                aria-expanded={openMobileSubmenu === "news"}
                className={
                  openMobileSubmenu === "news"
                    ? "mobile-nav-toggle mobile-nav-toggle-open"
                    : "mobile-nav-toggle"
                }
                onClick={() => setOpenMobileSubmenu((current) => current === "news" ? null : "news")}
              >
                <span>{content.nav[4]}</span>
                <ChevronIcon />
              </button>
              {openMobileSubmenu === "news" ? (
                <div className="mobile-nav-submenu">
                  <Link href={`/${locale}/news-and-activities`} onClick={() => setIsMobileMenuOpen(false)}>
                    {content.newsDropdown.news}
                  </Link>
                  <Link href={`/${locale}/articles`} onClick={() => setIsMobileMenuOpen(false)}>
                    {content.newsDropdown.articles}
                  </Link>
                </div>
              ) : null}
              <Link href={`/${locale}/about-us`} onClick={() => setIsMobileMenuOpen(false)}>
                {content.nav[5]}
              </Link>
            </nav>

            <div className="mobile-nav-bottom">
              {mobileBottomLinks
                .filter((item) => (session ? true : item.href !== "/api/auth/logout"))
                .map((item) => (
                <Link
                  className="mobile-nav-bottom-link"
                  href={item.href}
                  key={item.label}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="material-symbols-outlined" aria-hidden="true">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
              <Link
                className="mobile-nav-bottom-link"
                href={alternateLocaleHref}
                hrefLang={alternateLocale}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="material-symbols-outlined" aria-hidden="true">translate</span>
                <span>{content.languageLabel}</span>
              </Link>
            </div>
          </aside>
        </>
      ) : null}
    </header>
  );
}

function getAlternateLocaleHref({
  alternateLocale,
  pathname,
  searchParams,
}: {
  alternateLocale: Locale;
  pathname: string;
  searchParams: string;
}) {
  const segments = pathname.split("/");

  if (segments.length > 1) {
    segments[1] = alternateLocale;
  }

  const nextPathname = segments.join("/") || `/${alternateLocale}`;

  return searchParams.length > 0 ? `${nextPathname}?${searchParams}` : nextPathname;
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
