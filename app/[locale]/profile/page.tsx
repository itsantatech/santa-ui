import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { CustomerAccountContent } from "@/components/customer-account-content";
import { SiteFooter } from "@/components/site-footer";
import { SiteNavbar } from "@/components/site-navbar";
import { requireCustomerSession } from "@/lib/auth/keycloak";
import { fetchPublicChrome } from "@/lib/public-content";
import { isLocale, locales } from "@/lib/i18n";

type PageProps = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? { title: locale === "th" ? "ข้อมูลโปรไฟล์" : "Profile", robots: { index: false, follow: false } } : {};
}

export default async function ProfilePage({ params }: PageProps) {
  await connection();
  const { locale } = await params;

  if (!isLocale(locale)) notFound();

  const [session, { categories, socialContacts }] = await Promise.all([
    requireCustomerSession({ returnTo: `/${locale}/profile`, forbiddenRedirectTo: `/${locale}` }),
    fetchPublicChrome(),
  ]);

  return <main className="site-shell"><SiteNavbar locale={locale} /><CustomerAccountContent locale={locale} session={session} /><SiteFooter categories={categories} locale={locale} socialContacts={socialContacts} /></main>;
}
