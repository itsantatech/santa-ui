"use client";

import type { Locale } from "@/lib/i18n";

export function OrderSummaryPrintButton({ locale }: { locale: Locale }) {
  return <button className="order-summary-print-button" onClick={() => window.print()} type="button">
    <span aria-hidden="true" className="material-symbols-outlined">print</span>
    {locale === "th" ? "พิมพ์ใบสรุปคำสั่งซื้อ" : "Print order summary"}
  </button>;
}
