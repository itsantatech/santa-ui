import { notFound } from "next/navigation";
import { connection } from "next/server";
import { OrderDetailContent } from "@/components/order-detail-content";
import { OrderSummaryPrintButton } from "@/components/order-summary-print-button";
import { SiteNavbar } from "@/components/site-navbar";
import { getSession, requireCustomerSession } from "@/lib/auth/keycloak";
import { isLocale } from "@/lib/i18n";

export default async function OrderPage({ params }: { params: Promise<{ locale: string; orderCode: string }> }) {
  await connection();
  const { locale, orderCode } = await params;
  if (!isLocale(locale)) notFound();
  const staffView = Boolean((await getSession())?.isAdmin);
  if (!staffView) await requireCustomerSession({ returnTo: `/${locale}/orders/${orderCode}` });
  return <main className="site-shell"><SiteNavbar locale={locale} /><section className="cart-page"><nav className="products-page-breadcrumb"><span>{locale === "th" ? "หน้าแรก" : "Home"}</span><span>&gt;</span><span>{staffView ? (locale === "th" ? "คำสั่งซื้อ" : "Orders") : (locale === "th" ? "บัญชีของฉัน" : "My account")}</span><span>&gt;</span><span>{orderCode}</span></nav><div className="order-detail-heading"><h1>{locale === "th" ? `คำสั่งซื้อ ${orderCode}` : `Order ${orderCode}`}</h1>{staffView ? <OrderSummaryPrintButton locale={locale} /> : null}</div><OrderDetailContent locale={locale} orderCode={orderCode} staffView={staffView} /></section></main>;
}
