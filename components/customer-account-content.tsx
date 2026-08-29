"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { AuthSession } from "@/lib/auth/keycloak";
import type { Locale } from "@/lib/i18n";

type CustomerAccountSection = "profile" | "orders" | "deliveries";
type OrderStatus = "all" | "pending" | "paid" | "shipping" | "completed" | "cancelled";

type ProfileForm = {
  email: string;
  fullName: string;
  phone: string;
};

type Order = {
  date: string;
  id: string;
  itemCount: number;
  status: Exclude<OrderStatus, "all">;
  total: string;
  tracking?: string;
};

const orders: Order[] = [
  { id: "ST-100234", date: "OCT 24, 2024", itemCount: 1, status: "completed", total: "฿12,450.00" },
  { id: "ST-100256", date: "OCT 24, 2024", itemCount: 1, status: "shipping", total: "฿4,200.00", tracking: "ติดตามพัสดุ KERRY เลขพัสดุ: KT987654321TH" },
  { id: "ST-100212", date: "OCT 24, 2024", itemCount: 1, status: "cancelled", total: "฿8,900.00" },
];

const copy = {
  th: {
    account: "บัญชีของฉัน",
    all: "ทั้งหมด",
    cancelled: "ยกเลิก",
    completed: "เสร็จสิ้น",
    datePrefix: "สั่งซื้อเมื่อ",
    deliveries: "ที่อยู่จัดส่ง",
    deliveryEmpty: "คุณยังไม่ได้บันทึกที่อยู่จัดส่ง",
    deliveryHint: "ที่อยู่จัดส่งจะแสดงที่นี่เมื่อคุณเพิ่มข้อมูลในขั้นตอนสั่งซื้อ",
    editProfile: "แก้ไขข้อมูลส่วนตัวของคุณสำหรับการติดต่อและจัดส่งสินค้า",
    email: "อีเมล",
    fullName: "ชื่อ-นามสกุล",
    orderDetails: "รายละเอียดคำสั่งซื้อ",
    orders: "คำสั่งซื้อของฉัน",
    paid: "ชำระเงินแล้ว",
    paymentStatus: "สถานะการชำระเงิน",
    pending: "รอชำระ",
    phone: "เบอร์โทรศัพท์",
    profile: "ข้อมูลโปรไฟล์",
    saved: "บันทึกข้อมูลแล้ว",
    save: "บันทึกข้อมูล",
    search: "ค้นหา",
    searchPlaceholder: "ค้นหาด้วยเลขที่สั่งซื้อ",
    shipping: "กำลังจัดส่ง",
    total: "จำนวนเงินทั้งหมด",
    username: "ชื่อผู้ใช้",
  },
  en: {
    account: "User Account",
    all: "All",
    cancelled: "Cancelled",
    completed: "Completed",
    datePrefix: "Ordered on",
    deliveries: "Delivery Address",
    deliveryEmpty: "You have no saved delivery addresses.",
    deliveryHint: "Your delivery addresses will appear here after you add them during checkout.",
    editProfile: "Update the personal information used to contact you and deliver your orders.",
    email: "Email",
    fullName: "Full name",
    orderDetails: "Order details",
    orders: "My Order",
    paid: "Paid",
    paymentStatus: "Payment status",
    pending: "Pending payment",
    phone: "Phone number",
    profile: "Profile",
    saved: "Your information has been saved.",
    save: "Save changes",
    search: "Search",
    searchPlaceholder: "Search by order number",
    shipping: "Shipping",
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
  const [profile, setProfile] = useState<ProfileForm>({
    email: "",
    fullName: session.username,
    phone: "",
  });
  const storageKey = `santatech-customer-profile:${session.username}`;
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
    { id: "completed", label: text.completed },
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
    const storedProfile = window.localStorage.getItem(storageKey);
    if (!storedProfile) return;

    try {
      const parsed = JSON.parse(storedProfile) as ProfileForm;
      const timer = window.setTimeout(() => {
        setProfile({
          email: typeof parsed.email === "string" ? parsed.email : "",
          fullName: typeof parsed.fullName === "string" ? parsed.fullName : session.username,
          phone: typeof parsed.phone === "string" ? parsed.phone : "",
        });
      }, 0);
      return () => window.clearTimeout(timer);
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, [session.username, storageKey]);

  const visibleOrders = useMemo(() => {
    const normalizedSearch = orderSearch.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = orderStatus === "all" || order.status === orderStatus;
      const matchesSearch = !normalizedSearch || order.id.toLowerCase().includes(normalizedSearch);
      return matchesStatus && matchesSearch;
    });
  }, [orderSearch, orderStatus]);

  function selectSection(nextSection: CustomerAccountSection) {
    setSection(nextSection);
    window.history.replaceState(null, "", `#${nextSection}`);
  }

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    window.localStorage.setItem(storageKey, JSON.stringify(profile));
    setSaved(true);
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
                <span>{text.fullName}</span>
                <input onChange={(event) => setProfile((current) => ({ ...current, fullName: event.target.value }))} required value={profile.fullName} />
              </label>
              <label>
                <span>{text.email}</span>
                <input onChange={(event) => setProfile((current) => ({ ...current, email: event.target.value }))} type="email" value={profile.email} />
              </label>
              <label>
                <span>{text.phone}</span>
                <input onChange={(event) => setProfile((current) => ({ ...current, phone: event.target.value }))} type="tel" value={profile.phone} />
              </label>
              <div className="customer-profile-actions">
                <button type="submit">{text.save}</button>
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
                <button aria-selected={item.id === orderStatus} className={item.id === orderStatus ? "active" : ""} key={item.id} onClick={() => setOrderStatus(item.id)} role="tab" type="button">{item.label}</button>
              ))}
            </div>
            <div className="customer-order-list">
              {visibleOrders.map((order) => <OrderCard key={order.id} order={order} text={text} />)}
              {visibleOrders.length === 0 ? <p className="customer-orders-empty">{locale === "th" ? "ไม่พบคำสั่งซื้อ" : "No orders found."}</p> : null}
            </div>
          </article>
        ) : null}

        {section === "deliveries" ? (
          <article className="customer-account-panel customer-deliveries-panel">
            <h2>{text.deliveries}</h2>
            <div className="customer-account-empty-state">
              <span className="material-symbols-outlined" aria-hidden="true">location_on</span>
              <h3>{text.deliveryEmpty}</h3>
              <p>{text.deliveryHint}</p>
            </div>
          </article>
        ) : null}
      </div>
    </section>
  );
}

function OrderCard({ order, text }: { order: Order; text: typeof copy.th | typeof copy.en }) {
  const status = {
    cancelled: text.cancelled,
    completed: text.completed,
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
        {order.tracking ? <span className="customer-order-tracking">{order.tracking}</span> : null}
        <button type="button">{text.orderDetails}<span aria-hidden="true">→</span></button>
      </div>
    </article>
  );
}
