"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { showErrorToast } from "@/lib/toast";

type Locale = "th" | "en";
type Cart = {
  items: CartItem[];
  summary: { itemCount: number; subtotal: number; deliveryFee: number; discount: number; grandTotal: number };
};
type CartItem = {
  productSku: string;
  quantity: number;
  unitPrice: number;
  originalUnitPrice: number;
  lineTotal: number;
  product: { slug: string; nameTh: string; nameEn: string; shortDescriptionTh: string; shortDescriptionEn: string; imgUrl: string[] };
};
type CartConfirmation =
  | { type: "clear" }
  | { productName: string; productSku: string; type: "remove" };

const emptyCart: Cart = { items: [], summary: { itemCount: 0, subtotal: 0, deliveryFee: 0, discount: 0, grandTotal: 0 } };

export function CartContent({ locale }: { locale: Locale }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [pendingSku, setPendingSku] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [confirmation, setConfirmation] = useState<CartConfirmation | null>(null);
  const [missingAddress, setMissingAddress] = useState(false);

  const loadCart = useCallback(async () => {
    try {
      const response = await fetch("/api/cart", { cache: "no-store" });
      if (!response.ok) throw new Error();
      const nextCart = await response.json() as Cart;
      setCart(nextCart);
      publishCount(nextCart.summary.itemCount);
    } catch {
      setCart(emptyCart);
      showErrorToast(locale === "th" ? "ไม่สามารถโหลดตะกร้าสินค้าได้" : "Unable to load cart");
    }
  }, [locale]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadCart(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadCart]);

  async function updateQuantity(productSku: string, quantity: number) {
    setPendingSku(productSku);
    try {
      const response = await fetch(`/api/cart/items/${encodeURIComponent(productSku)}`, {
        body: JSON.stringify({ quantity }), headers: { "content-type": "application/json" }, method: "PATCH",
      });
      const nextCart = await response.json() as Cart & { message?: string };
      if (!response.ok) throw new Error(nextCart.message ?? "Unable to update cart.");
      setCart(nextCart); publishCount(nextCart.summary.itemCount);
    } catch (error) {
      showErrorToast(locale === "th" ? "ปรับจำนวนสินค้าไม่สำเร็จ" : "Unable to update cart", error instanceof Error ? error.message : undefined);
    } finally { setPendingSku(null); }
  }

  async function removeItem(productSku: string) {
    setPendingSku(productSku);
    try {
      const response = await fetch(`/api/cart/items/${encodeURIComponent(productSku)}`, { method: "DELETE" });
      const nextCart = await response.json() as Cart & { message?: string };
      if (!response.ok) throw new Error(nextCart.message ?? "Unable to remove cart item.");
      setCart(nextCart); publishCount(nextCart.summary.itemCount);
    } catch (error) {
      showErrorToast(locale === "th" ? "ลบสินค้าไม่สำเร็จ" : "Unable to remove item", error instanceof Error ? error.message : undefined);
    } finally { setPendingSku(null); }
  }

  async function clearCart() {
    setIsClearing(true);
    try {
      const response = await fetch("/api/cart", { method: "DELETE" });
      const nextCart = await response.json() as Cart & { message?: string };
      if (!response.ok) throw new Error(nextCart.message ?? "Unable to clear cart.");
      setCart(nextCart); publishCount(0);
    } catch (error) {
      showErrorToast(locale === "th" ? "ล้างตะกร้าไม่สำเร็จ" : "Unable to clear cart", error instanceof Error ? error.message : undefined);
    } finally { setIsClearing(false); }
  }

  async function checkout() {
    setIsCheckingOut(true);
    try {
      const addressResponse = await fetch("/api/customer/delivery-addresses", { cache: "no-store" });
      if (!addressResponse.ok) throw new Error("Unable to verify delivery address.");
      const address = await addressResponse.json() as { id?: string } | null;
      if (!address?.id) {
        setMissingAddress(true);
        return;
      }
      const idempotencyKey = crypto.randomUUID();
      const response = await fetch("/api/orders/checkout", { body: JSON.stringify({ idempotencyKey }), headers: { "content-type": "application/json" }, method: "POST" });
      const order = await response.json() as { orderCode?: string; message?: string };
      if (!response.ok || !order.orderCode) throw new Error(order.message ?? "Unable to place your order.");
      publishCount(0);
      window.location.assign(`/${locale}/orders/${order.orderCode}`);
    } catch (error) {
      showErrorToast(locale === "th" ? "สั่งซื้อไม่สำเร็จ" : "Unable to place order", error instanceof Error ? error.message : undefined);
    } finally {
      setIsCheckingOut(false);
    }
  }

  async function confirmCartAction() {
    if (!confirmation) return;

    const action = confirmation;
    setConfirmation(null);

    if (action.type === "clear") {
      await clearCart();
      return;
    }

    await removeItem(action.productSku);
  }

  if (!cart) return <p className="cart-status">{locale === "th" ? "กำลังโหลดตะกร้าสินค้า..." : "Loading your cart..."}</p>;
  if (cart.items.length === 0) return <section className="cart-empty"><h2>{locale === "th" ? "ตะกร้าสินค้าของคุณว่างอยู่" : "Your cart is empty"}</h2><Link href={`/${locale}/products`}>{locale === "th" ? "เลือกซื้อสินค้า" : "Browse products"}</Link></section>;

  return <><div className="cart-layout"><section className="cart-items" aria-label={locale === "th" ? "รายการสินค้า" : "Cart items"}>
    {cart.items.map((item) => {
      const isPending = pendingSku === item.productSku;
      const name = locale === "th" ? item.product.nameTh : item.product.nameEn;
      const description = locale === "th" ? item.product.shortDescriptionTh : item.product.shortDescriptionEn;
      return <article className="cart-item" key={item.productSku}>
        <Link className="cart-item-image" href={`/${locale}/products/${item.product.slug}`}>
          {item.product.imgUrl[0] ? <Image alt={name} fill sizes="112px" src={item.product.imgUrl[0]} unoptimized /> : null}
        </Link>
        <div className="cart-item-copy"><span>SKU: {item.productSku}</span><Link href={`/${locale}/products/${item.product.slug}`}><h2>{name}</h2></Link><p>{description}</p></div>
        <div className="cart-item-price"><span>{locale === "th" ? "ราคา" : "Price"}</span><strong>{formatMoney(item.unitPrice, locale)}</strong></div>
        <div className="cart-item-quantity"><span>{locale === "th" ? "จำนวน" : "Quantity"}</span><div><button aria-label="Decrease quantity" disabled={isPending || item.quantity === 1} onClick={() => void updateQuantity(item.productSku, item.quantity - 1)} type="button">−</button><strong>{item.quantity}</strong><button aria-label="Increase quantity" disabled={isPending} onClick={() => void updateQuantity(item.productSku, item.quantity + 1)} type="button">+</button></div></div>
        <div className="cart-item-total"><span>{locale === "th" ? "รวม" : "Total"}</span><strong>{formatMoney(item.lineTotal, locale)}</strong></div>
        <button className="cart-item-remove" aria-label={locale === "th" ? `ลบ ${name}` : `Remove ${name}`} disabled={isPending} onClick={() => setConfirmation({ productName: name, productSku: item.productSku, type: "remove" })} type="button">⌫</button>
      </article>;
    })}
    <div className="cart-actions"><Link href={`/${locale}/products`}>← {locale === "th" ? "เลือกซื้อสินค้าต่อ" : "Continue shopping"}</Link><button disabled={isClearing} onClick={() => setConfirmation({ type: "clear" })} type="button">{isClearing ? "…" : locale === "th" ? "ล้างตะกร้าทั้งหมด" : "Clear cart"}</button></div>
  </section><aside className="cart-summary"><h2>{locale === "th" ? "สรุปคำสั่งซื้อ" : "Order summary"}</h2><SummaryRow label={locale === "th" ? `สินค้าทั้งหมด (${cart.summary.itemCount})` : `Items (${cart.summary.itemCount})`} value={formatMoney(cart.summary.subtotal, locale)} /><SummaryRow label={locale === "th" ? "ค่าจัดส่ง" : "Delivery"} value={formatMoney(cart.summary.deliveryFee, locale)} />{cart.summary.discount > 0 ? <SummaryRow emphasis label={locale === "th" ? "ส่วนลด" : "Discount"} value={`- ${formatMoney(cart.summary.discount, locale)}`} /> : null}<div className="cart-summary-total"><span>{locale === "th" ? "รวมทั้งสิ้น" : "Grand total"}</span><strong>{formatMoney(cart.summary.grandTotal, locale)}</strong></div><p className="cart-summary-vat">{locale === "th" ? "รวมภาษีมูลค่าเพิ่ม (7%)" : "VAT included (7%)"}</p><button className="cart-order-button" disabled={isCheckingOut} onClick={() => void checkout()} type="button">{isCheckingOut ? (locale === "th" ? "กำลังสร้างคำสั่งซื้อ..." : "Placing order...") : locale === "th" ? "สั่งซื้อ" : "Place order"}</button></aside></div>;
  {confirmation ? <CartConfirmationModal confirmation={confirmation} isPending={isClearing || pendingSku !== null} locale={locale} onCancel={() => setConfirmation(null)} onConfirm={() => void confirmCartAction()} /> : null}{missingAddress ? <MissingAddressModal locale={locale} onCancel={() => setMissingAddress(false)} onOpenAddress={() => { window.open(`/${locale}/profile#deliveries`, "_blank", "noopener,noreferrer"); setMissingAddress(false); }} /> : null}</>;
}

function MissingAddressModal({ locale, onCancel, onOpenAddress }: { locale: Locale; onCancel: () => void; onOpenAddress: () => void }) {
  const thai = locale === "th";
  return <div className="cart-confirm-backdrop" onClick={onCancel} role="presentation"><section aria-labelledby="missing-address-title" aria-modal="true" className="cart-confirm-modal cart-address-modal" onClick={(event) => event.stopPropagation()} role="dialog"><div className="cart-confirm-icon" aria-hidden="true">⌂</div><h2 id="missing-address-title">{thai ? "ยังไม่มีที่อยู่จัดส่ง" : "Delivery address required"}</h2><p>{thai ? "กรุณาเพิ่มที่อยู่จัดส่งก่อนดำเนินการชำระเงิน" : "Add a delivery address before proceeding to payment."}</p><div className="cart-confirm-actions"><button onClick={onCancel} type="button">{thai ? "ยกเลิก" : "Cancel"}</button><button className="primary" onClick={onOpenAddress} type="button">{thai ? "เพิ่มที่อยู่จัดส่ง" : "Add delivery address"}</button></div></section></div>;
}

function CartConfirmationModal({ confirmation, isPending, locale, onCancel, onConfirm }: { confirmation: CartConfirmation; isPending: boolean; locale: Locale; onCancel: () => void; onConfirm: () => void }) {
  const isClear = confirmation.type === "clear";
  const title = locale === "th" ? (isClear ? "ยืนยันการล้างตะกร้า" : "ยืนยันการลบสินค้า") : (isClear ? "Clear cart?" : "Remove item?");
  const description = locale === "th"
    ? (confirmation.type === "clear" ? "คุณต้องการลบสินค้าทุกรายการออกจากตะกร้าหรือไม่" : `คุณต้องการลบ “${confirmation.productName}” ออกจากตะกร้าหรือไม่`)
    : (confirmation.type === "clear" ? "Do you want to remove every item from your cart?" : `Do you want to remove “${confirmation.productName}” from your cart?`);

  return <div className="cart-confirm-backdrop" onClick={onCancel} role="presentation"><section aria-labelledby="cart-confirm-title" aria-modal="true" className="cart-confirm-modal" onClick={(event) => event.stopPropagation()} role="dialog"><div className="cart-confirm-icon" aria-hidden="true">!</div><h2 id="cart-confirm-title">{title}</h2><p>{description}</p><div className="cart-confirm-actions"><button disabled={isPending} onClick={onCancel} type="button">{locale === "th" ? "ยกเลิก" : "Cancel"}</button><button className="danger" disabled={isPending} onClick={onConfirm} type="button">{isPending ? "…" : locale === "th" ? "ยืนยัน" : "Confirm"}</button></div></section></div>;
}

function SummaryRow({ label, value, emphasis = false }: { label: string; value: string; emphasis?: boolean }) { return <div className={emphasis ? "cart-summary-row emphasis" : "cart-summary-row"}><span>{label}</span><strong>{value}</strong></div>; }
function formatMoney(value: number, locale: Locale) { return new Intl.NumberFormat(locale === "th" ? "th-TH" : "en-US", { currency: "THB", maximumFractionDigits: 0, style: "currency" }).format(value); }
function publishCount(count: number) { window.dispatchEvent(new CustomEvent("santa-ui:cart-updated", { detail: count })); }
