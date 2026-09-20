import { notFound } from "next/navigation";
import { OrderDetailContent } from "@/components/order-detail-content";
import { SiteNavbar } from "@/components/site-navbar";
import { requireCustomerSession } from "@/lib/auth/keycloak";
import { isLocale } from "@/lib/i18n";

export default async function OrderPage({ params }: { params: Promise<{ locale: string; orderCode: string }> }) {
  const { locale, orderCode } = await params;
  if (!isLocale(locale)) notFound();
  await requireCustomerSession({ returnTo: `/${locale}/orders/${orderCode}` });
  return <main className="site-shell"><SiteNavbar locale={locale} /><section className="cart-page"><nav className="products-page-breadcrumb"><span>{locale === "th" ? "หน้าแรก" : "Home"}</span><span>&gt;</span><span>{locale === "th" ? "บัญชีของฉัน" : "My account"}</span><span>&gt;</span><span>{orderCode}</span></nav><h1>{locale === "th" ? `คำสั่งซื้อ ${orderCode}` : `Order ${orderCode}`}</h1><OrderDetailContent locale={locale} orderCode={orderCode} /></section></main>;
}
