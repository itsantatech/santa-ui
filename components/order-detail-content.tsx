"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { OmiseCheckoutButton } from "@/components/omise-checkout-button";
import { productPath } from "@/lib/paths";

type Locale = "th" | "en";
type Item = { id: string; productSku: string; productSlug: string; productNameTh: string; productNameEn: string; productImageUrl: string | null; unitPrice: number; quantity: number; lineTotal: number };
type DeliveryAddress = { recipientName: string; phoneNumber: string; addressLine1: string; addressLine2?: string | null; subdistrict: string; district: string; province: string; postalCode: string };
type Order = { orderCode: string; paymentStatus: string; fulfillmentStatus: string; reservationExpiresAt: string | null; trackingNumber: string | null; deliveryAddress?: DeliveryAddress | null; items: Item[]; summary: { subtotal: number; deliveryFee: number; discount: number; taxRate: number; taxAmount: number; grandTotal: number } };

export function OrderDetailContent({ locale, orderCode, staffView = false }: { locale: Locale; orderCode: string; staffView?: boolean }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState(false);
  const load = useCallback(async () => {
    try {
      const response = await fetch(`${staffView ? "/api/orders/admin" : "/api/orders"}/${encodeURIComponent(orderCode)}`, { cache: "no-store" });
      if (!response.ok) throw new Error();
      setOrder(await response.json() as Order);
    } catch { setError(true); }
  }, [orderCode, staffView]);
  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(timer); }, [load]);
  if (error) return <p className="cart-status">{locale === "th" ? "ไม่พบคำสั่งซื้อ" : "Order not found."}</p>;
  if (!order) return <p className="cart-status">{locale === "th" ? "กำลังโหลดคำสั่งซื้อ..." : "Loading order..."}</p>;
  return <>
    <div className="order-statuses"><Status locale={locale} label={locale === "th" ? "การชำระเงิน" : "Payment"} value={order.paymentStatus} /><Status locale={locale} label={locale === "th" ? "การจัดส่ง" : "Fulfillment"} value={order.fulfillmentStatus} /></div>
    <div className="cart-layout"><section className="cart-items">{order.items.map((item) => <OrderItem item={item} key={item.id} locale={locale} />)}</section><aside className="cart-summary"><h2>{locale === "th" ? "สรุปคำสั่งซื้อ" : "Order summary"}</h2><Row label={locale === "th" ? "ค่าสินค้า" : "Items"} value={money(order.summary.subtotal, locale)} /><Row label={locale === "th" ? "ค่าจัดส่ง" : "Delivery"} value={money(order.summary.deliveryFee, locale)} />{order.summary.discount > 0 && <Row label={locale === "th" ? "ส่วนลด" : "Discount"} value={`- ${money(order.summary.discount, locale)}`} />}<div className="cart-summary-total"><span>{locale === "th" ? "รวมทั้งสิ้น" : "Grand total"}</span><strong>{money(order.summary.grandTotal, locale)}</strong></div><p className="cart-summary-vat">{locale === "th" ? `รวมภาษีมูลค่าเพิ่ม ${order.summary.taxRate}% (${money(order.summary.taxAmount, locale)})` : `Includes ${order.summary.taxRate}% VAT (${money(order.summary.taxAmount, locale)})`}</p><OmiseCheckoutButton locale={locale} orderCode={order.orderCode} paymentStatus={order.paymentStatus} reservationExpiresAt={order.reservationExpiresAt} total={order.summary.grandTotal} />{order.trackingNumber && <p>{locale === "th" ? "เลขพัสดุ: " : "Tracking: "}{order.trackingNumber}</p>}</aside></div>
    {staffView ? <OrderPrintDocument locale={locale} order={order} /> : null}
    <ul className="order-detail-help">{locale === "th" ? <><li>มีปัญหาในการสั่งซื้อ? กรุณาติดต่อฝ่ายบริการลูกค้า โทร 02-101-3453-54, 089-006-2766 หรือแอดไลน์ @santatech</li><li>สินค้าไม่สามารถเปลี่ยนหรือคืนสินค้าได้ หากทำการยืนยันสั่งซื้อเรียบร้อย</li></> : <><li>Need help with your order? Contact Customer Service: 02-101-3453-54, 089-006-2766, or Line @santatech.</li><li>Products cannot be exchanged or returned after an order has been confirmed.</li></>}</ul>
  </>;
}

function OrderPrintDocument({ locale, order }: { locale: Locale; order: Order }) {
  const thai = locale === "th";
  const address = order.deliveryAddress ? [order.deliveryAddress.addressLine1, order.deliveryAddress.addressLine2, order.deliveryAddress.subdistrict, order.deliveryAddress.district, order.deliveryAddress.province, order.deliveryAddress.postalCode].filter(Boolean).join(", ") : null;
  return <section className="order-print-document" aria-hidden="true"><h2>{thai ? "ใบสรุปคำสั่งซื้อ" : "Order summary"}</h2><p><strong>{thai ? "เลขที่คำสั่งซื้อ" : "Order"}:</strong> {order.orderCode}</p>{order.deliveryAddress ? <p><strong>{thai ? "ผู้รับสินค้า" : "Recipient"}:</strong> {order.deliveryAddress.recipientName} ({order.deliveryAddress.phoneNumber})<br />{address}</p> : null}<table><thead><tr><th className="order-print-product-image-header">{thai ? "รูป" : "Image"}</th><th>{thai ? "สินค้า" : "Item"}</th><th>{thai ? "SKU" : "SKU"}</th><th>{thai ? "ราคา" : "Unit price"}</th><th>{thai ? "จำนวน" : "Qty"}</th><th>{thai ? "รวม" : "Total"}</th></tr></thead><tbody>{order.items.map((item) => <tr key={item.id}><td className="order-print-product-image">{item.productImageUrl ? <Image alt={thai ? item.productNameTh : item.productNameEn} height={48} src={item.productImageUrl} unoptimized width={48} /> : <span aria-label={thai ? "ไม่มีรูปสินค้า" : "No product image"}>—</span>}</td><td>{thai ? item.productNameTh : item.productNameEn}</td><td>{item.productSku}</td><td>{money(item.unitPrice, locale)}</td><td>{item.quantity}</td><td>{money(item.lineTotal, locale)}</td></tr>)}</tbody><tfoot><tr><th colSpan={5}>{thai ? "ค่าสินค้า" : "Items"}</th><td>{money(order.summary.subtotal, locale)}</td></tr><tr><th colSpan={5}>{thai ? "ค่าจัดส่ง" : "Delivery"}</th><td>{money(order.summary.deliveryFee, locale)}</td></tr>{order.summary.discount > 0 ? <tr><th colSpan={5}>{thai ? "ส่วนลด" : "Discount"}</th><td>- {money(order.summary.discount, locale)}</td></tr> : null}<tr><th colSpan={5}>{thai ? "รวมทั้งสิ้น" : "Grand total"}</th><td>{money(order.summary.grandTotal, locale)}</td></tr></tfoot></table></section>;
}

function OrderItem({ item, locale }: { item: Item; locale: Locale }) { const name = locale === "th" ? item.productNameTh : item.productNameEn; return <article className="cart-item"><Link className="cart-item-image" href={productPath(locale, item.productSlug)}>{item.productImageUrl && <Image alt={name} fill sizes="112px" src={item.productImageUrl} unoptimized />}</Link><div className="cart-item-copy"><span>SKU: {item.productSku}</span><h2>{name}</h2></div><div className="cart-item-price"><span>{locale === "th" ? "ราคา" : "Price"}</span><strong>{money(item.unitPrice, locale)}</strong></div><div className="cart-item-quantity"><span>{locale === "th" ? "จำนวน" : "Quantity"}</span><strong>{item.quantity}</strong></div><div className="cart-item-total"><span>{locale === "th" ? "รวม" : "Total"}</span><strong>{money(item.lineTotal, locale)}</strong></div></article>; }
function Row({ label, value }: { label: string; value: string }) { return <div className="cart-summary-row"><span>{label}</span><strong>{value}</strong></div>; }
function Status({ label, value, locale }: { label: string; value: string; locale: Locale }) { const labels: Record<string, string> = { PENDING: locale === "th" ? "รอดำเนินการ" : "Pending", PAID: locale === "th" ? "ชำระเงินแล้ว" : "Paid", FAILED: locale === "th" ? "ชำระเงินไม่สำเร็จ" : "Failed", PROCESSING: locale === "th" ? "กำลังเตรียมสินค้า" : "Processing", SHIPPING: locale === "th" ? "จัดส่ง" : "Shipped", COMPLETED: locale === "th" ? "จัดส่ง" : "Shipped", CANCELLED: locale === "th" ? "ยกเลิก" : "Cancelled" }; return <p><span>{label}</span><strong>{labels[value] ?? value}</strong></p>; }
function money(value: number, locale: Locale) { return new Intl.NumberFormat(locale === "th" ? "th-TH" : "en-US", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(value); }
