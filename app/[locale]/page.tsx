import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteNavbar } from "@/components/site-navbar";
import { fetchAdminList } from "@/lib/admin-api";
import { getDictionary, isLocale, locales, type Locale } from "@/lib/i18n";

type HomeProps = {
  params: Promise<{ locale: string }>;
};

type HomeSettingRow = {
  id: string;
  name: string;
  headlineTh?: string | null;
  headlineEn?: string | null;
  contentTh?: string | null;
  contentEn?: string | null;
  imgUrl?: string[] | null;
  isActive: boolean;
};

type CategoryRow = {
  code: string;
  descriptionTh?: string | null;
  descriptionEn?: string | null;
  iconImgUrl?: string | null;
  isActive: boolean;
  nameEn: string;
  nameTh: string;
  rank: number;
  slug: string;
};

const fallbackCategoryIcons = [
  "factory",
  "precision_manufacturing",
  "construction",
  "inventory_2",
  "science",
  "electrical_services",
  "devices",
  "settings",
] as const;

function richTextToPlainText(value?: string | null) {
  if (!value) {
    return "";
  }

  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p[^>]*>/gi, "\n")
    .replace(/<\/?p[^>]*>/gi, "")
    .replace(/<\/?[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function getLocalizedText(locale: Locale, th?: string | null, en?: string | null) {
  return locale === "th" ? th ?? en ?? "" : en ?? th ?? "";
}

function getHomeSectionContent({
  businessUnitSetting,
  locale,
}: {
  businessUnitSetting?: HomeSettingRow | null;
  locale: Locale;
}) {
  const isThaiLocale = locale === "th";

  return {
    body:
      richTextToPlainText(
        getLocalizedText(locale, businessUnitSetting?.contentTh, businessUnitSetting?.contentEn),
      ) ||
      (isThaiLocale
        ? "รวมหมวดหมู่สินค้าและบริการหลักที่พร้อมตอบโจทย์งานอุตสาหกรรม ตั้งแต่เครื่องมือวัดไปจนถึงระบบอัตโนมัติ"
        : "Explore the main product and service categories built for industrial operations, from measuring instruments to automation systems."),
    cta: isThaiLocale ? "คำถามที่พบบ่อย - FAQs" : "Frequently asked questions - FAQs",
    eyebrow: isThaiLocale ? "หมวดหมู่สินค้าและบริการ" : "Business unit",
    heading:
      richTextToPlainText(
        getLocalizedText(locale, businessUnitSetting?.headlineTh, businessUnitSetting?.headlineEn),
      ) ||
      (isThaiLocale
        ? "หมวดหมู่สินค้าและบริการ"
        : "Industrial products and services categories"),
  };
}

function getCategoryCardCopy(category: CategoryRow, locale: Locale) {
  const name = richTextToPlainText(
    getLocalizedText(locale, category.nameTh, category.nameEn),
  );
  const description = richTextToPlainText(
    getLocalizedText(locale, category.descriptionTh, category.descriptionEn),
  );

  return {
    description,
    name,
  };
}

function getFallbackIcon(index: number) {
  return fallbackCategoryIcons[index % fallbackCategoryIcons.length] ?? "category";
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: HomeProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  const dictionary = getDictionary(locale);

  return {
    title: dictionary.metadataTitle,
    description: dictionary.metadataDescription,
    alternates: {
      languages: {
        th: "/th",
        en: "/en",
      },
    },
  };
}

export default async function Home({ params }: HomeProps) {
  const { locale } = await params;

  if (typeof locale !== "string" || !isLocale(locale)) {
    notFound();
  }

  const [homeSettingsResponse, categoriesResponse] = await Promise.all([
    fetchAdminList<HomeSettingRow>("/home-section-settings", {
      isActive: true,
      page: 1,
      pageSize: 20,
    }),
    fetchAdminList<CategoryRow>("/categories", {
      isActive: true,
      page: 1,
      pageSize: 100,
    }),
  ]);

  const heroSetting = homeSettingsResponse?.items.find((item) => item.name === "hero-banner");
  const businessUnitSetting = homeSettingsResponse?.items.find(
    (item) => item.name === "business-unit",
  );
  const heroImageUrl = heroSetting?.imgUrl?.[0]?.trim() || "/assets/hero-section-bg.svg";
  const heroContent = {
    eyebrow: "One Stop Service",
    heading: locale === "th"
      ? richTextToPlainText(heroSetting?.headlineTh) ||
        "ผู้จำหน่ายอุปกรณ์, เครื่องจักร, เครื่องมือ และเครื่องวัดวิทยาศาสตร์ ที่ใช้ในโรงงานอุตสาหกรรม ครบวงจร"
      : richTextToPlainText(heroSetting?.headlineEn) ||
        "Supplier of equipment, machinery, tools, and scientific instruments for industrial plants, all in one place",
    body: locale === "th"
      ? richTextToPlainText(heroSetting?.contentTh) ||
        "ครบทุกโซลูชันด้านโรงงานอุตสาหกรรม จากเครื่องมือวัดสู่ระบบอัตโนมัติ"
      : richTextToPlainText(heroSetting?.contentEn) ||
        "Complete industrial solutions, from measuring instruments to automation systems.",
    cta: locale === "th" ? "เลือกชมสินค้าและบริการ" : "Browse products and services",
    ctaHref: `/${locale}/products-services`,
  };
  const businessUnitContent = getHomeSectionContent({ businessUnitSetting, locale });
  const businessUnitCategories = (categoriesResponse?.items ?? [])
    .filter((item) => item.isActive)
    .sort((left, right) => left.rank - right.rank || left.nameTh.localeCompare(right.nameTh));

  return (
    <main className="site-shell">
      <SiteNavbar locale={locale} />
      <section
        className="home-hero"
        aria-labelledby="home-hero-title"
        style={{
          backgroundImage: `linear-gradient(90deg, rgb(10 18 42 / 68%) 0%, rgb(10 18 42 / 34%) 52%, rgb(10 18 42 / 8%) 100%), url("${heroImageUrl}")`,
        }}
      >
        <div className="home-hero-copy">
          <h1 id="home-hero-title" className="home-hero-heading">
            {heroContent.heading}
          </h1>
          <p className="home-hero-eyebrow">{heroContent.eyebrow}</p>
          <p className="home-hero-body">{heroContent.body}</p>
          <Link className="home-hero-cta" href={heroContent.ctaHref}>
            {heroContent.cta}
          </Link>
        </div>
      </section>

      <section className="home-business-unit" aria-labelledby="home-business-unit-title">
        <div className="home-business-unit-header">
          <div className="home-business-unit-copy">
            <h2 id="home-business-unit-title" className="home-business-unit-heading">
              {businessUnitContent.heading}
            </h2>
            <p className="home-business-unit-body">{businessUnitContent.body}</p>
          </div>
          <Link className="home-business-unit-cta" href={`/${locale}/products-services`}>
            {businessUnitContent.cta}
          </Link>
        </div>

        {businessUnitCategories.length > 0 ? (
          <div className="home-business-unit-grid">
            {businessUnitCategories.map((category, index) => {
              const cardCopy = getCategoryCardCopy(category, locale);
              const categoryHref = `/${locale}/products-services?categoryCode=${encodeURIComponent(category.code)}`;

              return (
                <Link
                  aria-label={`${cardCopy.name}${cardCopy.description ? ` - ${cardCopy.description}` : ""}`}
                  className="home-business-unit-card"
                  href={categoryHref}
                  key={category.code}
                >
                  <span className="home-business-unit-card-icon" aria-hidden="true">
                    {category.iconImgUrl ? (
                      <span
                        className="home-business-unit-card-image"
                        style={{ backgroundImage: `url("${encodeURI(category.iconImgUrl)}")` }}
                      />
                    ) : (
                      <span className="material-symbols-outlined home-business-unit-card-symbol">
                        {getFallbackIcon(index)}
                      </span>
                    )}
                  </span>
                  <span className="home-business-unit-card-copy">
                    <strong className="home-business-unit-card-title">{cardCopy.name}</strong>
                  </span>
                </Link>
              );
            })}
          </div>
        ) : null}
      </section>
    </main>
  );
}
