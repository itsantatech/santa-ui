import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AboutPageContent } from "@/components/public-content";
import { SiteFooter } from "@/components/site-footer";
import { SiteNavbar } from "@/components/site-navbar";
import { fetchAboutPageSetting, fetchPublicChrome } from "@/lib/public-content";
import { isLocale, locales } from "@/lib/i18n";

type LocalePageProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LocalePageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  return {
    title: locale === "th" ? "เกี่ยวกับเรา" : "About Us",
    description: locale === "th" ? "เกี่ยวกับเรา" : "About Us",
  };
}

export default async function AboutUsPage({ params }: LocalePageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const [{ categories, socialContacts }, aboutSetting] = await Promise.all([
    fetchPublicChrome(),
    fetchAboutPageSetting(),
  ]);

  return (
    <main className="site-shell">
      <SiteNavbar locale={locale} />
      <AboutPageContent locale={locale} setting={aboutSetting} socialContacts={socialContacts} />
      <SiteFooter categories={categories} locale={locale} socialContacts={socialContacts} />
    </main>
  );
}
