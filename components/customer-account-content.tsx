"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import type { AuthSession } from "@/lib/auth/keycloak";
import type { Locale } from "@/lib/i18n";
import { CustomerDeliveryAddresses } from "@/components/customer-delivery-addresses";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import { getShippingTrackingUrl } from "@/lib/shipping-tracking";

type CustomerAccountSection = "profile" | "orders" | "deliveries";
type OrderStatus = "all" | "pending" | "paid" | "shipping" | "cancelled";

type ProfileForm = {
  email: string;
  firstName: string;
  lastName: string;
};

type Order = {
  date: string;
  id: string;
  itemCount: number;
  status: Exclude<OrderStatus, "all">;
  total: string;
  tracking?: string;
  carrier?: "EMS" | "FLASH" | "KEX" | "OTHER";
};


const copy = {
  th: {
    account: "บัญชีของฉัน",
    all: "ทั้งหมด",
    cancelled: "ยกเลิก",
    datePrefix: "สั่งซื้อเมื่อ",
    deliveries: "ที่อยู่จัดส่ง",
    deliveryEmpty: "คุณยังไม่ได้บันทึกที่อยู่จัดส่ง",
    deliveryHint: "ที่อยู่จัดส่งจะแสดงที่นี่เมื่อคุณเพิ่มข้อมูลในขั้นตอนสั่งซื้อ",
    editProfile: "แก้ไขข้อมูลส่วนตัวของคุณสำหรับการติดต่อและจัดส่งสินค้า",
    email: "อีเมล",
    firstName: "ชื่อ",
    lastName: "นามสกุล",
    orderDetails: "รายละเอียดคำสั่งซื้อ",
    orders: "คำสั่งซื้อของฉัน",
    paid: "ชำระเงินแล้ว",
    paymentStatus: "สถานะการชำระเงิน",
    pending: "รอชำระ",
    profile: "ข้อมูลโปรไฟล์",
    saved: "บันทึกข้อมูลแล้ว",
    save: "บันทึกข้อมูล",
    search: "ค้นหา",
    searchPlaceholder: "ค้นหาด้วยเลขที่สั่งซื้อ",
    shipping: "จัดส่ง",
    trackShipment: "ติดตามพัสดุ",
    total: "จำนวนเงินทั้งหมด",
    username: "ชื่อผู้ใช้",
  },
  en: {
    account: "User Account",
    all: "All",
    cancelled: "Cancelled",
    datePrefix: "Ordered on",
    deliveries: "Delivery Address",
    deliveryEmpty: "You have no saved delivery addresses.",
    deliveryHint: "Your delivery addresses will appear here after you add them during checkout.",
    editProfile: "Update the personal information used to contact you and deliver your orders.",
    email: "Email",
    firstName: "First name",
    lastName: "Last name",
    orderDetails: "Order details",
    orders: "My Order",
    paid: "Paid",
    paymentStatus: "Payment status",
    pending: "Pending payment",
    profile: "Profile",
    saved: "Your information has been saved.",
    save: "Save changes",
    search: "Search",
    searchPlaceholder: "Search by order number",
    shipping: "Shipped",
    trackShipment: "Track shipment",
    total: "Total amount",
    username: "Username",
  },
} as const;

export function CustomerAccountContent({ locale, session }: { locale: Locale; session: AuthSession }) {
  const text = copy[locale];
  const [section, setSection] = useState<CustomerAccountSection>("profile");
  const [orderStatus, setOrderStatus] = useState<OrderStatus>("all");
  const [orderSearch, setOrderSearch] = useState("");
  const [saved, setSaved] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<ProfileForm>({
    email: "",
    firstName: "",
    lastName: "",
  });
  const sectionItems: Array<{ id: CustomerAccountSection; label: string }> = [
    { id: "profile", label: text.profile },
    { id: "orders", label: text.orders },
    { id: "deliveries", label: text.deliveries },
  ];
  const statusItems: Array<{ id: OrderStatus; label: string }> = [
    { id: "all", label: text.all },
    { id: "pending", label: text.pending },
    { id: "paid", label: text.paid },
    { id: "shipping", label: text.shipping },
    { id: "cancelled", label: text.cancelled },
  ];

  useEffect(() => {
    const selectSectionFromHash = () => {
      const value = window.location.hash.replace("#", "");
      if (value === "orders" || value === "deliveries" || value === "profile") setSection(value);
    };

    selectSectionFromHash();
    window.addEventListener("hashchange", selectSectionFromHash);
    return () => window.removeEventListener("hashchange", selectSectionFromHash);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetch("/api/customer/profile", { cache: "no-store" })
        .then((response) => response.ok ? response.json() : null)
        .then((nextProfile: ProfileForm | null) => {
          if (nextProfile) setProfile(nextProfile);
        });
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetch("/api/orders?page=1&pageSize=100", { cache: "no-store" })
        .then((response) => response.ok ? response.json() : null)
        .then((payload: { items?: Array<{ orderCode: string; placedAt: string; fulfillmentStatus: string; paymentStatus: string; shippingCarrier: "EMS" | "FLASH" | "KEX" | "OTHER" | null; trackingNumber: string | null; items: unknown[]; summary: { grandTotal: number } }> } | null) => {
          if (!payload?.items) return;
          setOrders(payload.items.map((order) => ({
            id: order.orderCode,
            date: new Intl.DateTimeFormat(locale === "th" ? "th-TH" : "en-US", { dateStyle: "medium" }).format(new Date(order.placedAt)),
            itemCount: order.items.length,
            status: toCustomerOrderStatus(order.fulfillmentStatus, order.paymentStatus),
            total: new Intl.NumberFormat(locale === "th" ? "th-TH" : "en-US", { style: "currency", currency: "THB" }).format(order.summary.grandTotal),
            tracking: order.trackingNumber ?? undefined,
            carrier: order.shippingCarrier ?? undefined,
          })));
        });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [locale]);

  const visibleOrders = useMemo(() => {
    const normalizedSearch = orderSearch.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = orderStatus === "all" || order.status === orderStatus;
      const matchesSearch = !normalizedSearch || order.id.toLowerCase().includes(normalizedSearch);
      return matchesStatus && matchesSearch;
    });
  }, [orderSearch, orderStatus, orders]);

  function selectSection(nextSection: CustomerAccountSection) {
    setSection(nextSection);
    window.history.replaceState(null, "", `#${nextSection}`);
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSavingProfile(true);
    setSaved(false);
    try {
      const response = await fetch("/api/customer/profile", {
        body: JSON.stringify(profile),
        headers: { "content-type": "application/json" },
        method: "PATCH",
      });
      const nextProfile = await response.json() as ProfileForm & { message?: string };
      if (!response.ok) throw new Error(nextProfile.message ?? "Unable to save profile.");
      setProfile(nextProfile);
      setSaved(true);
      showSuccessToast(locale === "th" ? "บันทึกข้อมูลแล้ว" : "Profile saved");
    } catch (error) {
      showErrorToast(locale === "th" ? "บันทึกข้อมูลไม่สำเร็จ" : "Unable to save profile", error instanceof Error ? error.message : undefined);
    } finally {
      setIsSavingProfile(false);
    }
  }

  return (
    <section className="customer-account-section">
      <div className="customer-account-shell">
        <div className="customer-account-heading">
          <h1>{text.account}</h1>
        </div>

        <nav className="customer-account-nav" aria-label={text.account}>
          {sectionItems.map((item) => (
            <button
              aria-current={item.id === section ? "page" : undefined}
              className={item.id === section ? "customer-account-nav-link active" : "customer-account-nav-link"}
              key={item.id}
              onClick={() => selectSection(item.id)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {section === "profile" ? (
          <article className="customer-account-panel customer-profile-panel">
            <h2>{text.profile}</h2>
            <p className="customer-account-intro">{text.editProfile}</p>
            <form className="customer-profile-form" onSubmit={saveProfile}>
              <label>
                <span>{text.username}</span>
                <input disabled value={session.username} />
              </label>
              <label>
                <span>{text.firstName}</span>
                <input autoComplete="given-name" onChange={(event) => setProfile((current) => ({ ...current, firstName: event.target.value }))} required value={profile.firstName} />
              </label>
              <label>
                <span>{text.lastName}</span>
                <input autoComplete="family-name" onChange={(event) => setProfile((current) => ({ ...current, lastName: event.target.value }))} required value={profile.lastName} />
              </label>
              <label>
                <span>{text.email}</span>
                <input onChange={(event) => setProfile((current) => ({ ...current, email: event.target.value }))} type="email" value={profile.email} />
              </label>
              <div className="customer-profile-actions">
                <button disabled={isSavingProfile} type="submit">{isSavingProfile ? "…" : text.save}</button>
                {saved ? <p role="status">{text.saved}</p> : null}
              </div>
            </form>
          </article>
        ) : null}

        {section === "orders" ? (
          <article className="customer-orders-panel">
            <div className="customer-orders-heading">
              <div>
                <h2>{text.orders}</h2>
                <p>{locale === "th" ? "จัดการและติดตามคำสั่งซื้อของคุณ" : "Manage and track your orders."}</p>
              </div>
              <label className="customer-orders-search">
                <span className="sr-only">{text.search}</span>
                <input onChange={(event) => setOrderSearch(event.target.value)} placeholder={text.searchPlaceholder} type="search" value={orderSearch} />
                <span className="material-symbols-outlined" aria-hidden="true">search</span>
              </label>
            </div>
            <div className="customer-order-filters" role="tablist" aria-label={text.paymentStatus}>
              {statusItems.map((item) => (
                <button aria-selected={item.id === orderStatus} className={item.id === orderStatus ? "active" : ""} key={item.id} onClick={() => setOrderStatus(item.id)} role="tab" type="button">{item.label} <span>{item.id === "all" ? orders.length : orders.filter((order) => order.status === item.id).length}</span></button>
              ))}
            </div>
            <div className="customer-order-list">
              {visibleOrders.map((order) => <OrderCard key={order.id} locale={locale} order={order} text={text} />)}
              {visibleOrders.length === 0 ? <p className="customer-orders-empty">{locale === "th" ? "ไม่พบคำสั่งซื้อ" : "No orders found."}</p> : null}
            </div>
          </article>
        ) : null}

        {section === "deliveries" ? <CustomerDeliveryAddresses locale={locale} /> : null}
      </div>
    </section>
  );
}

function OrderCard({ locale, order, text }: { locale: Locale; order: Order; text: typeof copy.th | typeof copy.en }) {
  const status = {
    cancelled: text.cancelled,
    paid: text.paid,
    pending: text.pending,
    shipping: text.shipping,
  }[order.status];

  return (
    <article className="customer-order-card">
      <div className="customer-order-card-top">
        <span className="material-symbols-outlined customer-order-icon" aria-hidden="true">receipt_long</span>
        <div className="customer-order-id"><strong>#{order.id}</strong><span>{text.datePrefix} {order.date}</span></div>
        <div className="customer-order-summary"><span>{text.total}</span><strong>{order.total}</strong></div>
        <span className={`customer-order-status customer-order-status-${order.status}`}>{status}</span>
      </div>
      <div className="customer-order-card-bottom">
        <span className="customer-order-item"><span className="material-symbols-outlined" aria-hidden="true">inventory_2</span><span>+{order.itemCount}</span></span>
        {order.status === "shipping" && order.carrier && order.tracking ? <ShipmentTracking carrier={order.carrier} locale={locale} text={text.trackShipment} trackingNumber={order.tracking} /> : null}
        <Link href={`/${locale}/orders/${order.id}`}>{text.orderDetails}<span aria-hidden="true">→</span></Link>
      </div>
    </article>
  );
}

function toCustomerOrderStatus(fulfillmentStatus: string, paymentStatus: string): Exclude<OrderStatus, "all"> {
  if (fulfillmentStatus === "CANCELLED") return "cancelled";
  if (fulfillmentStatus === "SHIPPING" || fulfillmentStatus === "COMPLETED") return "shipping";
  return paymentStatus === "PAID" ? "paid" : "pending";
}

function carrierLabel(carrier: NonNullable<Order["carrier"]>, locale: Locale) { return carrier === "EMS" ? "EMS ไปรษณีย์ไทย" : carrier === "FLASH" ? "Flash Express" : carrier === "KEX" ? "KEX" : locale === "th" ? "อื่น ๆ" : "Other"; }
function ShipmentTracking({ carrier, locale, text, trackingNumber }: { carrier: NonNullable<Order["carrier"]>; locale: Locale; text: string; trackingNumber: string }) { const trackingUrl = getTrackingUrl(carrier, trackingNumber); return <><span className="customer-order-tracking">{carrierLabel(carrier, locale)}: {trackingNumber}</span>{trackingUrl ? <a className="customer-order-track-link" href={trackingUrl} rel="noreferrer" target="_blank">{text}<span aria-hidden="true">↗</span></a> : null}</>; }
function getTrackingUrl(carrier: NonNullable<Order["carrier"]>, trackingNumber: string) { return getShippingTrackingUrl(carrier, trackingNumber); }
