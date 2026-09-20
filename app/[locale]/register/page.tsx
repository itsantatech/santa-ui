import { notFound } from "next/navigation";
import { CustomerAuthForm } from "@/components/customer-auth-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteNavbar } from "@/components/site-navbar";
import { isLocale } from "@/lib/i18n";
import { fetchPublicChrome } from "@/lib/public-content";
import type { Metadata } from "next";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function RegisterPage({ params }: { params: Promise<{ locale: string }> }) { const { locale } = await params; if (!isLocale(locale)) notFound(); const { categories, socialContacts } = await fetchPublicChrome(); return <main className="site-shell"><SiteNavbar locale={locale} /><CustomerAuthForm locale={locale} mode="register" /><SiteFooter categories={categories} locale={locale} socialContacts={socialContacts} /></main>; }
