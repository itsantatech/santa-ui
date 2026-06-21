import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  HomeRecommendedProducts,
  type RecommendedProductTab,
} from "@/components/home-recommended-products";
import { SiteFooter } from "@/components/site-footer";
import { SiteNavbar } from "@/components/site-navbar";
import type { ProductCardData } from "@/components/product-card";
import { fetchAdminList } from "@/lib/admin-api";
import { getDictionary, isLocale, locales, type Locale } from "@/lib/i18n";
import {
  createContentExcerpt,
  fetchPublicContentList,
  formatContentDate,
  type PublicContentItem,
} from "@/lib/public-content";

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

type BrandRow = {
  code: string;
  rank: number;
  nameTh: string;
  nameEn: string;
  slug: string;
  imgUrl: string | null;
  isActive: boolean;
};

type SocialContactRow = {
  code: string;
  contactUrl: string;
  isActive: boolean;
};

type ProductRow = ProductCardData & {
  rank: number;
  isActive: boolean;
  isNewProduct: boolean;
  isBestSeller: boolean;
  isPromotion: boolean;
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

function getAboutSantaContent({
  aboutSantaSetting,
  locale,
}: {
  aboutSantaSetting?: HomeSettingRow | null;
  locale: Locale;
}) {
  const isThaiLocale = locale === "th";

  return {
    body:
      richTextToPlainText(
        getLocalizedText(locale, aboutSantaSetting?.contentTh, aboutSantaSetting?.contentEn),
      ) ||
      (isThaiLocale
        ? "ผู้นำเข้าและตัวแทนจำหน่ายเครื่องมืออุตสาหกรรม ระบบวิทยาศาสตร์ และโซลูชันอัตโนมัติ พร้อมทีมงานมืออาชีพและบริการหลังการขายครบวงจร"
        : "Importer and distributor of industrial instruments, scientific systems, and automation solutions backed by experienced teams and end-to-end after-sales service."),
    cta: isThaiLocale ? "เกี่ยวกับเรา" : "About us",
    heading:
      richTextToPlainText(
        getLocalizedText(locale, aboutSantaSetting?.headlineTh, aboutSantaSetting?.headlineEn),
      ) || "Santa Technology",
    imageUrl: aboutSantaSetting?.imgUrl?.[0]?.trim() || "/assets/about-santa-section.svg",
  };
}

function getBrandSectionContent({
  brandSetting,
  locale,
}: {
  brandSetting?: HomeSettingRow | null;
  locale: Locale;
}) {
  const isThaiLocale = locale === "th";

  return {
    body: isThaiLocale
      ? richTextToPlainText(brandSetting?.contentTh) ||
        "เราเป็นตัวแทนจำหน่ายอย่างเป็นทางการจากแบรนด์มาตรฐานสากลทั่วโลก ครอบคลุมทั้งภาคอุตสาหกรรม โรงงาน และหน่วยงานราชการ พร้อมส่งมอบสินค้าคุณภาพสูงและบริการหลังการขายโดยทีมวิศวกรผู้เชี่ยวชาญ"
      : richTextToPlainText(brandSetting?.contentEn) ||
        "We are an authorized distributor for leading global brands serving industrial, factory, and government sectors with high-quality products and expert after-sales support.",
    cta: isThaiLocale ? "ดูแบรนด์ทั้งหมด" : "Browse all brands",
    heading: isThaiLocale
      ? richTextToPlainText(brandSetting?.headlineTh) || "แบรนด์ชั้นนำที่เราคัดสรรมาเพื่อคุณ"
      : richTextToPlainText(brandSetting?.headlineEn) || "Leading brands we selected for you",
  };
}

function getNewsSectionContent({
  locale,
  newsSetting,
}: {
  locale: Locale;
  newsSetting?: HomeSettingRow | null;
}) {
  const isThaiLocale = locale === "th";

  return {
    body:
      richTextToPlainText(
        getLocalizedText(locale, newsSetting?.contentTh, newsSetting?.contentEn),
      ) ||
      (isThaiLocale
        ? "ติดตามข่าวสารและกิจกรรมของเรา พร้อมอัปเดตนวัตกรรมใหม่ ๆ ในแวดวงอุตสาหกรรมอย่างต่อเนื่อง"
        : "Follow our latest news, activities, and ongoing industrial innovation updates."),
    cta: isThaiLocale ? "ดูข่าวสารและกิจกรรมทั้งหมด" : "View all news & activities",
    heading:
      richTextToPlainText(
        getLocalizedText(locale, newsSetting?.headlineTh, newsSetting?.headlineEn),
      ) || (isThaiLocale ? "ข่าวสารและกิจกรรมล่าสุด" : "Latest News & Activities"),
    listCta: isThaiLocale ? "อ่านเพิ่มเติม" : "Read more",
    listTypeLabel: isThaiLocale ? "ข่าวสารกิจกรรม" : "News & Activities",
  };
}

function getRecommendedSectionContent({
  locale,
  recommendedSetting,
}: {
  locale: Locale;
  recommendedSetting?: HomeSettingRow | null;
}) {
  const isThaiLocale = locale === "th";

  return {
    body:
      richTextToPlainText(
        getLocalizedText(
          locale,
          recommendedSetting?.contentTh,
          recommendedSetting?.contentEn,
        ),
      ) ||
      (isThaiLocale
        ? "คัดสรรสินค้าเด่นและโซลูชันที่ตอบโจทย์งานอุตสาหกรรม เพื่อเพิ่มประสิทธิภาพการทำงานของคุณ"
        : "Explore standout products and industrial solutions selected to improve your workflow."),
    cta: isThaiLocale ? "ดูสินค้าและบริการทั้งหมด" : "View all products & services",
    empty: isThaiLocale ? "ยังไม่มีสินค้าแนะนำในหมวดนี้" : "No recommended products in this category",
    heading:
      richTextToPlainText(
        getLocalizedText(
          locale,
          recommendedSetting?.headlineTh,
          recommendedSetting?.headlineEn,
        ),
      ) || (isThaiLocale ? "สินค้าแนะนำที่คุณไม่ควรพลาด" : "Recommended Products You Shouldn't Miss"),
    tabs: {
      bestSeller: isThaiLocale ? "สินค้ายอดนิยม" : "Best sellers",
      newProduct: isThaiLocale ? "สินค้าใหม่ล่าสุด" : "New arrivals",
      promotion: isThaiLocale ? "ราคาพิเศษและส่วนลด" : "Special offers",
    },
  };
}

function getFaqSectionContent(locale: Locale) {
  return locale === "th"
    ? {
        body: "ดูคำถามที่พบบ่อย\nหรือ ติดต่อทีมผู้เชี่ยวชาญของเรา",
        cta: "คำถามที่พบบ่อย",
        heading: "ยังมีข้อสงสัย?",
      }
    : {
        body: "Browse frequently asked questions\nor contact our team of specialists",
        cta: "Frequently asked questions",
        heading: "Still have questions?",
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

function normalizeHomeSectionKey(name?: string | null) {
  return name?.trim().toLowerCase().replace(/[_\s-]+/g, " ") ?? "";
}

function getContentPublishedAt(item: Pick<PublicContentItem, "createdAt" | "updatedAt">) {
  return item.createdAt ?? item.updatedAt ?? "";
}

function getNewsActivityHref(locale: Locale, item: Pick<PublicContentItem, "slug">) {
  const slug = item.slug?.trim();

  if (!slug) {
    return `/${locale}/news-and-activities`;
  }

  return `/${locale}/news-and-activities/${encodeURIComponent(slug)}`;
}

function compareContentByLatest(
  left: Pick<PublicContentItem, "createdAt" | "updatedAt" | "id">,
  right: Pick<PublicContentItem, "createdAt" | "updatedAt" | "id">,
) {
  const leftTime = Date.parse(getContentPublishedAt(left));
  const rightTime = Date.parse(getContentPublishedAt(right));
  const normalizedLeftTime = Number.isNaN(leftTime) ? 0 : leftTime;
  const normalizedRightTime = Number.isNaN(rightTime) ? 0 : rightTime;

  if (normalizedLeftTime !== normalizedRightTime) {
    return normalizedRightTime - normalizedLeftTime;
  }

  return right.id.localeCompare(left.id);
}

function compareProductsByRank(left: ProductRow, right: ProductRow) {
  if (left.rank !== right.rank) {
    return right.rank - left.rank;
  }

  return left.sku.localeCompare(right.sku);
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

  const [
    homeSettingsResponse,
    categoriesResponse,
    brandsResponse,
    socialContactsResponse,
    newsAndActivitiesResponse,
    productsResponse,
  ] = await Promise.all([
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
    fetchAdminList<BrandRow>("/brands", {
      isActive: true,
      page: 1,
      pageSize: 36,
    }),
    fetchAdminList<SocialContactRow>("/social-media-contacts", {
      isActive: true,
      page: 1,
      pageSize: 20,
    }),
    fetchPublicContentList("news-and-activities", {
      isActive: true,
      page: 1,
      pageSize: 12,
    }),
    fetchAdminList<ProductRow>("/products", {
      isActive: true,
      page: 1,
      pageSize: 100,
      sortBy: "rank",
      sortOrder: "desc",
    }),
  ]);

  const heroSetting = homeSettingsResponse?.items.find((item) => item.name === "hero-banner");
  const businessUnitSetting = homeSettingsResponse?.items.find(
    (item) => item.name === "business-unit",
  );
  const aboutSantaSetting = homeSettingsResponse?.items.find((item) => item.name === "about-santa");
  const brandSetting = homeSettingsResponse?.items.find((item) => item.name === "brand");
  const newsSetting = homeSettingsResponse?.items.find((item) =>
    normalizeHomeSectionKey(item.name).includes("news"),
  );
  const recommendedSetting = homeSettingsResponse?.items.find((item) =>
    normalizeHomeSectionKey(item.name).includes("recommend"),
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
  const aboutSantaContent = getAboutSantaContent({ aboutSantaSetting, locale });
  const brandSectionContent = getBrandSectionContent({ brandSetting, locale });
  const newsSectionContent = getNewsSectionContent({ locale, newsSetting });
  const recommendedSectionContent = getRecommendedSectionContent({
    locale,
    recommendedSetting,
  });
  const faqSectionContent = getFaqSectionContent(locale);
  const businessUnitCategories = (categoriesResponse?.items ?? [])
    .filter((item) => item.isActive)
    .sort((left, right) => left.rank - right.rank || left.nameTh.localeCompare(right.nameTh));
  const featuredBrands = (brandsResponse?.items ?? [])
    .filter((item) => item.isActive && item.imgUrl)
    .sort((left, right) => right.rank - left.rank || left.code.localeCompare(right.code))
    .slice(0, 36);
  const latestNewsAndActivities = (newsAndActivitiesResponse?.items ?? [])
    .filter((item) => item.isActive)
    .sort(compareContentByLatest);
  const featuredNewsAndActivities = latestNewsAndActivities.slice(0, 2);
  const listedNewsAndActivities = latestNewsAndActivities.slice(2, 12);
  const recommendedProducts = (productsResponse?.items ?? [])
    .filter((item) => item.isActive)
    .sort(compareProductsByRank);
  const recommendedProductTabs: RecommendedProductTab[] = [
    {
      key: "new-product",
      label: recommendedSectionContent.tabs.newProduct,
      products: recommendedProducts.filter((item) => item.isNewProduct),
    },
    {
      key: "best-seller",
      label: recommendedSectionContent.tabs.bestSeller,
      products: recommendedProducts.filter((item) => item.isBestSeller),
    },
    {
      key: "promotion",
      label: recommendedSectionContent.tabs.promotion,
      products: recommendedProducts.filter((item) => item.isPromotion),
    },
  ];

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
          <Link className="home-business-unit-cta" href={`/${locale}/faqs`}>
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

      <section
        className="home-about-santa"
        id="home-about-santa"
        aria-labelledby="home-about-santa-title"
      >
        <div className="home-about-santa-media">
          <Image
            alt={aboutSantaContent.heading}
            className="home-about-santa-image"
            fill
            priority={false}
            sizes="(max-width: 1024px) 100vw, 52vw"
            src={aboutSantaContent.imageUrl}
            unoptimized
          />
        </div>
        <div className="home-about-santa-copy">
          <h2 id="home-about-santa-title" className="home-about-santa-heading">
            {aboutSantaContent.heading}
          </h2>
          <p className="home-about-santa-body">{aboutSantaContent.body}</p>
          <span className="home-about-santa-cta">{aboutSantaContent.cta}</span>
        </div>
      </section>

      <section
        className="home-brand-section"
        id="home-brand-section"
        aria-labelledby="home-brand-section-title"
      >
        <div className="home-brand-section-copy">
          <h2 id="home-brand-section-title" className="home-brand-section-heading">
            {brandSectionContent.heading}
          </h2>
          <p className="home-brand-section-body">{brandSectionContent.body}</p>
        </div>

        {featuredBrands.length > 0 ? (
          <div className="home-brand-grid">
            {featuredBrands.map((brand) => (
              <div className="home-brand-card" key={brand.code}>
                <div className="home-brand-card-media">
                  <Image
                    alt={getLocalizedText(locale, brand.nameTh, brand.nameEn)}
                    className="home-brand-card-image"
                    fill
                    sizes="(max-width: 1024px) 25vw, 8vw"
                    src={brand.imgUrl ?? ""}
                    unoptimized
                  />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <Link className="home-brand-section-cta" href={`/${locale}/products-services`}>
          {brandSectionContent.cta}
        </Link>
      </section>

      <section
        className="home-news-section"
        id="home-news-section"
        aria-labelledby="home-news-section-title"
      >
        <div className="home-news-section-copy">
          <h2 id="home-news-section-title" className="home-news-section-heading">
            {newsSectionContent.heading}
          </h2>
          <p className="home-news-section-body">{newsSectionContent.body}</p>
        </div>

        {featuredNewsAndActivities.length > 0 ? (
          <div className="home-news-featured-grid">
            {featuredNewsAndActivities.map((item) => {
              const newsHref = getNewsActivityHref(locale, item);
              const topic = getLocalizedText(locale, item.topicTh, item.topicEn);
              const excerpt = createContentExcerpt(
                locale === "th" ? item.contentTh : item.contentEn,
                150,
              );

              return (
                <article className="home-news-card" key={item.id}>
                  <Link className="home-news-card-media" href={newsHref}>
                    {item.imgUrl[0]?.trim() ? (
                      <Image
                        alt={topic}
                        className="home-news-card-image"
                        fill
                        sizes="(max-width: 760px) 100vw, 50vw"
                        src={item.imgUrl[0]}
                        unoptimized
                      />
                    ) : (
                      <div className="home-news-card-placeholder">
                        <span>{newsSectionContent.listTypeLabel}</span>
                      </div>
                    )}
                  </Link>
                  <div className="home-news-card-copy">
                    <div className="home-news-card-side">
                      <span className="home-news-card-type">{newsSectionContent.listTypeLabel}</span>
                      <time
                        className="home-news-card-date"
                        dateTime={getContentPublishedAt(item)}
                      >
                        <span
                          aria-hidden="true"
                          className="material-symbols-outlined home-news-card-date-icon"
                        >
                          calendar_month
                        </span>
                        {formatContentDate(getContentPublishedAt(item), locale)}
                      </time>
                    </div>
                    <div className="home-news-card-main">
                      <h3 className="home-news-card-title">
                        <Link href={newsHref}>{topic}</Link>
                      </h3>
                      <p className="home-news-card-excerpt">{excerpt}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}

        {listedNewsAndActivities.length > 0 ? (
          <div className="home-news-list" role="list">
            {listedNewsAndActivities.map((item) => {
              const newsHref = getNewsActivityHref(locale, item);
              const topic = getLocalizedText(locale, item.topicTh, item.topicEn);

              return (
                <article className="home-news-list-item" key={item.id} role="listitem">
                  <Link className="home-news-list-title" href={newsHref}>
                    {topic}
                  </Link>
                  <time className="home-news-list-date" dateTime={getContentPublishedAt(item)}>
                    {formatContentDate(getContentPublishedAt(item), locale)}
                  </time>
                  <Link className="home-news-list-cta" href={newsHref}>
                    {newsSectionContent.listCta}
                  </Link>
                </article>
              );
            })}
          </div>
        ) : null}

        <Link className="home-news-section-cta" href={`/${locale}/news-and-activities`}>
          {newsSectionContent.cta}
        </Link>
      </section>

      <section
        className="home-recommended-section"
        id="home-recommended-section"
        aria-labelledby="home-recommended-section-title"
      >
        <div className="home-recommended-section-copy">
          <h2
            id="home-recommended-section-title"
            className="home-recommended-section-heading"
          >
            {recommendedSectionContent.heading}
          </h2>
          <p className="home-recommended-section-body">{recommendedSectionContent.body}</p>
        </div>

        <HomeRecommendedProducts
          ctaHref={`/${locale}/products`}
          ctaLabel={recommendedSectionContent.cta}
          emptyLabel={recommendedSectionContent.empty}
          locale={locale}
          tabs={recommendedProductTabs}
        />
      </section>

      <section
        className="home-faq-section"
        id="home-faq-section"
        aria-labelledby="home-faq-section-title"
      >
        <Image
          alt={faqSectionContent.heading}
          className="home-faq-section-image"
          fill
          priority={false}
          sizes="100vw"
          src="/assets/faq-section.svg"
          unoptimized
        />
        <div className="home-faq-section-overlay" />
        <div className="home-faq-section-copy">
          <h2 id="home-faq-section-title" className="home-faq-section-heading">
            {faqSectionContent.heading}
          </h2>
          <p className="home-faq-section-body">{faqSectionContent.body}</p>
          <span className="home-faq-section-cta">{faqSectionContent.cta}</span>
        </div>
      </section>

      <SiteFooter
        categories={businessUnitCategories}
        locale={locale}
        socialContacts={socialContactsResponse?.items ?? []}
      />
    </main>
  );
}
