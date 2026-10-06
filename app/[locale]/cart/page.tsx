import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { CartContent } from "@/components/cart-content";
import { SiteNavbar } from "@/components/site-navbar";
import { requireCustomerSession } from "@/lib/auth/keycloak";
import { isLocale } from "@/lib/i18n";

type CartPageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: CartPageProps): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "en" ? "Shopping cart" : "ตะกร้าสินค้า", robots: { index: false, follow: false } };
}

export default async function CartPage({ params }: CartPageProps) {
  await connection();
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  await requireCustomerSession({ returnTo: `/${locale}/cart` });
  return <main className="site-shell"><SiteNavbar locale={locale} /><section className="cart-page"><nav className="products-page-breadcrumb" aria-label="Breadcrumb"><span>{locale === "th" ? "หน้าแรก" : "Home"}</span><span aria-hidden="true">&gt;</span><span>{locale === "th" ? "ตะกร้าสินค้า" : "Shopping cart"}</span></nav><h1>{locale === "th" ? "ตะกร้าสินค้า" : "Shopping cart"}</h1><CartContent locale={locale} /></section></main>;
}
