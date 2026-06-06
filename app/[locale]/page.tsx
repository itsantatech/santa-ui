import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteNavbar } from "@/components/site-navbar";
import { fetchAdminList } from "@/lib/admin-api";
import { getDictionary, isLocale, locales } from "@/lib/i18n";

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
  isActive: boolean;
};

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

  const isThaiLocale = locale === "th";
  const homeSettingsResponse = await fetchAdminList<HomeSettingRow>(
    "/home-section-settings",
    {
      isActive: true,
      page: 1,
      pageSize: 20,
    },
  );
  const heroSetting = homeSettingsResponse?.items.find((item) => item.name === "hero-banner");
  const heroContent = {
    eyebrow: "One Stop Service",
    heading: isThaiLocale
      ? richTextToPlainText(heroSetting?.headlineTh) ||
        "ผู้จำหน่ายอุปกรณ์, เครื่องจักร, เครื่องมือ และเครื่องวัดวิทยาศาสตร์ ที่ใช้ในโรงงานอุตสาหกรรม ครบวงจร"
      : richTextToPlainText(heroSetting?.headlineEn) ||
        "Supplier of equipment, machinery, tools, and scientific instruments for industrial plants, all in one place",
    body: isThaiLocale
      ? richTextToPlainText(heroSetting?.contentTh) ||
        "ครบทุกโซลูชันด้านโรงงานอุตสาหกรรม จากเครื่องมือวัดสู่ระบบอัตโนมัติ"
      : richTextToPlainText(heroSetting?.contentEn) ||
        "Complete industrial solutions, from measuring instruments to automation systems.",
    cta: isThaiLocale ? "เลือกชมสินค้าและบริการ" : "Browse products and services",
    ctaHref: `/${locale}/products-services`,
  };

  return (
    <main className="site-shell">
      <SiteNavbar locale={locale} />
      <section className="home-hero" aria-labelledby="home-hero-title">
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
    </main>
  );
}
