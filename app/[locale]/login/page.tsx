import { notFound } from "next/navigation";
import { CustomerAuthForm } from "@/components/customer-auth-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteNavbar } from "@/components/site-navbar";
import { isLocale } from "@/lib/i18n";
import { fetchPublicChrome } from "@/lib/public-content";

export default async function LoginPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ error?: "client" | "credentials" | "missing" | "unavailable"; returnTo?: string }> }) { const { locale } = await params; if (!isLocale(locale)) notFound(); const { error, returnTo } = await searchParams; const safeReturnTo = returnTo?.startsWith(`/${locale}/`) ? returnTo : `/${locale}/profile`; const { categories, socialContacts } = await fetchPublicChrome(); return <main className="site-shell"><SiteNavbar locale={locale} /><CustomerAuthForm error={error} locale={locale} mode="login" returnTo={safeReturnTo} /><SiteFooter categories={categories} locale={locale} socialContacts={socialContacts} /></main>; }
