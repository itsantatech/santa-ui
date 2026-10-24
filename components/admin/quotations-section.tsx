"use client";

import { useCallback, useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import { ClientTablePagination } from "./client-table-pagination";
import { AdminResourceSearch } from "./admin-resource-search";

type Quotation = { id: string; sequenceNumber: number; productSku: string; productNameTh: string; productNameEn: string; fullName: string; phoneNumber: string; email: string; requestedQuantity: number; acknowledgedAt?: string | null; acknowledgedBy?: string | null };
type Meta = { page: number; pageSize: number; totalPages: number };

export function QuotationsSection({ locale }: { locale: Locale }) {
  const thai = locale === "th";
  const [rows, setRows] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<Meta>({ page: 1, pageSize: 20, totalPages: 1 });
  const load = useCallback(async (page = 1, pageSize = 20, term = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
      if (term.trim()) params.set("search", term.trim());
      const response = await fetch(`/api/quotation-requests/admin?${params}`, { cache: "no-store" });
      const payload = await response.json() as { items?: Quotation[]; meta?: Meta; message?: string };
      if (!response.ok) throw new Error(payload.message);
      setRows(payload.items ?? []);
      setPagination(payload.meta ?? { page, pageSize, totalPages: 1 });
    } catch (error) {
      showErrorToast(thai ? "ไม่สามารถโหลดคำขอใบเสนอราคาได้" : "Unable to load quotation requests", error instanceof Error ? error.message : undefined);
    } finally { setLoading(false); }
  }, [thai]);
  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);
  async function downloadExport() {
    try {
      const params = new URLSearchParams({ page: String(pagination.page), pageSize: String(pagination.pageSize) });
      if (search.trim()) params.set("search", search.trim());
      const response = await fetch(`/api/quotation-requests/admin/export?${params}`, { cache: "no-store" });
      if (!response.ok) throw new Error();
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a"); link.href = url; link.download = "quotation-requests-export.xlsx"; link.click(); URL.revokeObjectURL(url);
    } catch { showErrorToast(thai ? "ไม่สามารถส่งออกใบเสนอราคาได้" : "Unable to export quotation requests"); }
  }
  async function acknowledge(id: string) { setPendingId(id); try { const response = await fetch(`/api/quotation-requests/admin/${encodeURIComponent(id)}/acknowledge`, { method: "PATCH" }); const acknowledged = await response.json() as Quotation; if (!response.ok) throw new Error(); setRows((current) => current.map((row) => row.id === id ? acknowledged : row)); showSuccessToast(thai ? "รับทราบคำขอแล้ว" : "Request acknowledged"); } catch { showErrorToast(thai ? "บันทึกสถานะไม่สำเร็จ" : "Unable to update request"); } finally { setPendingId(null); } }
  return <div className="admin-section-panel"><div className="admin-orders-heading"><h1 id="admin-heading">{thai ? "คำขอใบเสนอราคา" : "Quotation requests"}</h1><div className="admin-product-toolbar-actions"><button className="admin-product-secondary-button" onClick={() => void downloadExport()} type="button"><span className="material-symbols-outlined" aria-hidden="true">download</span>{thai ? "ส่งออก Excel" : "Export Excel"}</button><button className="admin-product-secondary-button" onClick={() => void load(1, pagination.pageSize, search)} type="button">{thai ? "รีเฟรช" : "Refresh"}</button></div></div><AdminResourceSearch<Quotation> endpoint="/api/quotation-requests/admin" getKey={(row) => `QT-${String(row.sequenceNumber).padStart(6, "0")}`} getLabel={(row) => `${locale === "th" ? row.productNameTh : row.productNameEn} / ${row.fullName}`} locale={locale} onSearch={(value) => { setSearch(value); void load(1, pagination.pageSize, value); }} placeholder={thai ? "ค้นหาเลขคำขอ, สินค้า หรือผู้ขอ" : "Search request, product, or requester"} /><div className="admin-table-shell"><div className="admin-table-scroll"><table className="admin-data-table admin-data-table-wide"><thead><tr><th>{thai ? "เลขคำขอ" : "Quotation no."}</th><th>{thai ? "สินค้า" : "Product"}</th><th>{thai ? "ผู้ขอ" : "Requester"}</th><th>{thai ? "จำนวน" : "Quantity"}</th><th>{thai ? "สถานะ" : "Status"}</th><th>{thai ? "จัดการ" : "Action"}</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td>{`QT-${String(row.sequenceNumber).padStart(6, "0")}`}</td><td>{locale === "th" ? row.productNameTh : row.productNameEn}<small>{row.productSku}</small></td><td>{row.fullName}<small>{row.email}</small></td><td>{row.requestedQuantity}</td><td>{row.acknowledgedAt ? (thai ? "รับทราบแล้ว" : "Acknowledged") : (thai ? "ใหม่" : "New")}{row.acknowledgedBy ? <small>{thai ? `โดย ${row.acknowledgedBy}` : `By ${row.acknowledgedBy}`}</small> : null}</td><td>{row.acknowledgedAt ? "-" : <button className="admin-product-add-button" disabled={pendingId === row.id} onClick={() => void acknowledge(row.id)} type="button">{thai ? "รับทราบ" : "Acknowledge"}</button>}</td></tr>)}</tbody></table></div><ClientTablePagination currentPage={pagination.page} currentPageSize={pagination.pageSize} disabled={loading} locale={locale} onPageChange={(page) => void load(page, pagination.pageSize, search)} onPageSizeChange={(pageSize) => void load(1, pageSize, search)} totalPages={pagination.totalPages} /></div></div>;
}
