"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { showErrorToast } from "@/lib/toast";

type PaymentMethod = "credit_card" | "promptpay";
type OmiseCardApi = { configure: (options: { publicKey: string }) => void; open: (options: { amount: number; currency: string; defaultPaymentMethod: "credit_card"; onCreateTokenSuccess: (nonce: string) => void; onFormClosed?: () => void }) => void; };
type OmiseApi = { setPublicKey: (publicKey: string) => void; createSource: (type: "promptpay", options: { amount: number; currency: string }, callback: (statusCode: number, response: { id?: string; message?: string }) => void) => void; };
declare global { interface Window { OmiseCard?: OmiseCardApi; Omise?: OmiseApi; } }
type PaymentResponse = { paymentStatus?: string; attempt?: { status?: string; failureMessage?: string | null } | null; };

export function OmiseCheckoutButton({ locale, orderCode, paymentStatus, reservationExpiresAt, total }: { locale: "th" | "en"; orderCode: string; paymentStatus: string; reservationExpiresAt: string | null; total: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [failureMessage, setFailureMessage] = useState<string | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(() => remainingSeconds(reservationExpiresAt));
  const unpaid = paymentStatus === "PENDING";
  const reservationActive = secondsRemaining > 0;

  useEffect(() => { const update = () => setSecondsRemaining(remainingSeconds(reservationExpiresAt)); update(); const timer = window.setInterval(update, 1000); return () => window.clearInterval(timer); }, [reservationExpiresAt]);
  useEffect(() => {
    if (!unpaid || !reservationExpiresAt || secondsRemaining > 0) return;
    const timer = window.setTimeout(() => {
      void fetch(`/api/payments/omise/orders/${encodeURIComponent(orderCode)}`, { cache: "no-store" })
        .then(() => window.location.reload());
    }, 0);
    return () => window.clearTimeout(timer);
  }, [orderCode, reservationExpiresAt, secondsRemaining, unpaid]);
  useEffect(() => {
    if (!qrCodeUrl) return;
    const timer = window.setInterval(async () => {
      const response = await fetch(`/api/payments/omise/orders/${encodeURIComponent(orderCode)}`, { cache: "no-store" });
      const payment = await response.json().catch(() => null) as PaymentResponse | null;
      if (payment?.paymentStatus === "PAID") { window.location.reload(); return; }
      if (payment?.attempt?.status === "FAILED") { setQrCodeUrl(null); setFailureMessage(payment.attempt.failureMessage ?? (locale === "th" ? "ไม่สามารถชำระเงินได้ กรุณาลองอีกครั้ง" : "Payment was unsuccessful. Please try again.")); }
    }, 3000);
    return () => window.clearInterval(timer);
  }, [locale, orderCode, qrCodeUrl]);

  async function getPublicKey() {
    const response = await fetch("/api/payments/omise/config"); const config = await response.json() as { publicKey?: string; message?: string };
    if (!response.ok || !config.publicKey) throw new Error(config.message ?? "Payment is unavailable.");
    await loadOmiseScript(); return config.publicKey;
  }
  async function openPayment(method: PaymentMethod) {
    if (!reservationActive) return;
    setIsPending(true); setFailureMessage(null);
    try {
      const publicKey = await getPublicKey();
      if (method === "promptpay") {
        if (!window.Omise) throw new Error("Unable to load PromptPay.");
        window.Omise.setPublicKey(publicKey);
        window.Omise.createSource("promptpay", { amount: total * 100, currency: "THB" }, (statusCode, source) => {
          if (statusCode < 200 || statusCode >= 300 || !source.id) { setIsPending(false); showErrorToast(locale === "th" ? "เปิด PromptPay ไม่สำเร็จ" : "Unable to open PromptPay", source.message); return; }
          void createCharge(source.id, method);
        });
        return;
      }
      if (!window.OmiseCard) throw new Error("Unable to load Omise checkout.");
      window.OmiseCard.configure({ publicKey });
      window.OmiseCard.open({ amount: total * 100, currency: "THB", defaultPaymentMethod: "credit_card", onFormClosed: () => setIsPending(false), onCreateTokenSuccess: (nonce) => void createCharge(nonce, method) });
    } catch (error) { setIsPending(false); showErrorToast(locale === "th" ? "เปิดระบบชำระเงินไม่สำเร็จ" : "Unable to open payment", error instanceof Error ? error.message : undefined); }
  }
  async function createCharge(nonce: string, method: PaymentMethod) {
    try {
      const payload = { idempotencyKey: crypto.randomUUID(), method, ...(nonce.startsWith("src_") ? { source: nonce } : { token: nonce }) };
      const response = await fetch(`/api/payments/omise/orders/${encodeURIComponent(orderCode)}/charge`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const payment = await response.json() as { authorizeUri?: string | null; qrCodeUrl?: string | null; failureMessage?: string | null; message?: string };
      if (!response.ok) throw new Error(payment.message ?? payment.failureMessage ?? "Unable to create payment.");
      if (payment.authorizeUri) { window.location.assign(payment.authorizeUri); return; }
      if (payment.qrCodeUrl) { setQrCodeUrl(payment.qrCodeUrl); setIsPending(false); return; }
      window.location.reload();
    } catch (error) { setIsPending(false); showErrorToast(locale === "th" ? "สร้างรายการชำระเงินไม่สำเร็จ" : "Unable to create payment", error instanceof Error ? error.message : undefined); }
  }
  if (!unpaid) return null;
  return <>
    {reservationExpiresAt && <p aria-live="polite" className={`payment-reservation ${reservationActive ? "" : "expired"}`}>{reservationActive ? (locale === "th" ? `กรุณาชำระเงินภายใน ${formatDuration(secondsRemaining)}` : `Complete payment within ${formatDuration(secondsRemaining)}`) : (locale === "th" ? "เวลาสำรองสินค้าได้หมดลงแล้ว" : "The payment reservation has expired.")}</p>}
    <button className="cart-checkout-button" disabled={isPending || !reservationActive} onClick={() => setIsOpen(true)} type="button">{isPending ? (locale === "th" ? "กำลังเปิดระบบชำระเงิน..." : "Opening payment...") : locale === "th" ? "ชำระเงิน" : "Pay now"}</button>
    {isOpen ? <div className="payment-modal-backdrop" onClick={() => !isPending && setIsOpen(false)} role="presentation"><section aria-modal="true" aria-labelledby="payment-title" className="payment-modal" onClick={(event) => event.stopPropagation()} role="dialog"><button aria-label="Close" className="payment-modal-close" disabled={isPending} onClick={() => setIsOpen(false)} type="button">×</button><span className="payment-modal-brand">Secure payment by Omise</span><h2 id="payment-title">{qrCodeUrl ? (locale === "th" ? "สแกนเพื่อชำระเงิน" : "Scan to pay") : (locale === "th" ? "เลือกวิธีชำระเงิน" : "Choose payment method")}</h2>{qrCodeUrl ? <><Image alt="PromptPay QR" className="payment-qr" height={280} src={qrCodeUrl} unoptimized width={280} /><p>{locale === "th" ? "สแกน PromptPay QR นี้ในแอปธนาคาร ระบบจะตรวจสอบการชำระเงินอัตโนมัติ" : "Scan this PromptPay QR code in your banking app. Payment will be confirmed automatically."}</p></> : <><p className="payment-modal-total">{locale === "th" ? "ยอดชำระ" : "Amount due"} <strong>{money(total, locale)}</strong></p>{failureMessage && <p className="payment-failure" role="alert">{failureMessage}</p>}<div className="payment-methods"><button disabled={isPending || !reservationActive} onClick={() => void openPayment("credit_card")} type="button">{locale === "th" ? "บัตรเครดิต / เดบิต" : "Credit / debit card"}</button><button disabled={isPending || !reservationActive} onClick={() => void openPayment("promptpay")} type="button">PromptPay QR</button></div></>}</section></div> : null}
  </>;
}
function remainingSeconds(value: string | null) { return value ? Math.max(0, Math.ceil((new Date(value).getTime() - Date.now()) / 1000)) : 0; }
function formatDuration(seconds: number) { return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`; }
function money(value: number, locale: "th" | "en") { return new Intl.NumberFormat(locale === "th" ? "th-TH" : "en-US", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(value); }
function loadOmiseScript() { if (window.Omise || window.OmiseCard) return Promise.resolve(); return new Promise<void>((resolve, reject) => { const existing = document.querySelector<HTMLScriptElement>("script[data-omise-js]"); if (existing) { existing.addEventListener("load", () => resolve(), { once: true }); existing.addEventListener("error", () => reject(new Error("Unable to load Omise checkout.")), { once: true }); return; } const script = document.createElement("script"); script.src = "https://cdn.omise.co/omise.js"; script.async = true; script.dataset.omiseJs = "true"; script.onload = () => resolve(); script.onerror = () => reject(new Error("Unable to load Omise checkout.")); document.head.appendChild(script); }); }
