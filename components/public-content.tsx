import Image from "next/image";
import Link from "next/link";
import { ProductListPagination } from "@/components/product-list-pagination";
import { PublicMediaCarousel } from "@/components/public-media-carousel";
import {
  createContentExcerpt,
  estimateReadingTime,
  formatContentDate,
  type FooterSocialContact,
  getLocalizedContent,
  stripHtmlToPlainText,
  type AboutPageSetting,
  type PublicContentItem,
} from "@/lib/public-content";
import type { Locale } from "@/lib/i18n";

export function PublicContentList({
  currentPage,
  description,
  emptyLabel,
  getPageHref,
  items,
  locale,
  searchParams,
  sectionLabel,
  title,
  totalPages,
  type,
}: {
  currentPage: number;
  description: string;
  emptyLabel: string;
  getPageHref: (page: number) => string;
  items: PublicContentItem[];
  locale: Locale;
  searchParams: Record<string, string | string[] | undefined>;
  sectionLabel: string;
  title: string;
  totalPages: number;
  type: "articles" | "news-and-activities";
}) {
  const currentSort = typeof searchParams.sort === "string" ? searchParams.sort : "latest";

  return (
    <section className="products-page-section">
      <div className="products-page-shell">
        <nav className="products-page-breadcrumb" aria-label="Breadcrumb">
          <Link href={`/${locale}`}>{locale === "th" ? "หน้าแรก" : "Home"}</Link>
          <span aria-hidden="true">&gt;</span>
          <span>{sectionLabel}</span>
        </nav>

        <div className="public-content-heading-row">
          <div className="public-content-heading-copy">
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          <form className="public-content-sort-form" method="get">
            <label className="sr-only" htmlFor={`content-sort-${type}`}>
              {locale === "th" ? "เรียงลำดับ" : "Sort content"}
            </label>
            <select defaultValue={currentSort} id={`content-sort-${type}`} name="sort">
              <option value="latest">{locale === "th" ? "เรียงตามใหม่ล่าสุด" : "Latest first"}</option>
              <option value="oldest">{locale === "th" ? "เรียงตามเก่าสุด" : "Oldest first"}</option>
              <option value="title-asc">{locale === "th" ? "เรียงชื่อ ก-ฮ" : "Title A-Z"}</option>
              <option value="title-desc">{locale === "th" ? "เรียงชื่อ ฮ-ก" : "Title Z-A"}</option>
              <option value="rank-asc">{locale === "th" ? "เรียงตามลำดับ" : "Rank order"}</option>
            </select>
            <button type="submit">{locale === "th" ? "ใช้" : "Apply"}</button>
          </form>
        </div>

        {items.length > 0 ? (
          <div className="public-content-grid">
            {items.map((item) => (
              <article className="public-content-card" key={item.id}>
                <Link
                  className="public-content-card-media"
                  href={`/${locale}/${type}/${encodeURIComponent(item.slug)}`}
                >
                  {item.imgUrl[0]?.trim() ? (
                    <Image
                      alt={getLocalizedContent(item, locale).topic}
                      className="public-content-card-image"
                      fill
                      sizes="(max-width: 900px) 100vw, 33vw"
                      src={item.imgUrl[0]}
                      unoptimized
                    />
                  ) : (
                    <div className="public-content-card-placeholder">
                      <span>{sectionLabel}</span>
                    </div>
                  )}
                </Link>
                <div className="public-content-card-body">
                  <span className="public-content-card-type">{sectionLabel}</span>
                  <div className="public-content-card-meta">
                    <span>{formatContentDate(item.createdAt ?? item.updatedAt, locale)}</span>
                    <span aria-hidden="true">·</span>
                    <span>{estimateReadingTime(locale === "th" ? item.contentTh : item.contentEn, locale)}</span>
                  </div>
                  <h2>
                    <Link href={`/${locale}/${type}/${encodeURIComponent(item.slug)}`}>
                      {getLocalizedContent(item, locale).topic}
                    </Link>
                  </h2>
                  <p>
                    {createContentExcerpt(
                      locale === "th" ? item.contentTh : item.contentEn,
                      150,
                    )}
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="products-page-empty">{emptyLabel}</div>
        )}

        {totalPages > 1 ? (
          <ProductListPagination
            currentPage={currentPage}
            getPageHref={getPageHref}
            locale={locale}
            totalPages={totalPages}
          />
        ) : null}
      </div>
    </section>
  );
}

export function PublicContentDetail({
  item,
  locale,
  mediaVariant = "detail",
  sectionHref,
  sectionLabel,
}: {
  item: PublicContentItem;
  locale: Locale;
  mediaVariant?: "about" | "detail";
  sectionHref: string;
  sectionLabel: string;
}) {
  const localized = getLocalizedContent(item, locale);

  return (
    <section className="products-page-section">
      <div className="products-page-shell">
        <nav className="products-page-breadcrumb" aria-label="Breadcrumb">
          <Link href={`/${locale}`}>{locale === "th" ? "หน้าแรก" : "Home"}</Link>
          <span aria-hidden="true">&gt;</span>
          <Link href={sectionHref}>{sectionLabel}</Link>
          <span aria-hidden="true">&gt;</span>
          <span>{localized.topic}</span>
        </nav>

        <header className="public-detail-header">
          <h1>{localized.topic}</h1>
          <div className="public-detail-meta">
            <span>{formatContentDate(item.createdAt ?? item.updatedAt, locale)}</span>
            <span aria-hidden="true">·</span>
            <span>{estimateReadingTime(localized.content, locale)}</span>
          </div>
        </header>

        <div className="public-detail-layout">
          {item.imgUrl.length > 0 ? (
            <PublicMediaCarousel
              alt={localized.topic}
              locale={locale}
              media={item.imgUrl}
              variant={mediaVariant}
            />
          ) : null}
          <article className="public-richtext" dangerouslySetInnerHTML={{ __html: localized.content }} />
        </div>
      </div>
    </section>
  );
}

export function AboutPageContent({
  locale,
  setting,
  socialContacts,
}: {
  locale: Locale;
  setting: AboutPageSetting | null;
  socialContacts: FooterSocialContact[];
}) {
  const headline = setting
    ? (
        locale === "th"
          ? setting.headlineTh
          : setting.headlineEn.trim() || setting.headlineTh
      ).trim() || (locale === "th" ? "เกี่ยวกับเรา" : "About Us")
    : locale === "th"
      ? "เกี่ยวกับเรา"
      : "About Us";
  const richText = setting
    ? locale === "th"
      ? setting.contentTh
      : setting.contentEn
    : "";
  const media = setting?.imgUrl ?? [];
  const lineUrl =
    socialContacts.find(
      (item) =>
        item.isActive &&
        item.code === "SM-LINE" &&
        item.contactUrl.trim().length > 0,
    )?.contactUrl.trim() ?? null;

  return (
    <section className="products-page-section">
      <div className="products-page-shell">
        <nav className="products-page-breadcrumb" aria-label="Breadcrumb">
          <Link href={`/${locale}`}>{locale === "th" ? "หน้าแรก" : "Home"}</Link>
          <span aria-hidden="true">&gt;</span>
          <span>{locale === "th" ? "เกี่ยวกับเรา" : "About Us"}</span>
        </nav>

        <div className="about-page-hero">
          <div className="about-page-copy">
            <h1 dangerouslySetInnerHTML={{ __html: normalizeHeadlineHtml(headline) }} />
            <div className="about-page-actions">
              {lineUrl ? (
                <a
                  className="about-page-cta"
                  href={lineUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  {locale === "th" ? "ปรึกษาเราตอนนี้" : "Consult Us Now"}
                </a>
              ) : null}
              <Link className="about-page-cta" href={`/${locale}/news-and-activities`}>
                {locale === "th" ? "ดูผลงานของเรา" : "View Our Work"}
              </Link>
            </div>
          </div>
          {media.length > 0 ? (
            <PublicMediaCarousel alt={headline} locale={locale} media={media} variant="about" />
          ) : null}
        </div>

        <article
          className="public-richtext about-page-richtext"
          dangerouslySetInnerHTML={{ __html: normalizeRichTextHtml(richText) }}
        />
      </div>
    </section>
  );
}

function normalizeRichTextHtml(value?: string | null) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return `<p>${stripHtmlToPlainText(value) || "-"}</p>`;
  }

  return trimmed.includes("<") ? trimmed : `<p>${trimmed}</p>`;
}

function normalizeHeadlineHtml(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "About Us";
  }

  if (trimmed.includes("<")) {
    return trimmed;
  }

  return escapeHtml(trimmed)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join("<br>");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
